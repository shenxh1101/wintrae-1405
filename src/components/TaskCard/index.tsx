import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
}

const typeLabels: Record<string, string> = {
  retell: '📢 复述',
  find: '🔍 找一找',
  emotion: '😊 情绪',
  color: '🎨 涂色'
};

const difficultyLabels: Record<string, string> = {
  easy: '⭐ 简单',
  medium: '⭐⭐ 中等',
  hard: '⭐⭐⭐ 困难'
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const [completed, setCompleted] = useState(task.completed);

  const handleStart = () => {
    console.log('[TaskCard] 开始任务:', task.title);
    if (completed) {
      Taro.showToast({
        title: '已完成此任务',
        icon: 'none'
      });
      return;
    }
    Taro.showModal({
      title: '亲子时间',
      content: `准备开始"${task.title}"了吗？`,
      confirmText: '开始',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          setCompleted(true);
          onComplete?.(task.id);
          Taro.showToast({
            title: '任务完成！真棒！',
            icon: 'success'
          });
        }
      }
    });
  };

  return (
    <View className={classnames(styles.taskCard, completed && styles.completed)}>
      <View className={styles.header}>
        <View className={classnames(styles.typeBadge, styles[`type${task.type.charAt(0).toUpperCase() + task.type.slice(1)}`])}>
          {typeLabels[task.type]}
        </View>
        <View className={styles.difficultyBadge}>
          {difficultyLabels[task.difficulty]}
        </View>
      </View>

      <Text className={styles.title}>{task.title}</Text>
      <Text className={styles.description}>{task.description}</Text>

      <View className={styles.bookInfo}>
        <Text>📚 出自：{task.bookTitle}</Text>
      </View>

      <View className={styles.footer}>
        <Text className={classnames(styles.status, completed && styles.completed)}>
          {completed ? '✅ 已完成' : '⏳ 待完成'}
        </Text>
        <Button
          className={classnames(styles.startBtn, completed && styles.completed)}
          onClick={handleStart}
        >
          {completed ? '再来一次' : '开始任务'}
        </Button>
      </View>
    </View>
  );
};

export default TaskCard;
