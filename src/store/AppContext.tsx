import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Book, ReadingPlan } from '@/types';
import { books as mockBooks } from '@/data/books';

interface AppContextType {
  books: Book[];
  brightness: number;
  readingPlan: ReadingPlan | null;
  eyeCareMode: boolean;
  toggleFavorite: (bookId: string) => void;
  setBrightness: (value: number) => void;
  setReadingPlan: (bookId: string, bookTitle: string) => void;
  toggleEyeCareMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [brightness, setBrightnessState] = useState<number>(70);
  const [readingPlan, setReadingPlanState] = useState<ReadingPlan | null>(null);
  const [eyeCareMode, setEyeCareMode] = useState<boolean>(false);

  const toggleFavorite = useCallback((bookId: string) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
      )
    );
  }, []);

  const setBrightness = useCallback((value: number) => {
    setBrightnessState(value);
  }, []);

  const setReadingPlan = useCallback((bookId: string, bookTitle: string) => {
    const today = new Date().toISOString().split('T')[0];
    setReadingPlanState({
      bookId,
      bookTitle,
      date: today,
      completed: false
    });
  }, []);

  const toggleEyeCareMode = useCallback(() => {
    setEyeCareMode(prev => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        books,
        brightness,
        readingPlan,
        eyeCareMode,
        toggleFavorite,
        setBrightness,
        setReadingPlan,
        toggleEyeCareMode
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
