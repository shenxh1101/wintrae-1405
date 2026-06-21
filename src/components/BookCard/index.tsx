import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Book } from '@/types';
import { useApp } from '@/store/AppContext';

interface BookCardProps {
  book: Book;
  showSetPlan?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, showSetPlan = false }) => {
  const { toggleFavorite, setReadingPlan } = useApp();

  const handleCardClick = () => {
    console.log('[BookCard] 点击绘本:', book.title);
    Taro.navigateTo({
      url: `/pages/book-detail/index?id=${book.id}`
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[BookCard] 切换收藏:', book.title);
    toggleFavorite(book.id);
  };

  const handleSetPlanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[BookCard] 设置今晚阅读计划:', book.title);
    setReadingPlan(book.id, book.title);
    Taro.showToast({
      title: '已加入今晚阅读计划',
      icon: 'success'
    });
  };

  return (
    <View className={styles.bookCard} onClick={handleCardClick}>
      <View className={styles.cover}>
        <Image src={book.cover} mode="aspectFill" />
      </View>
      <View className={styles.info}>
        <View>
          <Text className={styles.title}>{book.title}</Text>
          <Text className={styles.author}>作者：{book.author}</Text>
          <Text className={styles.description}>{book.description}</Text>
          <View className={styles.tags}>
            <View className={classnames(styles.tag, styles.tagAge)}>{book.ageRange}</View>
            <View className={classnames(styles.tag, styles.tagTheme)}>{book.theme}</View>
          </View>
        </View>
        <View className={styles.footer}>
          <Text className={styles.duration}>约 {book.duration} 分钟</Text>
          <View style={{ display: 'flex', gap: '16rpx' }}>
            {showSetPlan && (
              <Button
                className={classnames(styles.favoriteBtn)}
                onClick={handleSetPlanClick}
              >
                📖
              </Button>
            )}
            <Button
              className={classnames(styles.favoriteBtn, book.isFavorite && styles.isFavorite)}
              onClick={handleFavoriteClick}
            >
              {book.isFavorite ? '❤️' : '🤍'}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookCard;
