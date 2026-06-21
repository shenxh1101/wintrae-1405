import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Button, Slider, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import RecordItem from '@/components/RecordItem';
import { useApp } from '@/store/AppContext';
import { Recording } from '@/types';
import { formatDuration } from '@/utils';

const RECORDER_SAMPLE_RATE = 44100;
const RECORDER_NUMBER_OF_CHANNELS = 1;
const RECORDER_ENCODE_BIT_RATE = 48000;
const RECORDER_FORMAT = 'mp3';

const RecordingPage: React.FC = () => {
  const { recordings, addRecording, deleteRecording, eyeCareMode } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveBars, setWaveBars] = useState<number[]>(Array(40).fill(0));
  const [currentTitle, setCurrentTitle] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<{
    filePath: string;
    duration: number;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorderManagerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  const startWaveformAnimation = useCallback(() => {
    const animate = () => {
      setWaveBars(prev => {
        const newBars = [...prev];
        for (let i = 0; i < newBars.length; i++) {
          if (Math.random() > 0.3) {
            newBars[i] = Math.min(100, newBars[i] + Math.random() * 40);
          } else {
            newBars[i] = Math.max(5, newBars[i] - Math.random() * 30);
          }
        }
        return newBars;
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const startH5Recording = useCallback(async () => {
    try {
      console.log('[Recording] 启动H5录音...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else {
        mimeType = '';
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('[Recording] H5录音结束，数据块数:', audioChunksRef.current.length);
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const duration = recordingTime;
          setPendingAudio({
            filePath: base64,
            duration
          });
          setShowTitleModal(true);
          cleanup();
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start(100);
      startWaveformAnimation();
      return true;
    } catch (error) {
      console.error('[Recording] H5录音失败:', error);
      Taro.showToast({
        title: '麦克风权限被拒绝',
        icon: 'none'
      });
      return false;
    }
  }, [recordingTime, cleanup, startWaveformAnimation]);

  const startMiniProgramRecording = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      try {
        console.log('[Recording] 启动小程序录音...');
        const recorder = Taro.getRecorderManager();
        recorderManagerRef.current = recorder;

        recorder.onStart(() => {
          console.log('[Recording] 小程序录音开始');
          resolve(true);
        });

        recorder.onStop((res: any) => {
          console.log('[Recording] 小程序录音结束:', res);
          const duration = recordingTime;
          setPendingAudio({
            filePath: res.tempFilePath,
            duration
          });
          setShowTitleModal(true);
          cleanup();
        });

        recorder.onError((err: any) => {
          console.error('[Recording] 小程序录音错误:', err);
          Taro.showToast({ title: '录音出错', icon: 'none' });
          cleanup();
          setIsRecording(false);
          setRecordingTime(0);
          resolve(false);
        });

        recorder.start({
          duration: 600000,
          sampleRate: RECORDER_SAMPLE_RATE,
          numberOfChannels: RECORDER_NUMBER_OF_CHANNELS,
          encodeBitRate: RECORDER_ENCODE_BIT_RATE,
          format: RECORDER_FORMAT
        });

        startWaveformAnimation();
      } catch (error) {
        console.error('[Recording] 小程序录音启动失败:', error);
        cleanup();
        resolve(false);
      }
    });
  }, [recordingTime, cleanup, startWaveformAnimation]);

  const handleStart = async () => {
    if (isRecording) return;

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    };

    setIsRecording(true);
    setRecordingTime(0);
    startTimer();

    const env = Taro.getEnv();
    console.log('[Recording] 当前环境:', env);

    let success = false;
    if (env === Taro.ENV_TYPE.WEB) {
      success = await startH5Recording();
    } else {
      success = await startMiniProgramRecording();
    }

    if (!success) {
      setIsRecording(false);
      setRecordingTime(0);
      cleanup();
    }
  };

  const handleStop = () => {
    if (!isRecording) return;

    console.log('[Recording] 停止录音,时长:', recordingTime, '秒');
    const env = Taro.getEnv();

    if (env === Taro.ENV_TYPE.WEB) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      if (recorderManagerRef.current) {
        recorderManagerRef.current.stop();
      }
    }

    setIsRecording(false);
  };

  const handleSaveRecording = () => {
    if (!pendingAudio || !currentTitle.trim()) {
      Taro.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }

    const newRecording: Recording = {
      id: `rec_${Date.now()}`,
      title: currentTitle.trim(),
      duration: pendingAudio.duration,
      filePath: pendingAudio.filePath,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    addRecording(newRecording);
    setShowTitleModal(false);
    setCurrentTitle('');
    setPendingAudio(null);
    setWaveBars(Array(40).fill(0));
    setRecordingTime(0);

    Taro.showToast({ title: '已保存 ✨', icon: 'success' });
  };

  const handleCancelSave = () => {
    setShowTitleModal(false);
    setCurrentTitle('');
    setPendingAudio(null);
    setWaveBars(Array(40).fill(0));
    setRecordingTime(0);
  };

  useDidHide(() => {
    if (isRecording) {
      handleStop();
    }
  });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.header}>
        <Text className={styles.pageTitle}>🎙️ 录音室</Text>
        <Text className={styles.subTitle}>
          共 {recordings.length} 段录音 · 总时长 {formatDuration(totalDuration)}
        </Text>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{recordings.length}</Text>
          <Text className={styles.statLabel}>录音片段</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatDuration(totalDuration)}</Text>
          <Text className={styles.statLabel}>总时长</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>
            {recordings.length > 0 ? formatDuration(Math.round(totalDuration / recordings.length)) : '0:00'}
          </Text>
          <Text className={styles.statLabel}>平均时长</Text>
        </View>
      </View>

      <View className={styles.recorderSection}>
        <View className={styles.waveformContainer}>
          {isRecording ? (
            waveBars.map((height, i) => (
              <View
                key={i}
                className={classnames(styles.waveBar, styles.active)}
                style={{ height: `${height}%` }}
              />
            ))
          ) : (
            Array(40).fill(0).map((_, i) => (
              <View
                key={i}
                className={styles.waveBar}
                style={{ height: '8%' }}
              />
            ))
          )}
        </View>

        <Text className={styles.timeDisplay}>
          {formatDuration(recordingTime)}
        </Text>

        <View className={styles.controlRow}>
          {isRecording ? (
            <Button className={styles.stopBtn} onClick={handleStop}>
              ⏹ 停止录音
            </Button>
          ) : (
            <Button className={styles.recordBtn} onClick={handleStart}>
              ⏺ 开始录音
            </Button>
          )}
        </View>

        <Text className={styles.hint}>
          {isRecording ? '正在录下宝贝的声音...' : '点一下，开始讲故事吧！'}
        </Text>
      </View>

      <View className={styles.recordingsSection}>
        <Text className={styles.sectionTitle}>📋 录音记录</Text>
        {recordings.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎤</Text>
            <Text className={styles.emptyText}>还没有录音</Text>
            <Text className={styles.emptyHint}>
              录下宝贝讲故事的声音，留住珍贵瞬间
            </Text>
          </View>
        ) : (
          <ScrollView scrollY className={styles.recordingsList}>
            {recordings.map(recording => (
              <RecordItem
                key={recording.id}
                recording={recording}
                onDelete={deleteRecording}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {showTitleModal && (
        <View className={styles.modalOverlay}>
          <View className={styles.modal}>
            <Text className={styles.modalTitle}>💾 保存录音</Text>
            <Text className={styles.modalSubtitle}>
              时长：{formatDuration(pendingAudio?.duration || 0)}
            </Text>
            <View className={styles.inputWrapper}>
              <input
                className={styles.titleInput}
                value={currentTitle}
                onInput={(e: any) => setCurrentTitle(e.target.value)}
                placeholder="给这段录音起个名字吧~"
                maxLength={30}
              />
            </View>
            <View className={styles.modalActions}>
              <Button className={styles.cancelBtn} onClick={handleCancelSave}>
                取消
              </Button>
              <Button className={styles.saveBtn} onClick={handleSaveRecording}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecordingPage;
