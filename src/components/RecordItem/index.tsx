import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Recording } from '@/types';

interface RecordItemProps {
  recording: Recording;
  onDelete?: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const RecordItem: React.FC<RecordItemProps> = ({ recording, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlay = () => {
    console.log('[RecordItem] 播放录音:', recording.title);
    if (isPlaying) {
      setIsPlaying(false);
      setProgress(0);
      return;
    }
    setIsPlaying(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return 0;
        }
        return prev + (100 / recording.duration);
      });
    }, 1000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[RecordItem] 删除录音:', recording.title);
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${recording.title}"吗？`,
      confirmColor: '#EF5350',
      success: (res) => {
        if (res.confirm) {
          onDelete?.(recording.id);
          Taro.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  };

  return (
    <View className={styles.recordItem}>
      <Button
        className={classnames(styles.playIcon, isPlaying && styles.playing)}
        onClick={handlePlay}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </Button>

      <View className={styles.info}>
        <Text className={styles.title}>{recording.title}</Text>
        <Text className={styles.bookTitle}>📚 {recording.bookTitle}</Text>
        <View className={styles.meta}>
          <Text className={styles.duration}>⏱️ {formatDuration(recording.duration)}</Text>
          <Text className={styles.date}>📅 {recording.date}</Text>
        </View>
        <View className={classnames(styles.progressBar, isPlaying && styles.active)}>
          <View
            className={classnames(styles.progressFill, isPlaying && styles.active)}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <Button className={styles.deleteBtn} onClick={handleDelete}>
        🗑️
      </Button>
    </View>
  );
};

export default RecordItem;
