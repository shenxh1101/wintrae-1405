import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, Image, Button, Swiper, SwiperItem, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { books } from '@/data/books';
import { useApp } from '@/store/AppContext';
import { KeyWord, QuestionCard } from '@/types';
import { speak, stopSpeaking, initCharacterVoices, isSpeechSupported } from '@/utils/speech';

const ReaderPage: React.FC = () => {
  const router = useRouter();
  const {
    books: appBooks,
    toggleFavorite,
    brightness,
    eyeCareMode,
    readingPlan,
    addGrowthRecord,
    completeReadingPlan,
    addBookmark,
    removeBookmark,
    getBookmarks,
    saveReadingProgress,
    addNote,
    getNotes,
    getReadingProgress
  } = useApp();

  const [currentPage, setCurrentPage] = useState(0);
  const [hideText, setHideText] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completedRecorded, setCompletedRecorded] = useState(false);
  const [pageHasBookmark, setPageHasBookmark] = useState(false);
  const [showBookmarkList, setShowBookmarkList] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [pageHasNote, setPageHasNote] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [progressRestored, setProgressRestored] = useState(false);

  const readStartTimeRef = useRef<number>(Date.now());

  const bookId = router.params.id;
  const book = useMemo(() => {
    return appBooks.find(b => b.id === bookId) || books[0];
  }, [appBooks, bookId]);

  const pages = book.pages;
  const currentPageData = pages[currentPage];
  const totalPages = pages.length;

  useEffect(() => {
    setIsFavorited(book.isFavorite);
  }, [book.isFavorite]);

  const allCharacters = useMemo(() => {
    const chars = new Set<string>();
    pages.forEach(p => p.characters.forEach(c => chars.add(c)));
    return Array.from(chars);
  }, [pages]);

  useEffect(() => {
    const supported = isSpeechSupported();
    console.log('[Reader] 语音朗读支持:', supported);
    setSpeechAvailable(supported);
    initCharacterVoices(allCharacters);

    return () => {
      console.log('[Reader] 页面卸载，停止朗读');
      stopSpeaking();
    };
  }, [allCharacters]);

  useEffect(() => {
    if (progressRestored) return;

    const progress = getReadingProgress(book.id);
    console.log('[Reader] 获取阅读进度:', progress);
    if (progress && progress.lastPage > 0 && progress.lastPage < totalPages) {
      Taro.showModal({
        title: '继续阅读',
        content: `上次读到第${progress.lastPage + 1}页，是否继续？`,
        success: (res) => {
          if (res.confirm) {
            console.log('[Reader] 跳转到上次阅读页:', progress.lastPage);
            setCurrentPage(progress.lastPage);
          }
        }
      });
    }
    setProgressRestored(true);
  }, [book.id, progressRestored, getReadingProgress, totalPages]);

  useEffect(() => {
    console.log('[Reader] currentPage变化:', currentPage, ', 保存阅读进度');
    saveReadingProgress(book.id, currentPage, totalPages);

    const bookmark = getBookmarks(book.id).find(b => b.pageIndex === currentPage);
    setPageHasBookmark(!!bookmark);
    console.log('[Reader] 当前页书签状态:', !!bookmark);

    const notes = getNotes(book.id);
    const pageNote = notes.find(n => n.pageIndex === currentPage);
    setPageHasNote(!!pageNote && !!pageNote.content);
    console.log('[Reader] 当前页笔记状态:', !!pageNote);
  }, [currentPage, book.id, totalPages, saveReadingProgress, getBookmarks, getNotes]);

  useEffect(() => {
    if (showNoteModal) {
      const notes = getNotes(book.id);
      const pageNote = notes.find(n => n.pageIndex === currentPage);
      setNoteContent(pageNote ? pageNote.content : '');
      console.log('[Reader] 打开笔记弹窗，当前内容:', pageNote?.content || '(空)');
    }
  }, [showNoteModal, book.id, currentPage, getNotes]);

  const showToastMessage = useCallback((text: string) => {
    setToastText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  }, []);

  const recordGrowth = useCallback(() => {
    if (completedRecorded) return;

    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - readStartTimeRef.current) / 1000)
    );
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const today = new Date().toISOString().split('T')[0];

    console.log('[Reader] 阅读完成，沉淀成长记录:', {
      book: book.title,
      duration: durationMinutes,
      elapsedSeconds
    });

    addGrowthRecord({
      date: today,
      bookId: book.id,
      bookTitle: book.title,
      duration: Math.min(durationMinutes, book.duration),
      completed: true,
      themes: [book.theme],
      characters: Array.from(new Set(pages.flatMap(p => p.characters)))
    });

    if (readingPlan && readingPlan.bookId === book.id && !readingPlan.completed) {
      console.log('[Reader] 今晚阅读计划完成:', readingPlan.bookTitle);
      completeReadingPlan();
    }

    setCompletedRecorded(true);
  }, [
    completedRecorded,
    book,
    pages,
    addGrowthRecord,
    readingPlan,
    completeReadingPlan
  ]);

  const handleSwiperChange = useCallback((e: { detail: { current: number }) => {
    const newPage = e.detail.current;
    console.log('[Reader] 翻页到:', newPage + 1, '/', totalPages);
    stopSpeaking();
    setCurrentPage(newPage);
    setSelectedAnswer(null);

    if (pages[newPage]?.question) {
      setTimeout(() => {
        console.log('[Reader] 显示提问卡');
        setShowQuestion(true);
      }, 500);
    }

    if (newPage === totalPages - 1) {
      setTimeout(() => {
        console.log('[Reader] 已到达最后一页，显示完成弹窗');
        recordGrowth();
        setShowComplete(true);
      }, 1500);
    }
  }, [pages, totalPages, recordGrowth]);

  const handleKeyWordClick = useCallback((keyword: KeyWord) => {
    console.log('[Reader] 点击关键词:', keyword.word);
    if (!speechAvailable) {
      showToastMessage('当前环境不支持语音朗读');
      return;
    }
    speak(keyword.word, selectedCharacter || undefined).then(ok => {
      if (ok) {
        showToastMessage(`正在朗读：${keyword.word}`);
      } else {
        showToastMessage('语音朗读暂不可用，请检查设备设置');
      }
    });
  }, [selectedCharacter, showToastMessage, speechAvailable]);

  const handleAnswerSelect = useCallback((index: number) => {
    if (!currentPageData.question) return;
    console.log('[Reader] 选择答案:', index);
    setSelectedAnswer(index);

    if (index === currentPageData.question.answer) {
      showToastMessage('🎉 回答正确！真棒！');
    } else {
      showToastMessage('💡 再想想哦～');
    }
  }, [currentPageData, showToastMessage]);

  const handleCloseQuestion = useCallback(() => {
    console.log('[Reader] 关闭提问卡');
    setShowQuestion(false);
    setSelectedAnswer(null);
  }, []);

  const handleHideTextToggle = useCallback(() => {
    console.log('[Reader] 切换隐藏文字模式:', !hideText);
    setHideText(!hideText);
    showToastMessage(hideText ? '显示文字' : '隐藏文字，看图讲故事吧～');
  }, [hideText, showToastMessage]);

  const handleCharacterToggle = useCallback(() => {
    console.log('[Reader] 切换角色语音');
    setShowCharacterSelector(!showCharacterSelector);
  }, [showCharacterSelector]);

  const handleCharacterSelect = useCallback((character: string) => {
    console.log('[Reader] 选择角色语音:', character);
    setSelectedCharacter(character);
    if (speechAvailable) {
      speak(`切换到${character}的声音啦`, character).then(ok => {
        if (!ok) {
          showToastMessage(`${character} 的声音暂不可用`);
        }
      });
    }
    showToastMessage(`切换到 ${character} 的声音`);
    setShowCharacterSelector(false);
  }, [showToastMessage, speechAvailable]);

  const handleShowQuestion = useCallback(() => {
    if (currentPageData.question) {
      console.log('[Reader] 显示提问卡');
      setShowQuestion(true);
    } else {
      showToastMessage('这一页没有问题哦～');
    }
  }, [currentPageData, showToastMessage]);

  const handleFavoriteToggle = useCallback(() => {
    console.log('[Reader] 切换收藏');
    toggleFavorite(book.id);
    setIsFavorited(!isFavorited);
    showToastMessage(isFavorited ? '已取消收藏' : '已收藏 ❤️');
  }, [book.id, isFavorited, toggleFavorite, showToastMessage]);

  const handleBack = useCallback(() => {
    console.log('[Reader] 返回书架');
    stopSpeaking();
    Taro.navigateBack();
  }, []);

  const handleContinueTasks = useCallback(() => {
    console.log('[Reader] 前往亲子任务');
    setShowComplete(false);
    Taro.switchTab({ url: '/pages/tasks/index' });
  }, []);

  const handleContinueReading = useCallback(() => {
    console.log('[Reader] 继续阅读更多');
    setShowComplete(false);
    Taro.navigateBack();
  }, []);

  const handleRestart = useCallback(() => {
    console.log('[Reader] 再读一遍');
    setShowComplete(false);
    setCurrentPage(0);
    readStartTimeRef.current = Date.now();
    setCompletedRecorded(false);
  }, []);

  const handleSpeakPage = useCallback(() => {
    console.log('[Reader] 朗读本页，角色:', selectedCharacter);
    if (!speechAvailable) {
      showToastMessage('当前环境不支持语音朗读');
      return;
    }
    speak(currentPageData.text, selectedCharacter || undefined).then(ok => {
      if (ok) {
        showToastMessage('正在朗读本页...');
      } else {
        showToastMessage('语音朗读暂不可用，请检查设备设置');
      }
    });
  }, [currentPageData, selectedCharacter, showToastMessage, speechAvailable]);

  const handleBookmarkToggle = useCallback(() => {
    if (pageHasBookmark) {
      console.log('[Reader] 移除书签，页:', currentPage);
      removeBookmark(book.id, currentPage);
      setPageHasBookmark(false);
      showToastMessage('已移除书签');
    } else {
      console.log('[Reader] 添加书签，页:', currentPage);
      addBookmark({
        bookId: book.id,
        pageIndex: currentPage,
        note: '',
        createdAt: new Date().toISOString()
      });
      setPageHasBookmark(true);
      showToastMessage('已添加书签');
    }
  }, [pageHasBookmark, currentPage, book.id, removeBookmark, addBookmark, showToastMessage]);

  const handleOpenNoteModal = useCallback(() => {
    console.log('[Reader] 打开笔记弹窗');
    setShowNoteModal(true);
  }, []);

  const handleCloseNoteModal = useCallback(() => {
    console.log('[Reader] 关闭笔记弹窗');
    setShowNoteModal(false);
  }, []);

  const handleSaveNote = useCallback(() => {
    console.log('[Reader] 保存笔记，内容:', noteContent);
    addNote(book.id, currentPage, noteContent);
    setPageHasNote(!!noteContent && noteContent.trim().length > 0);
    setShowNoteModal(false);
    showToastMessage('已保存笔记');
  }, [book.id, currentPage, noteContent, addNote, showToastMessage]);

  const handleOpenBookmarkList = useCallback(() => {
    console.log('[Reader] 打开书签列表');
    setShowBookmarkList(true);
  }, []);

  const handleCloseBookmarkList = useCallback(() => {
    console.log('[Reader] 关闭书签列表');
    setShowBookmarkList(false);
  }, []);

  const handleJumpToBookmark = useCallback((pageIndex: number) => {
    console.log('[Reader] 跳转书签页:', pageIndex);
    stopSpeaking();
    setCurrentPage(pageIndex);
    setShowBookmarkList(false);
  }, []);

  const renderTextWithKeywords = useCallback((text: string, keywords: KeyWord[]) => {
    if (keywords.length === 0) return text;

    const sortedKeywords = [...keywords].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedKeywords.forEach((keyword, idx) => {
      if (keyword.startIndex > lastIndex) {
        elements.push(
          <Text key={`text-${idx}`}>
            {text.slice(lastIndex, keyword.startIndex)}
          </Text>
        );
      }
      elements.push(
        <Text
          key={`kw-${idx}`}
          className={styles.keyWord}
          onClick={() => handleKeyWordClick(keyword)}
        >
          {keyword.word}
        </Text>
      );
      lastIndex = keyword.endIndex;
    });

    if (lastIndex < text.length) {
      elements.push(
        <Text key="text-end">{text.slice(lastIndex)}</Text>
      );
    }

    return elements;
  }, [handleKeyWordClick]);

  const progress = useMemo(() => {
    return ((currentPage + 1) / pages.length) * 100;
  }, [currentPage, pages.length]);

  const brightnessStyle = useMemo(() => {
    return {
      filter: `brightness(${brightness}%)`
    };
  }, [brightness]);

  return (
    <View
      className={styles.readerContainer}
      style={{
        backgroundColor: eyeCareMode ? '#F5E6D3' : undefined
      }}
    >
      <View className={styles.customNav}>
        <View className={styles.navLeft}>
          <Button className={styles.backBtn} onClick={handleBack}>
            ←
          </Button>
          <Text className={styles.bookTitle}>{book.title}</Text>
        </View>
        <View className={styles.navRight}>
          <Button
            className={classnames(styles.navBtn, pageHasBookmark && styles.active)}
            onClick={handleBookmarkToggle}
          >
            🔖
          </Button>
          <Button
            className={classnames(styles.navBtn, isFavorited && styles.active)}
            onClick={handleFavoriteToggle}
          >
            {isFavorited ? '❤️' : '🤍'}
          </Button>
        </View>
      </View>

      <View className={styles.pageContainer} style={brightnessStyle}>
        <Swiper
          className={styles.swiperWrapper}
          current={currentPage}
          onChange={handleSwiperChange}
          duration={300}
          indicatorDots={false}
        >
          {pages.map((page, index) => (
            <SwiperItem key={page.id}>
              <View className={classnames(styles.pageCard, styles.pageFlip)}>
                <View className={styles.pageImage}>
                  <Image src={page.image} mode="aspectFill" />
                </View>
                <View className={classnames(styles.textContent, hideText && styles.hiddenText)}>
                  <Text className={styles.textContentInner}>
                    {renderTextWithKeywords(page.text, page.keyWords)}
                  </Text>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      <View className={styles.toolbar}>
        <View className={styles.toolbarRow}>
          <Text className={styles.pageIndicator}>
            {currentPage + 1} / {pages.length}
          </Text>
          <View className={styles.toolButtons}>
            <Button
              className={classnames(styles.toolBtn, hideText && styles.active)}
              onClick={handleHideTextToggle}
            >
              👁️ {hideText ? '显示' : '隐藏'}
            </Button>
            <Button
              className={classnames(styles.toolBtn, showCharacterSelector && styles.active)}
              onClick={handleCharacterToggle}
            >
              🎭 角色
            </Button>
            <Button
              className={styles.toolBtn}
              onClick={handleShowQuestion}
            >
              ❓ 提问
            </Button>
            <Button
              className={styles.toolBtn}
              onClick={handleSpeakPage}
            >
              🔊 朗读本页
            </Button>
            <View style={{ position: 'relative' }}>
              <Button
                className={styles.toolBtn}
                onClick={handleOpenNoteModal}
              >
                📝 笔记
              </Button>
              {pageHasNote && (
                <View style={{
                  position: 'absolute',
                  top: '4rpx',
                  right: '12rpx',
                  width: '16rpx',
                  height: '16rpx',
                  borderRadius: '8rpx',
                  backgroundColor: '#FF5252'
                }} />
              )}
            </View>
            <Button
              className={styles.toolBtn}
              onClick={handleOpenBookmarkList}
            >
              📚 书签列表
            </Button>
          </View>
        </View>
        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {showCharacterSelector && (
        <View className={styles.characterSelector}>
          <Text className={styles.selectorTitle}>选择角色语音</Text>
          <View className={styles.characterList}>
            {allCharacters.map(char => (
              <Button
                key={char}
                className={classnames(styles.characterBtn, selectedCharacter === char && styles.active)}
                onClick={() => handleCharacterSelect(char)}
              >
                {char}
              </Button>
            ))}
          </View>
        </View>
      )}

      {showQuestion && currentPageData.question && (
        <QuestionModal
          question={currentPageData.question}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onClose={handleCloseQuestion}
        />
      )}

      {showNoteModal && (
        <View className={styles.questionModal}>
          <View className={styles.questionCard}>
            <View className={styles.questionHeader}>
              <Text className={styles.questionIcon}>📝</Text>
              <Text className={styles.questionTitle}>家长笔记 - 第{currentPage + 1}页</Text>
            </View>
            <Textarea
              className={styles.noteTextarea}
              placeholder="在这里记录笔记、心得或给孩子的话..."
              value={noteContent}
              onInput={(e: any) => setNoteContent(e.detail.value)}
              maxlength={500}
              autoHeight
            />
            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button
                style={{
                  flex: 1,
                  height: '80rpx',
                  lineHeight: '80rpx',
                  borderRadius: '40rpx',
                  backgroundColor: '#F5F5F5',
                  color: '#666',
                  fontSize: '28rpx'
                }}
                onClick={handleCloseNoteModal}
              >
                关闭
              </Button>
              <Button
                style={{
                  flex: 1,
                  height: '80rpx',
                  lineHeight: '80rpx',
                  borderRadius: '40rpx',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  fontSize: '28rpx'
                }}
                onClick={handleSaveNote}
              >
                💾 保存笔记
              </Button>
            </View>
          </View>
        </View>
      )}

      {showBookmarkList && (
        <View className={styles.questionModal}>
          <View className={styles.questionCard}>
            <View className={styles.questionHeader}>
              <Text className={styles.questionIcon}>📚</Text>
              <Text className={styles.questionTitle}>书签列表</Text>
            </View>
            <View className={styles.bookmarkList}>
              {getBookmarks(book.id).length === 0 ? (
                <View style={{ padding: '40rpx 0', textAlign: 'center' }}>
                  <Text style={{ fontSize: '32rpx', color: '#999' }}>还没有书签，快去添加吧～</Text>
                </View>
              ) : (
                getBookmarks(book.id)
                  .sort((a, b) => a.pageIndex - b.pageIndex)
                  .map((bookmark, idx) => (
                    <Button
                      key={idx}
                      className={styles.bookmarkItem}
                      onClick={() => handleJumpToBookmark(bookmark.pageIndex)}
                    >
                      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Text style={{ fontSize: '30rpx', fontWeight: 'bold', color: '#333' }}>
                          📖 第{bookmark.pageIndex + 1}页
                        </Text>
                        {bookmark.note && bookmark.note.length > 0 && (
                          <Text style={{ fontSize: '24rpx', color: '#999', maxWidth: '400rpx', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {bookmark.note}
                          </Text>
                        )}
                      </View>
                    </Button>
                  ))
              )}
            </View>
            <Button
              style={{
                width: '100%',
                marginTop: '24rpx',
                height: '72rpx',
                lineHeight: '72rpx',
                borderRadius: '36rpx',
                backgroundColor: '#F5F5F5',
                color: '#666',
                fontSize: '26rpx'
              }}
              onClick={handleCloseBookmarkList}
            >
              关闭
            </Button>
          </View>
        </View>
      )}

      {showComplete && (
        <View className={styles.questionModal}>
          <View className={styles.questionCard}>
            <View className={styles.questionHeader}>
              <Text className={styles.questionIcon}>🎉</Text>
              <Text className={styles.questionTitle}>阅读完成！</Text>
            </View>
            <View style={{ textAlign: 'center', padding: '20rpx 0' }}>
              <Text style={{ fontSize: '80rpx', display: 'block' }}>🏆</Text>
              <Text style={{
                fontSize: '40rpx',
                fontWeight: 'bold',
                color: '#FF8A65',
                display: 'block',
                marginTop: '16rpx'
              }}>
                太棒啦！
              </Text>
              <Text style={{
                fontSize: '28rpx',
                color: '#666',
                marginTop: '16rpx',
                display: 'block',
                lineHeight: 1.6
              }}>
                你读完了《{book.title}》{'\n'}
                已记录到成长档案 ✨
              </Text>
            </View>
            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button
                style={{
                  flex: 1,
                  height: '80rpx',
                  lineHeight: '80rpx',
                  borderRadius: '40rpx',
                  backgroundColor: '#FFF3E0',
                  color: '#FF8A65',
                  fontSize: '28rpx'
                }}
                onClick={handleRestart}
              >
                🔄 再读一遍
              </Button>
              <Button
                style={{
                  flex: 1,
                  height: '80rpx',
                  lineHeight: '80rpx',
                  borderRadius: '40rpx',
                  background: 'linear-gradient(135deg, #FF8A65, #FFB74D)',
                  color: '#fff',
                  fontSize: '28rpx'
                }}
                onClick={handleContinueTasks}
              >
                🎮 做任务
              </Button>
            </View>
            <Button
              style={{
                width: '100%',
                marginTop: '16rpx',
                height: '72rpx',
                lineHeight: '72rpx',
                borderRadius: '36rpx',
                backgroundColor: '#F5F5F5',
                color: '#999',
                fontSize: '26rpx'
              }}
              onClick={handleContinueReading}
            >
              📚 继续读其他书
            </Button>
          </View>
        </View>
      )}

      {showToast && (
        <View className={styles.toast}>{toastText}</View>
      )}
    </View>
  );
};

interface QuestionModalProps {
  question: QuestionCard;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
  onClose: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  onClose
}) => {
  return (
    <View className={styles.questionModal}>
      <View className={styles.questionCard}>
        <View className={styles.questionHeader}>
          <Text className={styles.questionIcon}>❓</Text>
          <Text className={styles.questionTitle}>暂停提问</Text>
        </View>
        <Text className={styles.questionText}>{question.question}</Text>
        <View className={styles.optionList}>
          {question.options.map((option, index) => (
            <Button
              key={index}
              className={classnames(
                styles.optionBtn,
                selectedAnswer === index && index === question.answer && styles.correct,
                selectedAnswer === index && index !== question.answer && styles.wrong
              )}
              onClick={() => onAnswerSelect(index)}
            >
              {String.fromCharCode(65 + index)}. {option}
            </Button>
          ))}
        </View>
        <View className={styles.modalFooter}>
          <Button className={styles.closeBtn} onClick={onClose}>
            继续阅读
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ReaderPage;
