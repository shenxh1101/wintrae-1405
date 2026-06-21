import React, { useMemo, useState } from 'react';
import { View, Text, Button, usePullDownRefresh, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import { formatDate } from '@/utils';

const GrowthPage: React.FC = () => {
  const { eyeCareMode, growthRecords, getGrowthStats, books } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const monthKey = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = (selectedMonth.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }, [selectedMonth]);

  const stats = getGrowthStats(monthKey);

  const canGoNext = useMemo(() => {
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${today.getMonth()}`;
    const selectedYearMonth = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`;
    return currentYearMonth !== selectedYearMonth;
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    console.log('[Growth] 切换到上一个月');
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    if (!canGoNext) {
      console.log('[Growth] 已到当前月，无法前进');
      return;
    }
    console.log('[Growth] 切换到下一个月');
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const displayMonth = useMemo(() => {
    return `${selectedMonth.getFullYear()}年${selectedMonth.getMonth() + 1}月`;
  }, [selectedMonth]);

  usePullDownRefresh(() => {
    console.log('[Growth] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const calendarData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days: { day: number | null; hasRecord: boolean; isToday: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, hasRecord: false, isToday: false });
    }

    const monthRecords = growthRecords.filter(r => r.date.startsWith(monthKey));
    const recordSet = new Set(monthRecords.map(r => r.date));

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === i;
      days.push({
        day: i,
        hasRecord: recordSet.has(dateStr),
        isToday
      });
    }

    return days;
  }, [growthRecords, selectedMonth, monthKey]);

  const streakDays = useMemo(() => {
    let streak = 0;
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthRecords = growthRecords.filter(r => r.date.startsWith(monthKey));
    const recordSet = new Set(monthRecords.map(r => r.date));

    let endDay = daysInMonth;
    const today = new Date();
    if (
      today.getFullYear() === year &&
      today.getMonth() === month
    ) {
      endDay = today.getDate();
    }

    for (let i = endDay; i >= 1; i--) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      if (recordSet.has(dateStr)) {
        streak++;
      } else if (i < endDay) {
        break;
      }
    }
    return streak;
  }, [growthRecords, selectedMonth, monthKey]);

  const sortedRecords = useMemo(() => {
    return growthRecords
      .filter(r => r.date.startsWith(monthKey))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [growthRecords, monthKey]);

  const monthlyBooks = useMemo(() => {
    const seen = new Map<string, { bookId: string; bookTitle: string; cover: string }>();
    growthRecords
      .filter(r => r.date.startsWith(monthKey))
      .forEach(record => {
        if (!seen.has(record.bookId)) {
          const book = books.find(b => b.id === record.bookId);
          seen.set(record.bookId, {
            bookId: record.bookId,
            bookTitle: record.bookTitle,
            cover: book?.cover || ''
          });
        }
      });
    return Array.from(seen.values());
  }, [growthRecords, books, monthKey]);

  const encouragement = useMemo(() => {
    const { totalDays, totalBooks, totalMinutes } = stats;
    if (totalDays === 0) {
      return '这个月还没开始阅读哦，快来开启阅读之旅吧~';
    }
    if (totalDays >= 20 && totalBooks >= 8) {
      return '太厉害了！你是阅读小达人，继续保持这份热情！🌟';
    }
    if (totalDays >= 15 && totalBooks >= 5) {
      return '坚持阅读的你超棒！下个月继续加油哦~ 💪';
    }
    if (totalDays >= 10) {
      return '你已经坚持阅读很多天啦，再努努力就能成为阅读冠军！🏆';
    }
    if (totalMinutes >= 100) {
      return '阅读时光超充实，每一分钟都在茁壮成长！🌱';
    }
    return '坚持阅读的你超厉害！继续加油哦~';
  }, [stats]);

  const maxThemeCount = useMemo(() => {
    if (stats.favoriteThemes.length === 0) return 1;
    return Math.max(...stats.favoriteThemes.map(t => t.count));
  }, [stats.favoriteThemes]);

  const maxCharCount = useMemo(() => {
    if (stats.favoriteCharacters.length === 0) return 1;
    return Math.max(...stats.favoriteCharacters.map(c => c.count));
  }, [stats.favoriteCharacters]);

  const handleShareReport = () => {
    console.log('[Growth] 分享月度阅读小报');
    const hasData = sortedRecords.length > 0;
    if (!hasData) {
      Taro.showToast({
        title: '先读一本书再来分享吧~',
        icon: 'none'
      });
      return;
    }
    setShareModalVisible(true);
  };

  const handleCloseShareModal = () => {
    console.log('[Growth] 关闭分享弹窗');
    setShareModalVisible(false);
  };

  const handleSaveToAlbum = async () => {
    console.log('[Growth] 保存到相册');
    const env = Taro.getEnv();
    Taro.showLoading({ title: '处理中...' });

    try {
      if (env === Taro.ENV_TYPE.WEAPP) {
        try {
          await Taro.authorize({ scope: 'scope.writePhotosAlbum' });
        } catch (e) {
          console.warn('[Growth] 授权被拒绝，尝试引导设置', e);
        }
        try {
          const query = Taro.createSelectorQuery();
          query.select('#shareReportCard').boundingClientRect();
          query.exec(async (res) => {
            try {
              if (res && res[0]) {
                const canvasRes = await Taro.canvasToTempFilePath({
                  x: res[0].left,
                  y: res[0].top,
                  width: res[0].width,
                  height: res[0].height,
                  destWidth: res[0].width * 2,
                  destHeight: res[0].height * 2
                });
                await Taro.saveImageToPhotosAlbum({
                  filePath: canvasRes.tempFilePath
                });
                Taro.hideLoading();
                Taro.showToast({ title: '保存成功！', icon: 'success' });
              } else {
                throw new Error('节点未找到');
              }
            } catch (err) {
              console.warn('[Growth] canvas保存失败，fallback提示', err);
              Taro.hideLoading();
              Taro.showToast({
                title: '请截图后手动保存~',
                icon: 'none',
                duration: 2000
              });
            }
          });
        } catch (err) {
          console.warn('[Growth] 小程序保存失败', err);
          Taro.hideLoading();
          Taro.showToast({
            title: '请截图后手动保存~',
            icon: 'none',
            duration: 2000
          });
        }
      } else {
        Taro.hideLoading();
        setTimeout(() => {
          Taro.showModal({
            title: '保存到相册',
            content: '长按下方卡片可保存到相册，或使用手机截图功能哦~',
            showCancel: false,
            confirmText: '知道了'
          });
          Taro.showToast({
            title: '长按卡片可保存~',
            icon: 'none',
            duration: 2000
          });
        }, 100);
      }
    } catch (e) {
      console.error('[Growth] 保存异常', e);
      Taro.hideLoading();
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  };

  const handleShareToFriend = () => {
    console.log('[Growth] 分享给朋友');
    const env = Taro.getEnv();

    if (env === Taro.ENV_TYPE.WEAPP) {
      try {
        Taro.showShareMenu({ withShareTicket: true });
        Taro.showToast({
          title: '请点击右上角...分享',
          icon: 'none',
          duration: 2000
        });
      } catch (e) {
        console.warn('[Growth] 小程序分享失败', e);
        Taro.showToast({
          title: '截图后发送给好友吧~',
          icon: 'none',
          duration: 2000
        });
      }
    } else {
      try {
        Taro.showShareImageMenu({});
      } catch (e) {
        console.warn('[Growth] H5分享菜单失败', e);
        Taro.showToast({
          title: '点击右上角...分享或截图',
          icon: 'none',
          duration: 2000
        });
      }
    }
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const topThemes = stats.favoriteThemes.slice(0, 3);
  const topChars = stats.favoriteCharacters.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const childName = '宝贝';

  return (
    <View
      className={styles.pageContainer}
      style={{ backgroundColor: eyeCareMode ? '#F5E6D3' : undefined }}
    >
      <View className={styles.header}>
        <Text className={styles.title}>成长记录 🌟</Text>
        <Text className={styles.subtitle}>见证宝贝的每一次进步</Text>
      </View>

      <View className={styles.monthSwitcher}>
        <Button
          className={styles.monthArrow}
          onClick={handlePrevMonth}
        >
          ‹
        </Button>
        <Text className={styles.monthLabel}>{displayMonth}</Text>
        <Button
          className={classnames(styles.monthArrow, !canGoNext && styles.monthArrowDisabled)}
          onClick={handleNextMonth}
          disabled={!canGoNext}
        >
          ›
        </Button>
      </View>

      <View className={styles.statsCards}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>
            {stats.totalDays}
            <Text className={styles.statUnit}>天</Text>
          </Text>
          <Text className={styles.statLabel}>累计阅读</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>
            {stats.totalBooks}
            <Text className={styles.statUnit}>本</Text>
          </Text>
          <Text className={styles.statLabel}>阅读绘本</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>
            {stats.totalMinutes}
            <Text className={styles.statUnit}>分钟</Text>
          </Text>
          <Text className={styles.statLabel}>总时长</Text>
        </View>
      </View>

      <View className={styles.reportCard}>
        <View className={styles.reportHeader}>
          <Text className={styles.reportTitle}>📰 {selectedMonth.getMonth() + 1}月阅读小报</Text>
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
            <Text className={styles.reportItemValue}>
              {stats.favoriteThemes.length > 0 ? stats.favoriteThemes[0].theme : '-'}
            </Text>
            <Text className={styles.reportItemLabel}>最爱主题</Text>
          </View>
          <View className={styles.reportItem}>
            <Text className={styles.reportItemValue}>
              {stats.favoriteCharacters.length > 0 ? stats.favoriteCharacters[0].name : '-'}
            </Text>
            <Text className={styles.reportItemLabel}>人气角色</Text>
          </View>
        </View>
      </View>

      <View className={styles.calendarSection}>
        <View className={styles.calendarHeader}>
          <Text className={styles.calendarTitle}>📅 {displayMonth}</Text>
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
          {stats.favoriteThemes.length > 0 ? (
            stats.favoriteThemes.map((theme, index) => (
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
            ))
          ) : (
            <View className={styles.emptyRank}>
              读完绘本后这里会显示你喜欢的主题哦~
            </View>
          )}
        </View>
      </View>

      <Text className={styles.sectionTitle}>🎭 常听的角色</Text>
      <View className={styles.rankSection}>
        <View className={styles.rankList}>
          {stats.favoriteCharacters.length > 0 ? (
            stats.favoriteCharacters.map((char, index) => (
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
            ))
          ) : (
            <View className={styles.emptyRank}>
              读完绘本后这里会出现常听的角色~
            </View>
          )}
        </View>
      </View>

      <Text className={styles.sectionTitle}>📚 阅读历史</Text>
      <View className={styles.historySection}>
        {sortedRecords.length > 0 ? (
          <View className={styles.historyList}>
            {sortedRecords.map((record, index) => (
              <View key={`${record.date}-${record.bookId}-${index}`} className={styles.historyItem}>
                <Text className={styles.historyDate}>{formatDate(record.date)}</Text>
                <Text className={styles.historyBook}>{record.bookTitle}</Text>
                <Text className={styles.historyDuration}>{record.duration}分钟</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            这个月还没有阅读记录哦~{'\n'}快去读一本绘本吧！
          </View>
        )}
      </View>

      {shareModalVisible && (
        <View className={styles.modalMask} onClick={handleCloseShareModal}>
          <View className={styles.modalWrap} onClick={e => e.stopPropagation()}>
            <View className={styles.modalClose} onClick={handleCloseShareModal}>
              ✕
            </View>

            <ScrollView scrollY className={styles.modalScroll}>
              <View id="shareReportCard" className={styles.shareReportCard}>
                <View className={styles.shareCardHeader}>
                  <Text className={styles.shareCardTitle}>📚 {childName}的阅读小报</Text>
                  <Text className={styles.shareCardSubtitle}>{displayMonth}</Text>
                </View>

                <View className={styles.shareCardStats}>
                  <View className={styles.shareStat}>
                    <Text className={styles.shareStatNum}>{stats.totalDays}</Text>
                    <Text className={styles.shareStatLabel}>累计阅读天</Text>
                  </View>
                  <View className={styles.shareStat}>
                    <Text className={styles.shareStatNum}>{stats.totalBooks}</Text>
                    <Text className={styles.shareStatLabel}>读完绘本</Text>
                  </View>
                  <View className={styles.shareStat}>
                    <Text className={styles.shareStatNum}>{stats.totalMinutes}</Text>
                    <Text className={styles.shareStatLabel}>总分钟</Text>
                  </View>
                </View>

                {monthlyBooks.length > 0 && (
                  <View className={styles.shareCardSection}>
                    <Text className={styles.shareSectionTitle}>📖 读过的绘本</Text>
                    <ScrollView scrollX className={styles.booksScroll}>
                      <View className={styles.booksRow}>
                        {monthlyBooks.map(book => (
                          <View key={book.bookId} className={styles.bookThumbCard}>
                            {book.cover ? (
                              <Image
                                src={book.cover}
                                className={styles.bookThumbImg}
                                mode="aspectFill"
                              />
                            ) : (
                              <View className={styles.bookThumbPlaceholder}>📕</View>
                            )}
                            <Text className={styles.bookThumbTitle}>{book.bookTitle}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {(topThemes.length > 0 || topChars.length > 0) && (
                  <View className={styles.shareCardSection}>
                    <View className={styles.shareRankWrap}>
                      {topThemes.length > 0 && (
                        <View className={styles.shareRankCol}>
                          <Text className={styles.shareSectionTitle}>❤️ 喜欢主题</Text>
                          {topThemes.map((theme, i) => (
                            <View key={theme.theme} className={styles.shareRankItem}>
                              <Text className={styles.shareRankMedal}>{medals[i]}</Text>
                              <Text className={styles.shareRankName}>{theme.theme}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {topChars.length > 0 && (
                        <View className={styles.shareRankCol}>
                          <Text className={styles.shareSectionTitle}>🎭 常听角色</Text>
                          {topChars.map((ch, i) => (
                            <View key={ch.name} className={styles.shareRankItem}>
                              <Text className={styles.shareRankMedal}>{medals[i]}</Text>
                              <Text className={styles.shareRankName}>{ch.name}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <View className={styles.shareEncourage}>
                  <Text className={styles.shareEncourageText}>{encouragement}</Text>
                </View>

                <View className={styles.shareCardFooter}>
                  <Text className={styles.shareFooterLogo}>🌙</Text>
                  <Text className={styles.shareFooterText}>来自 睡前故事共读App</Text>
                </View>
              </View>
            </ScrollView>

            <View className={styles.modalActions}>
              <Button className={styles.actionBtnSave} onClick={handleSaveToAlbum}>
                📥 保存到相册
              </Button>
              <Button className={styles.actionBtnShare} onClick={handleShareToFriend}>
                📤 分享给朋友
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default GrowthPage;
