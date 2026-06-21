export interface Book {
  id: string;
  title: string;
  cover: string;
  author: string;
  ageRange: string;
  theme: string;
  duration: number;
  description: string;
  pages: BookPage[];
  isFavorite: boolean;
  keywords: string[];
}

export interface BookPage {
  id: number;
  image: string;
  text: string;
  keyWords: KeyWord[];
  characters: string[];
  question?: QuestionCard;
}

export interface KeyWord {
  word: string;
  startIndex: number;
  endIndex: number;
  audioUrl?: string;
}

export interface QuestionCard {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface Task {
  id: string;
  type: 'retell' | 'find' | 'emotion' | 'color';
  title: string;
  description: string;
  bookId: string;
  bookTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

export interface Recording {
  id: string;
  title: string;
  duration: number;
  date: string;
  bookTitle: string;
  audioUrl?: string;
}

export interface GrowthRecord {
  date: string;
  bookId: string;
  bookTitle: string;
  duration: number;
  completed: boolean;
}

export interface GrowthStats {
  totalDays: number;
  totalBooks: number;
  totalMinutes: number;
  favoriteThemes: { theme: string; count: number }[];
  favoriteCharacters: { name: string; count: number }[];
  monthlyRecords: { date: string; count: number }[];
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface ReadingPlan {
  bookId: string;
  bookTitle: string;
  date: string;
  completed: boolean;
}
