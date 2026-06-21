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

  const cleanupWebAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
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

  const cleanup = useCallback(() => {
    cleanupWebAudio();
    cleanupInnerAudio();
  }, [cleanupWebAudio, cleanupInnerAudio]);

  const playWebAudio = useCallback(async () => {
    try {
      if (!audioBufferRef.current) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const response = await fetch(recording.filePath);
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioCtxRef.current.decodeAudioData(arrayBuffer.slice(0));
      }

      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch (e) {}
      }

      const source = audioCtxRef.current!.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioCtxRef.current!.destination);
      sourceRef.current = source;

      const startOffset = pausedAtRef.current;
      startTimeRef.current = audioCtxRef.current!.currentTime - startOffset;

      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        pausedAtRef.current = 0;
        cleanupWebAudio();
      };

      source.start(0, startOffset);

      const updateProgress = () => {
        if (audioCtxRef.current && audioBufferRef.current) {
          const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
          const duration = audioBufferRef.current.duration;
          if (elapsed <= duration) {
            setCurrentTime(elapsed);
            setProgress((elapsed / duration) * 100);
            animationFrameRef.current = requestAnimationFrame(updateProgress);
          }
        }
      };
      updateProgress();

      setIsPlaying(true);
    } catch (error) {
      console.error('[RecordItem] WebAudio播放失败:', error);
      Taro.showToast({ title: '播放失败', icon: 'none' });
      setIsPlaying(false);
    }
  }, [recording.filePath, cleanupWebAudio]);

  const pauseWebAudio = useCallback(() => {
    if (audioCtxRef.current && audioBufferRef.current && sourceRef.current) {
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      pausedAtRef.current = Math.min(elapsed, audioBufferRef.current.duration);
      cleanupWebAudio();
      setIsPlaying(false);
    }
  }, [cleanupWebAudio]);

  const playInnerAudio = useCallback(() => {
    try {
      const audio = Taro.createInnerAudioContext();
      innerAudioRef.current = audio;
      audio.src = recording.filePath;

      audio.onCanplay(() => {
        audio.play();
      });

      audio.onPlay(() => {
        setIsPlaying(true);
      });

      audio.onPause(() => {
        setIsPlaying(false);
      });

      audio.onStop(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        cleanupInnerAudio();
      });

      audio.onEnded(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        cleanupInnerAudio();
      });

      audio.onError((err) => {
        console.error('[RecordItem] InnerAudio错误:', err);
        Taro.showToast({ title: '播放失败', icon: 'none' });
        setIsPlaying(false);
        cleanupInnerAudio();
      });

      updateIntervalRef.current = setInterval(() => {
        if (audio && audio.duration) {
          setCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 100);
    } catch (error) {
      console.error('[RecordItem] InnerAudio播放失败:', error);
      Taro.showToast({ title: '播放失败', icon: 'none' });
      setIsPlaying(false);
    }
  }, [recording.filePath, cleanupInnerAudio]);

  const pauseInnerAudio = useCallback(() => {
    if (innerAudioRef.current) {
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
    Taro.showModal({
      title: '删除录音',
      content: `确定删除「${recording.title}」吗？`,
      confirmText: '删除',
      confirmColor: '#FF5252',
      success: (res) => {
        if (res.confirm) {
          cleanup();
          onDelete(recording.id);
        }
      }
    });
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
            {formatDuration(Math.round(currentTime))}
          </Text>
          <Text className={styles.timeLabel}>
            {formatDuration(recording.duration)}
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
