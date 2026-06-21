import { Recording, GrowthRecord, GrowthStats } from '@/types';

export const recordings: Recording[] = [
  {
    id: '1',
    title: '我讲的小兔冒险',
    duration: 125,
    date: '2024-01-15',
    bookTitle: '小兔的奇妙冒险'
  },
  {
    id: '2',
    title: '晚安小月亮',
    duration: 89,
    date: '2024-01-14',
    bookTitle: '晚安，小月亮'
  },
  {
    id: '3',
    title: '森林音乐会',
    duration: 156,
    date: '2024-01-12',
    bookTitle: '森林里的音乐会'
  },
  {
    id: '4',
    title: '我的情绪小怪兽',
    duration: 98,
    date: '2024-01-10',
    bookTitle: '我的情绪小怪兽'
  }
];

export const growthRecords: GrowthRecord[] = [
  { date: '2024-01-15', bookId: '1', bookTitle: '小兔的奇妙冒险', duration: 10, completed: true },
  { date: '2024-01-14', bookId: '2', bookTitle: '晚安，小月亮', duration: 8, completed: true },
  { date: '2024-01-13', bookId: '3', bookTitle: '森林里的音乐会', duration: 12, completed: true },
  { date: '2024-01-12', bookId: '6', bookTitle: '小熊学做饭', duration: 11, completed: true },
  { date: '2024-01-11', bookId: '5', bookTitle: '我的情绪小怪兽', duration: 9, completed: true },
  { date: '2024-01-10', bookId: '7', bookTitle: '小蝌蚪找妈妈', duration: 10, completed: true },
  { date: '2024-01-09', bookId: '4', bookTitle: '神秘的海底世界', duration: 15, completed: true }
];

export const growthStats: GrowthStats = {
  totalDays: 28,
  totalBooks: 15,
  totalMinutes: 268,
  favoriteThemes: [
    { theme: '冒险', count: 8 },
    { theme: '睡前故事', count: 6 },
    { theme: '音乐', count: 5 },
    { theme: '科普', count: 4 },
    { theme: '情绪管理', count: 3 }
  ],
  favoriteCharacters: [
    { name: '小兔白白', count: 12 },
    { name: '小月亮', count: 9 },
    { name: '小熊', count: 8 },
    { name: '小海豚朵朵', count: 6 },
    { name: '情绪小怪兽', count: 5 }
  ],
  monthlyRecords: [
    { date: '2024-01-01', count: 1 },
    { date: '2024-01-02', count: 1 },
    { date: '2024-01-03', count: 0 },
    { date: '2024-01-04', count: 1 },
    { date: '2024-01-05', count: 1 },
    { date: '2024-01-06', count: 1 },
    { date: '2024-01-07', count: 0 },
    { date: '2024-01-08', count: 1 },
    { date: '2024-01-09', count: 1 },
    { date: '2024-01-10', count: 1 },
    { date: '2024-01-11', count: 1 },
    { date: '2024-01-12', count: 1 },
    { date: '2024-01-13', count: 1 },
    { date: '2024-01-14', count: 1 },
    { date: '2024-01-15', count: 1 }
  ]
};
