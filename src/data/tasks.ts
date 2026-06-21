import { Task } from '@/types';

export const tasks: Task[] = [
  {
    id: '1',
    type: 'retell',
    title: '复述故事',
    description: '和爸爸妈妈一起，用自己的话复述《小兔的奇妙冒险》的故事',
    bookId: '1',
    bookTitle: '小兔的奇妙冒险',
    difficulty: 'easy',
    completed: false
  },
  {
    id: '2',
    type: 'find',
    title: '找一找',
    description: '在《晚安，小月亮》的第2页里，找出所有的小星星有几个？',
    bookId: '2',
    bookTitle: '晚安，小月亮',
    difficulty: 'easy',
    completed: true
  },
  {
    id: '3',
    type: 'emotion',
    title: '情绪选择',
    description: '当小怪兽变成红色的时候，应该怎么做才能让它平静下来？',
    bookId: '5',
    bookTitle: '我的情绪小怪兽',
    difficulty: 'medium',
    completed: false
  },
  {
    id: '4',
    type: 'color',
    title: '简单涂色',
    description: '给《森林里的音乐会》中的小动物们涂上你喜欢的颜色',
    bookId: '3',
    bookTitle: '森林里的音乐会',
    difficulty: 'medium',
    completed: false
  },
  {
    id: '5',
    type: 'retell',
    title: '故事创编',
    description: '看完《神秘的海底世界》后，说说你最喜欢的海洋生物是什么',
    bookId: '4',
    bookTitle: '神秘的海底世界',
    difficulty: 'medium',
    completed: false
  },
  {
    id: '6',
    type: 'find',
    title: '找不同',
    description: '在《小熊学做饭》中，找出制作蛋糕需要的材料',
    bookId: '6',
    bookTitle: '小熊学做饭',
    difficulty: 'easy',
    completed: true
  },
  {
    id: '7',
    type: 'emotion',
    title: '心情分享',
    description: '小老虎牙疼的时候是什么心情？你有过类似的经历吗？',
    bookId: '8',
    bookTitle: '不刷牙的小老虎',
    difficulty: 'medium',
    completed: false
  },
  {
    id: '8',
    type: 'color',
    title: '画一画',
    description: '画出你心目中《小蝌蚪找妈妈》中的青蛙妈妈是什么样子的',
    bookId: '7',
    bookTitle: '小蝌蚪找妈妈',
    difficulty: 'hard',
    completed: false
  }
];
