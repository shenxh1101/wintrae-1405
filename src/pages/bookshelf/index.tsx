import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Image, usePullDownRefresh } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import FilterBar from '@/components/FilterBar';
import BookCard from '@/components/BookCard';
import { ageOptions, themeOptions, durationOptions } from '@/data/books';
import { filterBooks } from '@/utils';

const BookshelfPage: React.FC = () => {
  const { books, readingPlan, eyeCareMode } = useApp();
  const [selectedAge, setSelectedAge] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);

  usePullDownRefresh(() => {
    console.log('[Bookshelf] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  });

  const filteredBooks = useMemo(() => {
    let result = filterBooks(books, selectedAge, selectedTheme, selectedDuration);
    if (showFavorites) {
      result = result.filter(book => book.isFavorite);
    }
    return result;
  }, [books, selectedAge, selectedTheme, selectedDuration, showFavorites]);

  const favoriteBooks = useMemo(() => {
    return books.filter(book => book.isFavorite);
  }, [books]);

  const planBook = useMemo(() => {
    if (!readingPlan) return null;
    return books.find(book => book.id === readingPlan.bookId);
  }, [books, readingPlan]);

  const handleStartReading = () => {
    if (!planBook) return;
    console.log('[Bookshelf] 开始阅读今晚计划:', planBook.title);
    Taro.navigateTo({
      url: `/pages/reader/index?id=${planBook.id}`
    });
  };

  const handleChoosePlan = () => {
    console.log('[Bookshelf] 选择今晚阅读计划');
    Taro.showToast({
      title: '在绘本列表中点击📖添加',
      icon: 'none',
      duration: 2000
    });
  };

  const toggleFavorites = () => {
    console.log('[Bookshelf] 切换收藏显示:', !showFavorites);
    setShowFavorites(!showFavorites);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.header}>
        <Text className={styles.greeting}>{getGreeting()}，小朋友 👋</Text>
        <Text className={styles.subGreeting}>今天想读什么故事呢？</Text>
      </View>

      {readingPlan && planBook ? (
        <View className={styles.tonightPlan}>
          <View className={styles.planHeader}>
            <Text className={styles.planTitle}>🌙 今晚阅读计划</Text>
            <Button className={styles.startBtn} onClick={handleStartReading}>
              开始阅读
            </Button>
          </View>
          <View className={styles.planContent}>
            <View className={styles.planCover}>
              <Image src={planBook.cover} mode="aspectFill" />
            </View>
            <View className={styles.planInfo}>
              <Text className={styles.planBookTitle}>{planBook.title}</Text>
              <Text className={styles.planDuration}>约 {planBook.duration} 分钟 · {planBook.ageRange}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className={styles.tonightPlan}>
          <View className={styles.emptyPlan}>
            <Text className={styles.emptyPlanText}>还没有设置今晚的阅读计划哦～</Text>
            <Button className={styles.planBtn} onClick={handleChoosePlan}>
              去选择
            </Button>
          </View>
        </View>
      )}

      <FilterBar
        ageOptions={ageOptions}
        themeOptions={themeOptions}
        durationOptions={durationOptions}
        selectedAge={selectedAge}
        selectedTheme={selectedTheme}
        selectedDuration={selectedDuration}
        onAgeChange={setSelectedAge}
        onThemeChange={setSelectedTheme}
        onDurationChange={setSelectedDuration}
      />

      <View className={styles.sectionTitle}>
        <Text className={styles.sectionTitleText}>
          {showFavorites ? '❤️ 我的收藏' : '📚 全部绘本'}
        </Text>
        <Text className={styles.favoriteCount} onClick={toggleFavorites}>
          {showFavorites ? '显示全部' : `收藏 ${favoriteBooks.length} 本`}
        </Text>
      </View>

      <ScrollView scrollY enableFlex>
        {filteredBooks.length > 0 ? (
          <View className={styles.bookList}>
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} showSetPlan={true} />
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              {showFavorites ? '还没有收藏的绘本哦\n快去发现喜欢的故事吧～' : '没有找到符合条件的绘本\n试试其他筛选条件吧～'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BookshelfPage;
