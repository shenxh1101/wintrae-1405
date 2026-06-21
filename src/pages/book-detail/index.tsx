import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { books } from '@/data/books';
import { useApp } from '@/store/AppContext';

const BookDetailPage: React.FC = () => {
  const router = useRouter();
  const { books: appBooks, toggleFavorite, eyeCareMode } = useApp();

  const bookId = router.params.id;
  const book = useMemo(() => {
    return appBooks.find(b => b.id === bookId) || books[0];
  }, [appBooks, bookId]);

  const [isFavorited, setIsFavorited] = useState(book.isFavorite);

  const handleFavoriteToggle = () => {
    console.log('[BookDetail] 切换收藏:', book.title);
    toggleFavorite(book.id);
    setIsFavorited(!isFavorited);
    Taro.showToast({
      title: isFavorited ? '已取消收藏' : '已收藏 ❤️',
      icon: 'none'
    });
  };

  const handleStartReading = () => {
    console.log('[BookDetail] 开始阅读:', book.title);
    Taro.navigateTo({
      url: `/pages/reader/index?id=${book.id}`
    });
  };

  const allCharacters = useMemo(() => {
    const chars = new Set<string>();
    book.pages.forEach(p => p.characters.forEach(c => chars.add(c)));
    return Array.from(chars);
  }, [book.pages]);

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.heroSection}>
        <View className={styles.heroContent}>
          <View className={styles.cover}>
            <Image src={book.cover} mode="aspectFill" />
          </View>
          <View className={styles.bookInfo}>
            <Text className={styles.title}>{book.title}</Text>
            <Text className={styles.author}>作者：{book.author}</Text>
            <View className={styles.tags}>
              <View className={styles.tag}>{book.ageRange}</View>
              <View className={styles.tag}>{book.theme}</View>
              <View className={styles.tag}>{book.duration}分钟</View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.contentSection}>
          <View className={styles.infoCard}>
            <Text className={styles.sectionTitle}>📖 内容简介</Text>
            <Text className={styles.description}>{book.description}</Text>

            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <Text className={styles.infoValue}>{book.pages.length}</Text>
                <Text className={styles.infoLabel}>页数</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoValue}>{book.duration}</Text>
                <Text className={styles.infoLabel}>分钟</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoValue}>{allCharacters.length}</Text>
                <Text className={styles.infoLabel}>角色</Text>
              </View>
            </View>

            <View className={styles.keywordsSection}>
              <Text className={styles.sectionTitle}>✨ 重点词汇</Text>
              <View className={styles.keywordList}>
                {book.keywords.map((keyword, index) => (
                  <View key={index} className={styles.keywordTag}>
                    {keyword}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.previewSection}>
            <Text className={styles.sectionTitle}>🖼️ 内容预览</Text>
            <ScrollView scrollX className={styles.previewList}>
              {book.pages.map((page, index) => (
                <View key={page.id} className={styles.previewItem}>
                  <Image src={page.image} mode="aspectFill" />
                  <View className={styles.pageIndex}>第 {index + 1} 页</View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View className={styles.charactersSection}>
            <Text className={styles.sectionTitle}>🎭 故事角色</Text>
            <View className={styles.characterList}>
              {allCharacters.map((char, index) => (
                <View key={index} className={styles.characterTag}>
                  {char}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.favoriteBtn, isFavorited && styles.active)}
          onClick={handleFavoriteToggle}
        >
          {isFavorited ? '❤️' : '🤍'}
        </Button>
        <Button className={styles.readBtn} onClick={handleStartReading}>
          开始阅读
        </Button>
      </View>
    </View>
  );
};

export default BookDetailPage;
