import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Taro from '@tarojs/taro';
import {
  Book, ReadingPlan, Recording, GrowthRecord, Task, Bookmark, ReadingProgress, ChildProfile
} from '@/types';
import { books as mockBooks } from '@/data/books';
import { tasks as mockTasks } from '@/data/tasks';

interface AppContextType {
  books: Book[];
  tasks: Task[];
  brightness: number;
  readingPlan: ReadingPlan | null;
  eyeCareMode: boolean;
  recordings: Recording[];
  growthRecords: GrowthRecord[];
  bookmarks: Bookmark[];
  readingProgresses: ReadingProgress[];
  children: ChildProfile[];
  activeChildId: string | null;
  addChild: (child: ChildProfile) => void;
  removeChild: (childId: string) => void;
  setActiveChild: (childId: string) => void;
  getActiveChild: () => ChildProfile | null;
  toggleFavorite: (bookId: string) => void;
  setBrightness: (value: number) => void;
  setReadingPlan: (bookId: string, bookTitle: string) => void;
  toggleEyeCareMode: () => void;
  addRecording: (recording: Recording) => void;
  deleteRecording: (id: string) => void;
  addGrowthRecord: (record: GrowthRecord) => void;
  completeReadingPlan: () => void;
  completeTask: (taskId: string) => void;
  resetTask: (taskId: string) => void;
  updateTaskTargets: (taskId: string, targets: Task['findScene']['targets']) => void;
  updateTaskColorZones: (taskId: string, zones: Task['colorZones']) => void;
  linkRecordingToTask: (taskId: string, recordingId: string | null) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookId: string, pageIndex: number) => void;
  getBookmarks: (bookId: string) => Bookmark[];
  saveReadingProgress: (bookId: string, lastPage: number, totalPages: number) => void;
  addNote: (bookId: string, pageIndex: number, content: string) => void;
  getNotes: (bookId: string) => ReadingProgress['notes'];
  getReadingProgress: (bookId: string) => ReadingProgress | undefined;
  getGrowthStats: (monthKey?: string, childId?: string) => {
    totalDays: number;
    totalBooks: number;
    totalMinutes: number;
    favoriteThemes: { theme: string; count: number }[];
    favoriteCharacters: { name: string; count: number }[];
  };
}

