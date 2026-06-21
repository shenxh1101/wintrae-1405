import React, { useMemo } from 'react';
import { View, Text, Button, usePullDownRefresh } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { growthStats, growthRecords } from '@/data/records';
import { useApp } from '@/store/AppContext';

const GrowthPage: React.FC = () => {
  const { eyeCareMode } = useApp();

  usePullDownRefresh(() => {
    console.log('[Growth] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: { day: number | null; hasRecord: boolean; isToday: boolean }[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, hasRecord: false, isToday: false });
    }
    
    const recordSet = new Set(growthRecords.map(r => r.date));
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({
        day: i,
        hasRecord: recordSet.has(dateStr),
        isToday: i === today.getDate()
      });
    }
    
    return days;
  }, []);

  const streakDays = useMemo(() => {
    let streak = 0;
    const today = new Date();
    const recordSet = new Set(growthRecords.map(r => r.date));
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (recordSet.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, []);

  const maxThemeCount = useMemo(() => {
    if (growthStats.favoriteThemes.length === 0) return 1;
    return Math.max(...growthStats.favoriteThemes.map(t => t.count));
  }, []);

  const maxCharCount = useMemo(() => {
    if (growthStats.favoriteCharacters.length === 0) return 1;
    return Math.max(...growthStats.favoriteCharacters.map(c => c.count));
  }, []);

  const handleShareReport = () => {
    console.log('[Growth] 分享月度阅读小报');
    Taro.showModal({
      title: '生成阅读小报',
      content: '即将生成月度阅读小报，可保存分享给好友哦~',
      confirmText: '生成',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '生成中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({
              title: '小报生成成功！',
              icon: 'success'
            });
          }, 1500);
        }
      }
    });
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.header}>
        <Text className={styles.title}>成长记录 🌟</Text>
        <Text className={styles.subtitle}>见证宝贝的每一次进步</Text>
      </View>

      <View className={styles.statsCards}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>
            {growthStats.totalDays}
            <Text className={styles.statUnit}>天</Text>
          </Text>
          <Text className={styles.statLabel}>累计阅读</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>
            {growthStats.totalBooks}
            <Text className={styles.statUnit}>本</Text>
          </Text>
          <Text className={styles.statLabel}>阅读绘本</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>
            {growthStats.totalMinutes}
            <Text className={styles.statUnit}>分钟</Text>
          </Text>
          <Text className={styles.statLabel}>总时长</Text>
        </View>
      </View>

      <View className={styles.reportCard}>
        <View className={styles.reportHeader}>
          <Text className={styles.reportTitle}>📰 月度阅读小报</Text>
          <Button className={styles.shareBtn} onClick={handleShareReport}>
            分享
          </Button>
        </View>
        <View className={styles.reportContent}>
          <View className={styles.reportItem}>
            <Text className={styles.reportItemValue}>{streakDays}天</Text>
            <Text className={styles.reportItemLabel}>连续阅读</Text>
          </View>
          <View className={styles.reportItem}>
            <Text className={styles.reportItemValue}>{growthStats.favoriteThemes[0]?.theme || '-'}</Text>
            <Text className={styles.reportItemLabel}>最爱主题</Text>
          </View>
          <View className={styles.reportItem}>
            <Text className={styles.reportItemValue}>{growthStats.favoriteCharacters[0]?.name || '-'}</Text>
            <Text className={styles.reportItemLabel}>人气角色</Text>
          </View>
        </View>
      </View>

      <View className={styles.calendarSection}>
        <View className={styles.calendarHeader}>
          <Text className={styles.calendarTitle}>📅 {currentMonth}</Text>
          <Text className={styles.streakText}>🔥 连续 {streakDays} 天</Text>
        </View>
        <View className={styles.calendarGrid}>
          {weekDays.map(day => (
            <Text key={day} className={styles.weekDay}>{day}</Text>
          ))}
          {calendarData.map((item, index) => (
            <View
              key={index}
              className={classnames(
                styles.calendarDay,
                item.day === null && styles.empty,
                item.hasRecord && styles.hasRecord,
                item.isToday && styles.today
              )}
            >
              {item.day}
            </View>
          ))}
        </View>
      </View>

      <Text className={styles.sectionTitle}>❤️ 喜欢的主题</Text>
      <View className={styles.rankSection}>
        <View className={styles.rankList}>
          {growthStats.favoriteThemes.map((theme, index) => (
            <View key={theme.theme} className={styles.rankItem}>
              <View
                className={classnames(
                  styles.rankNum,
                  index === 0 ? styles.top1 :
                  index === 1 ? styles.top2 :
                  index === 2 ? styles.top3 : styles.other
                )}
              >
                {index + 1}
              </View>
              <View className={styles.rankInfo}>
                <Text className={styles.rankName}>{theme.theme}</Text>
                <View className={styles.rankProgress}>
                  <View
                    className={styles.rankProgressFill}
                    style={{ width: `${(theme.count / maxThemeCount) * 100}%` }}
                  />
                </View>
              </View>
              <Text className={styles.rankCount}>{theme.count}次</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className={styles.sectionTitle}>🎭 常听的角色</Text>
      <View className={styles.rankSection}>
        <View className={styles.rankList}>
          {growthStats.favoriteCharacters.map((char, index) => (
            <View key={char.name} className={styles.rankItem}>
              <View
                className={classnames(
                  styles.rankNum,
                  index === 0 ? styles.top1 :
                  index === 1 ? styles.top2 :
                  index === 2 ? styles.top3 : styles.other
                )}
              >
                {index + 1}
              </View>
              <View className={styles.rankInfo}>
                <Text className={styles.rankName}>{char.name}</Text>
                <View className={styles.rankProgress}>
                  <View
                    className={styles.rankProgressFill}
                    style={{ width: `${(char.count / maxCharCount) * 100}%` }}
                  />
                </View>
              </View>
              <Text className={styles.rankCount}>{char.count}次</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className={styles.sectionTitle}>📚 阅读历史</Text>
      <View className={styles.historySection}>
        {growthRecords.length > 0 ? (
          <View className={styles.historyList}>
            {growthRecords.map((record, index) => (
              <View key={index} className={styles.historyItem}>
                <Text className={styles.historyDate}>{record.date}</Text>
                <Text className={styles.historyBook}>{record.bookTitle}</Text>
                <Text className={styles.historyDuration}>{record.duration}分钟</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            还没有阅读记录哦～\n快去读一本绘本吧！
          </View>
        )}
      </View>
    </View>
  );
};

export default GrowthPage;
