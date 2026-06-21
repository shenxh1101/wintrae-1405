import React, { useState, useMemo } from 'react';
import { View, Text, Button, usePullDownRefresh } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { tasks as mockTasks } from '@/data/tasks';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/types';
import { useApp } from '@/store/AppContext';

const typeFilters = [
  { label: '全部任务', value: 'all' },
  { label: '📢 复述', value: 'retell' },
  { label: '🔍 找一找', value: 'find' },
  { label: '😊 情绪', value: 'emotion' },
  { label: '🎨 涂色', value: 'color' }
];

const TasksPage: React.FC = () => {
  const { eyeCareMode } = useApp();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedType, setSelectedType] = useState('all');

  usePullDownRefresh(() => {
    console.log('[Tasks] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const filteredTasks = useMemo(() => {
    if (selectedType === 'all') return tasks;
    return tasks.filter(task => task.type === selectedType);
  }, [tasks, selectedType]);

  const completedCount = useMemo(() => {
    return tasks.filter(t => t.completed).length;
  }, [tasks]);

  const handleTaskComplete = (taskId: string) => {
    console.log('[Tasks] 任务完成:', taskId);
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.header}>
        <Text className={styles.title}>亲子互动 👨‍👩‍👧</Text>
        <Text className={styles.subtitle}>读完故事，一起来玩游戏吧～</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{tasks.length}</Text>
          <Text className={styles.statLabel}>总任务</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{completedCount}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>
            {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
          </Text>
          <Text className={styles.statLabel}>完成率</Text>
        </View>
      </View>

      <View className={styles.typeTabs}>
        {typeFilters.map(filter => (
          <Button
            key={filter.value}
            className={classnames(styles.tabBtn, selectedType === filter.value && styles.active)}
            onClick={() => {
              console.log('[Tasks] 切换任务类型:', filter.label);
              setSelectedType(filter.value);
            }}
          >
            {filter.label}
          </Button>
        ))}
      </View>

      <Text className={styles.sectionTitle}>
        {selectedType === 'all' ? '今日任务' : typeFilters.find(f => f.value === selectedType)?.label}
      </Text>

      {filteredTasks.length > 0 ? (
        <View className={styles.taskList}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleTaskComplete}
            />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎉</Text>
          <Text className={styles.emptyText}>
            太棒了！\n这个类型的任务都完成啦～
          </Text>
        </View>
      )}
    </View>
  );
};

export default TasksPage;