const STORAGE_KEYS = {
  FAVORITES: 'storybook_favorites',
  BRIGHTNESS: 'storybook_brightness',
  READING_PLAN: 'storybook_reading_plan',
  EYE_CARE: 'storybook_eye_care',
  RECORDINGS: 'storybook_recordings',
  GROWTH_RECORDS: 'storybook_growth_records',
  TASKS: 'storybook_tasks',
  BOOKMARKS: 'storybook_bookmarks',
  READING_PROGRESSES: 'storybook_progresses',
  CHILDREN: 'storybook_children',
  ACTIVE_CHILD: 'storybook_active_child'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.FAVORITES);
      if (stored) {
        const favorites: string[] = JSON.parse(stored);
        return mockBooks.map(book => ({
          ...book,
          isFavorite: favorites.includes(book.id)
        }));
      }
    } catch (e) {
      console.error('[AppContext] 加载收藏失败:', e);
    }
    return mockBooks;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.TASKS);
      if (stored) {
        const storedTasks: Task[] = JSON.parse(stored);
        return mockTasks.map(mock => {
          const found = storedTasks.find(s => s.id === mock.id);
          if (found) return found;
          return mock;
        });
      }
    } catch (e) {
      console.error('[AppContext] 加载任务失败:', e);
    }
    return mockTasks;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.BOOKMARKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('[AppContext] 加载书签失败:', e);
    }
    return [];
  });

  const [readingProgresses, setReadingProgresses] = useState<ReadingProgress[]>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.READING_PROGRESSES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('[AppContext] 加载阅读进度失败:', e);
    }
    return [];
  });

  const [brightness, setBrightnessState] = useState<number>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.BRIGHTNESS);
      if (stored !== '') return Number(stored);
    } catch (e) {
      console.error('[AppContext] 加载亮度失败:', e);
    }
    return 70;
  });

  const [readingPlan, setReadingPlanState] = useState<ReadingPlan | null>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.READING_PLAN);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('[AppContext] 加载阅读计划失败:', e);
    }
    return null;
  });

  const [eyeCareMode, setEyeCareMode] = useState<boolean>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.EYE_CARE);
      if (stored !== '') return stored === 'true';
    } catch (e) {
      console.error('[AppContext] 加载护眼模式失败:', e);
    }
    return false;
  });

  const [recordings, setRecordings] = useState<Recording[]>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.RECORDINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('[AppContext] 加载录音失败:', e);
    }
    return [];
  });

  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.GROWTH_RECORDS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('[AppContext] 加载成长记录失败:', e);
    }
    return [];
  });

  const [children, setChildren] = useState<ChildProfile[]>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.CHILDREN);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('[AppContext] 加载孩子列表失败:', e);
    }
    return [{ id: 'child_1', name: '宝贝', avatar: '👶', createdAt: new Date().toISOString() }];
  });

  const [activeChildId, setActiveChildId] = useState<string | null>(() => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEYS.ACTIVE_CHILD);
      if (stored) return stored;
    } catch (e) {
      console.error('[AppContext] 加载活跃孩子失败:', e);
    }
    return 'child_1';
  });

  useEffect(() => {
    try {
      const favorites = books.filter(b => b.isFavorite).map(b => b.id);
      Taro.setStorageSync(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) { console.error(e); }
  }, [books]);

  useEffect(() => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) { console.error(e); }
  }, [tasks]);

  useEffect(() => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      console.log('[AppContext] 保存书签:', bookmarks.length, '条');
    } catch (e) { console.error(e); }
  }, [bookmarks]);

  useEffect(() => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.READING_PROGRESSES, JSON.stringify(readingProgresses));
      console.log('[AppContext] 保存阅读进度:', readingProgresses.length, '条');
    } catch (e) { console.error(e); }
  }, [readingProgresses]);

  useEffect(() => { Taro.setStorageSync(STORAGE_KEYS.BRIGHTNESS, String(brightness)); }, [brightness]);

  useEffect(() => {
    try {
      if (readingPlan) {
        Taro.setStorageSync(STORAGE_KEYS.READING_PLAN, JSON.stringify(readingPlan));
      } else {
        Taro.removeStorageSync(STORAGE_KEYS.READING_PLAN);
      }
    } catch (e) { console.error(e); }
  }, [readingPlan]);

  useEffect(() => { Taro.setStorageSync(STORAGE_KEYS.EYE_CARE, String(eyeCareMode)); }, [eyeCareMode]);

  useEffect(() => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.RECORDINGS, JSON.stringify(recordings));
    } catch (e) { console.error(e); }
  }, [recordings]);

  useEffect(() => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.GROWTH_RECORDS, JSON.stringify(growthRecords));
    } catch (e) { console.error(e); }
  }, [growthRecords]);

  useEffect(() => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
    } catch (e) { console.error(e); }
  }, [children]);

  useEffect(() => {
    try {
      if (activeChildId) {
        Taro.setStorageSync(STORAGE_KEYS.ACTIVE_CHILD, activeChildId);
      }
    } catch (e) { console.error(e); }
  }, [activeChildId]);

  const toggleFavorite = useCallback((bookId: string) => {
    setBooks(prevBooks => prevBooks.map(book =>
      book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
    ));
  }, []);

  const setBrightness = useCallback((value: number) => { setBrightnessState(value); }, []);

  const setReadingPlan = useCallback((bookId: string, bookTitle: string) => {
    const today = new Date().toISOString().split('T')[0];
    setReadingPlanState({ bookId, bookTitle, date: today, completed: false });
  }, []);

  const completeReadingPlan = useCallback(() => {
    setReadingPlanState(prev => prev ? { ...prev, completed: true } : null);
  }, []);

  const toggleEyeCareMode = useCallback(() => { setEyeCareMode(prev => !prev); }, []);

  const addRecording = useCallback((recording: Recording) => {
    setRecordings(prev => [recording, ...prev]);
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  }, []);

  const addGrowthRecord = useCallback((record: GrowthRecord) => {
    setGrowthRecords(prev => {
      const enrichedRecord = { ...record, childId: activeChildId || 'child_1' };
      const exists = prev.find(r => r.date === enrichedRecord.date && r.bookId === enrichedRecord.bookId);
      if (exists) return prev;
      return [...prev, enrichedRecord];
    });
  }, [activeChildId]);

  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
  }, []);

  const resetTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const reset: Task = { ...t, completed: false };
      if (reset.findScene) {
        reset.findScene = { ...reset.findScene, targets: reset.findScene.targets.map(tg => ({ ...tg, found: false })) };
      }
      if (reset.colorZones) {
        reset.colorZones = reset.colorZones.map(z => ({ ...z, filled: false, color: 'transparent' }));
      }
      return reset;
    }));
  }, []);

  const updateTaskTargets = useCallback((taskId: string, targets: Task['findScene']['targets']) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId || !t.findScene) return t;
      return { ...t, findScene: { ...t.findScene, targets } };
    }));
  }, []);

  const updateTaskColorZones = useCallback((taskId: string, zones: Task['colorZones']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, colorZones: zones } : t));
  }, []);

  const linkRecordingToTask = useCallback((taskId: string, recordingId: string | null) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, linkedRecordingId: recordingId || undefined } : t));
  }, []);

  const addBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.bookId === bookmark.bookId && b.pageIndex === bookmark.pageIndex);
      if (exists) return prev.map(b =>
        b.bookId === bookmark.bookId && b.pageIndex === bookmark.pageIndex ? bookmark : b
      );
      return [...prev, bookmark];
    });
  }, []);

  const removeBookmark = useCallback((bookId: string, pageIndex: number) => {
    setBookmarks(prev => prev.filter(b => !(b.bookId === bookId && b.pageIndex === pageIndex)));
  }, []);

  const getBookmarks = useCallback((bookId: string) => {
    return bookmarks.filter(b => b.bookId === bookId);
  }, [bookmarks]);

  const saveReadingProgress = useCallback((bookId: string, lastPage: number, totalPages: number) => {
    setReadingProgresses(prev => {
      const existing = prev.find(p => p.bookId === bookId);
      const newProgress: ReadingProgress = {
        bookId,
        lastPage,
        totalPages,
        updatedAt: new Date().toISOString(),
        notes: existing?.notes || []
      };
      if (existing) {
        return prev.map(p => p.bookId === bookId ? newProgress : p);
      }
      return [...prev, newProgress];
    });
  }, []);

  const addNote = useCallback((bookId: string, pageIndex: number, content: string) => {
    setReadingProgresses(prev => {
      const existing = prev.find(p => p.bookId === bookId);
      const newNote = { pageIndex, content, createdAt: new Date().toISOString() };
      if (existing) {
        return prev.map(p => {
          if (p.bookId !== bookId) return p;
          const otherNotes = p.notes.filter(n => n.pageIndex !== pageIndex);
          return { ...p, notes: [...otherNotes, newNote] };
        });
      }
      return [...prev, {
        bookId,
        lastPage: pageIndex,
        totalPages: 0,
        updatedAt: new Date().toISOString(),
        notes: [newNote]
      }];
    });
  }, []);

  const getNotes = useCallback((bookId: string) => {
    const progress = readingProgresses.find(p => p.bookId === bookId);
    return progress?.notes || [];
  }, [readingProgresses]);

  const getReadingProgress = useCallback((bookId: string) => {
    return readingProgresses.find(p => p.bookId === bookId);
  }, [readingProgresses]);

  const addChild = useCallback((child: ChildProfile) => {
    setChildren(prev => [...prev, child]);
  }, []);

  const removeChild = useCallback((childId: string) => {
    setChildren(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(c => c.id !== childId);
      if (activeChildId === childId) {
        setActiveChildId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  }, [activeChildId]);

  const setActiveChild = useCallback((childId: string) => {
    setActiveChildId(childId);
  }, []);

  const getActiveChild = useCallback(() => {
    return children.find(c => c.id === activeChildId) || null;
  }, [children, activeChildId]);

  const getGrowthStats = useCallback((monthKey?: string, childId?: string) => {
    const filteredRecords = growthRecords.filter(r =>
      (!childId || r.childId === childId) && (!monthKey || r.date.startsWith(monthKey))
    );

    const uniqueDays = new Set(filteredRecords.map(r => r.date));
    const uniqueBooks = new Set(filteredRecords.map(r => r.bookId));
    const totalMinutes = filteredRecords.reduce((sum, r) => sum + r.duration, 0);

    const themeCount: Record<string, number> = {};
    const charCount: Record<string, number> = {};

    filteredRecords.forEach(record => {
      const book = books.find(b => b.id === record.bookId);
      if (book) {
        themeCount[book.theme] = (themeCount[book.theme] || 0) + 1;
        const allChars = new Set<string>();
        book.pages.forEach(p => p.characters.forEach(c => allChars.add(c)));
        allChars.forEach(c => { charCount[c] = (charCount[c] || 0) + 1; });
      }
    });

    const favoriteThemes = Object.entries(themeCount)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const favoriteCharacters = Object.entries(charCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalDays: uniqueDays.size,
      totalBooks: uniqueBooks.size,
      totalMinutes,
      favoriteThemes,
      favoriteCharacters
    };
  }, [growthRecords, books]);

  return (
    <AppContext.Provider
      value={{
        books,
        tasks,
        brightness,
        readingPlan,
        eyeCareMode,
        recordings,
        growthRecords,
        bookmarks,
        readingProgresses,
        children,
        activeChildId,
        addChild,
        removeChild,
        setActiveChild,
        getActiveChild,
        toggleFavorite,
        setBrightness,
        setReadingPlan,
        completeReadingPlan,
        toggleEyeCareMode,
        addRecording,
        deleteRecording,
        addGrowthRecord,
        completeTask,
        resetTask,
        updateTaskTargets,
        updateTaskColorZones,
        linkRecordingToTask,
        addBookmark,
        removeBookmark,
        getBookmarks,
        saveReadingProgress,
        addNote,
        getNotes,
        getReadingProgress,
        getGrowthStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
