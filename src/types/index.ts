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

export interface FindTarget {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  found: boolean;
}

export interface ColorPalette {
  id: string;
  color: string;
  name: string;
}

export interface ColorZone {
  id: string;
  label: string;
  filled: boolean;
  color: string;
}

export interface EmotionOption {
  id: string;
  emoji: string;
  label: string;
  correct?: boolean;
  feedback: string;
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
  hint?: string;
  retellPrompt?: string;
  findScene?: {
    image: string;
    targets: FindTarget[];
  };
  emotionQuestion?: {
    scene: string;
    options: EmotionOption[];
  };
  colorPalettes?: ColorPalette[];
  colorZones?: ColorZone[];
  linkedRecordingId?: string;
}

export interface Recording {
  id: string;
  title: string;
  duration: number;
  filePath: string;
  createdAt: string;
  date: string;
  bookTitle?: string;
  bookId?: string;
}

export interface GrowthRecord {
  date: string;
  bookId: string;
  bookTitle: string;
  duration: number;
  completed: boolean;
  themes?: string[];
  characters?: string[];
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

export interface Bookmark {
  bookId: string;
  pageIndex: number;
  note: string;
  createdAt: string;
}

export interface ReadingProgress {
  bookId: string;
  lastPage: number;
  totalPages: number;
  updatedAt: string;
  notes: { pageIndex: number; content: string; createdAt: string }[];
}
