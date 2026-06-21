import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Recording } from '@/types';
import { formatDuration, formatDate } from '@/utils';

interface RecordItemProps {
  recording: Recording;
  onDelete: (id: string) => void;
}

const RecordItem: React.FC<RecordItemProps> = ({ recording, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const innerAudioRef = useRef<any>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);

  const stopWebAudioSource = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      try { sourceRef.current.onended = null; } catch (e) {}
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current = null;
    }
  }, []);

  const cleanupInnerAudio = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    if (innerAudioRef.current) {
      try { innerAudioRef.current.stop(); } catch (e) {}
      try { innerAudioRef.current.destroy(); } catch (e) {}
      innerAudioRef.current = null;
    }
  }, []);

  const fullCleanup = useCallback(() => {
    stopWebAudioSource();
    cleanupInnerAudio();
    isPlayingRef.current = false;
  }, [stopWebAudioSource, cleanupInnerAudio]);

  const playWebAudio = useCallback(async () => {
    try {
      if (!audioBufferRef.current) {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const response = await fetch(recording.filePath);
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioCtxRef.current.decodeAudioData(arrayBuffer.slice(0));
      }

      stopWebAudioSource();

      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioCtxRef.current.destination);
      sourceRef.current = source;

      const startOffset = pausedAtRef.current;
      startTimeRef.current = audioCtxRef.current.currentTime - startOffset;

      source.onended = () => {
        if (isPlayingRef.current) {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
          pausedAtRef.current = 0;
          isPlayingRef.current = false;
        }
      };

      source.start(0, startOffset);
      isPlayingRef.current = true;
      setIsPlaying(true);

      const duration = audioBufferRef.current.duration;
      const updateProgress = () => {
        if (audioCtxRef.current && isPlayingRef.current) {
          const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
          if (elapsed <= duration) {
            setCurrentTime(elapsed);
            setProgress((elapsed / duration) * 100);
            animationFrameRef.current = requestAnimationFrame(updateProgress);
          }
        }
      };
      updateProgress();
    } catch (error) {
      console.error('[RecordItem] WebAudio播放失败:', error);
      Taro.showToast({ title: '播放失败', icon: 'none' });
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [recording.filePath, stopWebAudioSource]);

  const pauseWebAudio = useCallback(() => {
    if (audioCtxRef.current && audioBufferRef.current) {
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      pausedAtRef.current = Math.min(elapsed, audioBufferRef.current.duration);
      stopWebAudioSource();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [stopWebAudioSource]);

  const playInnerAudio = useCallback(() => {
    try {
      cleanupInnerAudio();

      const audio = Taro.createInnerAudioContext();
      innerAudioRef.current = audio;
      audio.src = recording.filePath;

      if (pausedAtRef.current > 0) {
        audio.startTime = pausedAtRef.current;
      }

      audio.onCanplay(() => {
        audio.play();
      });

      audio.onPlay(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
      });

      audio.onPause(() => {
        if (innerAudioRef.current) {
          pausedAtRef.current = innerAudioRef.current.currentTime;
        }
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
      });

      audio.onStop(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        pausedAtRef.current = 0;
        isPlayingRef.current = false;
        cleanupInnerAudio();
      });

      audio.onEnded(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        pausedAtRef.current = 0;
        isPlayingRef.current = false;
        cleanupInnerAudio();
      });

      audio.onError((err) => {
        console.error('[RecordItem] InnerAudio错误:', err);
        Taro.showToast({ title: '播放失败', icon: 'none' });
        setIsPlaying(false);
        isPlayingRef.current = false;
        cleanupInnerAudio();
      });

      updateIntervalRef.current = setInterval(() => {
        if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          setCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 100);
    } catch (error) {
      console.error('[RecordItem] InnerAudio播放失败:', error);
      Taro.showToast({ title: '播放失败', icon: 'none' });
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [recording.filePath, cleanupInnerAudio]);

  const pauseInnerAudio = useCallback(() => {
    if (innerAudioRef.current) {
      pausedAtRef.current = innerAudioRef.current.currentTime;
      innerAudioRef.current.pause();
    }
  }, []);

  const handlePlayPause = () => {
    const env = Taro.getEnv();
    if (isPlaying) {
      if (env === Taro.ENV_TYPE.WEB) {
        pauseWebAudio();
      } else {
        pauseInnerAudio();
      }
    } else {
      if (env === Taro.ENV_TYPE.WEB) {
        playWebAudio();
      } else {
        playInnerAudio();
      }
    }
  };

  const handleDelete = () => {
    const wasPlaying = isPlayingRef.current;
    if (wasPlaying) {
      fullCleanup();
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
      pausedAtRef.current = 0;
    }

    Taro.showModal({
      title: '删除录音',
      content: `确定删除「${recording.title}」吗？`,
      confirmText: '删除',
      confirmColor: '#FF5252',
      success: (res) => {
        if (res.confirm) {
          onDelete(recording.id);
        }
      }
    });
  };

  useEffect(() => {
    return () => {
      fullCleanup();
    };
  }, [fullCleanup]);

  const displayDuration = Math.max(recording.duration, 0);
  const displayCurrentTime = Math.min(Math.round(currentTime), displayDuration);

  return (
    <View className={styles.recordItem}>
      <View className={styles.recordInfo}>
        <View className={styles.recordHeader}>
          <Text className={styles.recordTitle}>{recording.title}</Text>
          <Text className={styles.recordDate}>{formatDate(recording.createdAt)}</Text>
        </View>

        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </View>

        <View className={styles.timeRow}>
          <Text className={styles.timeLabel}>
            {formatDuration(displayCurrentTime)}
          </Text>
          <Text className={styles.timeLabel}>
            {formatDuration(displayDuration)}
          </Text>
        </View>
      </View>

      <View className={styles.actionBtns}>
        <Button
          className={classnames(styles.playBtn, isPlaying && styles.playing)}
          onClick={handlePlayPause}
        >
          {isPlaying ? '⏸' : '▶'}
        </Button>
        <Button
          className={styles.deleteBtn}
          onClick={handleDelete}
        >
          🗑️
        </Button>
      </View>
    </View>
  );
};

export default RecordItem;
