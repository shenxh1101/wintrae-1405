import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button, Input, usePullDownRefresh } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { recordings as mockRecordings } from '@/data/records';
import RecordItem from '@/components/RecordItem';
import { Recording } from '@/types';
import { generateId, formatDate } from '@/utils';
import { useApp } from '@/store/AppContext';

type RecordingStatus = 'idle' | 'recording' | 'paused';

const RecordingPage: React.FC = () => {
  const { eyeCareMode } = useApp();
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  usePullDownRefresh(() => {
    console.log('[Recording] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(() => {
    console.log('[Recording] 开始录音');
    setStatus('recording');
    setDuration(0);
    Taro.showToast({
      title: '开始录音',
      icon: 'none'
    });
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const pauseRecording = useCallback(() => {
    console.log('[Recording] 暂停录音');
    setStatus('paused');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    Taro.showToast({
      title: '已暂停',
      icon: 'none'
    });
  }, []);

  const resumeRecording = useCallback(() => {
    console.log('[Recording] 继续录音');
    setStatus('recording');
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    console.log('[Recording] 停止录音，时长:', duration);
    setStatus('idle');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (duration > 0) {
      Taro.showModal({
        title: '保存录音',
        content: `录音时长 ${formatTime(duration)}，是否保存？`,
        success: (res) => {
          if (res.confirm) {
            const newRecording: Recording = {
              id: generateId(),
              title: title || `我的录音 ${recordings.length + 1}`,
              duration,
              date: formatDate(new Date()),
              bookTitle: '自定义故事'
            };
            setRecordings(prev => [newRecording, ...prev]);
            setTitle('');
            setDuration(0);
            Taro.showToast({
              title: '保存成功！',
              icon: 'success'
            });
          } else {
            setDuration(0);
          }
        }
      });
    }
  }, [duration, title, recordings.length]);

  const handleDelete = useCallback((id: string) => {
    console.log('[Recording] 删除录音:', id);
    setRecordings(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleRecordClick = () => {
    if (status === 'idle') {
      startRecording();
    } else if (status === 'recording') {
      pauseRecording();
    } else {
      resumeRecording();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return '正在录音，点击暂停...';
      case 'paused':
        return '已暂停，点击继续...';
      default:
        return '点击开始录音';
    }
  };

  const renderWaves = () => {
    return Array.from({ length: 20 }, (_, i) => (
      <View
        key={i}
        className={classnames(styles.waveBar, status === 'recording' && styles.active)}
      />
    ));
  };

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.header}>
        <Text className={styles.title}>我的录音 🎤</Text>
        <Text className={styles.subtitle}>记录宝贝讲故事的美好瞬间</Text>
      </View>

      <View className={styles.recordingArea}>
        <View
          className={classnames(
            styles.recordCircle,
            status === 'recording' && styles.recording,
            status === 'paused' && styles.paused
          )}
          onClick={handleRecordClick}
        >
          <Text className={styles.recordIcon}>
            {status === 'idle' ? '🎙️' : status === 'recording' ? '⏸️' : '▶️'}
          </Text>
        </View>

        <Text className={styles.timer}>{formatTime(duration)}</Text>
        <Text className={styles.statusText}>{getStatusText()}</Text>

        <View className={styles.waveContainer}>{renderWaves()}</View>

        <View className={styles.controlButtons}>
          {status !== 'idle' && (
            <Button
              className={classnames(styles.controlBtn, styles.stopBtn)}
              onClick={stopRecording}
            >
              ⏹️
            </Button>
          )}
        </View>
      </View>

      {status === 'idle' && (
        <View className={styles.inputSection}>
          <Text className={styles.inputLabel}>录音标题（可选）</Text>
          <Input
            className={styles.inputField}
            placeholder="给这段录音起个名字吧～"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={30}
          />
        </View>
      )}

      <View className={styles.sectionTitle}>
        <Text className={styles.sectionTitleText}>📼 我的录音</Text>
        <Text className={styles.recordCount}>共 {recordings.length} 条</Text>
      </View>

      {recordings.length > 0 ? (
        <View className={styles.recordList}>
          {recordings.map(recording => (
            <RecordItem
              key={recording.id}
              recording={recording}
              onDelete={handleDelete}
            />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎤</Text>
          <Text className={styles.emptyText}>
            还没有录音哦～\n快来录下宝贝讲故事的声音吧！
          </Text>
        </View>
      )}
    </View>
  );
};

export default RecordingPage;
