import { Book } from '@/types';

export const books: Book[] = [
  {
    id: '1',
    title: '小兔的奇妙冒险',
    cover: 'https://picsum.photos/id/1025/400/520',
    author: '林小米',
    ageRange: '3-6岁',
    theme: '冒险',
    duration: 10,
    description: '小兔子踏上了寻找彩虹的冒险之旅，途中结识了许多好朋友。这是一个关于勇气和友谊的温暖故事。',
    isFavorite: true,
    keywords: ['勇敢', '友谊', '彩虹', '冒险'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/1025/750/500',
        text: '在一个阳光明媚的早晨，小兔白白醒来了。它望着窗外的彩虹，决定去寻找彩虹的尽头。',
        keyWords: [
          { word: '小兔', startIndex: 13, endIndex: 15 },
          { word: '彩虹', startIndex: 26, endIndex: 28 }
        ],
        characters: ['小兔白白'],
        question: {
          id: 'q1',
          question: '小兔为什么要出门？',
          options: ['去找食物', '去寻找彩虹', '去玩游戏'],
          answer: 1
        }
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/1074/750/500',
        text: '路上，白白遇到了正在唱歌的小鸟。小鸟说："我也想看看彩虹的尽头，我可以和你一起去吗？"',
        keyWords: [
          { word: '小鸟', startIndex: 10, endIndex: 12 },
          { word: '唱歌', startIndex: 17, endIndex: 19 }
        ],
        characters: ['小兔白白', '小鸟']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/219/750/500',
        text: '它们穿过绿油油的草地，跨过清澈的小溪，终于看到了彩虹的尽头。那里有一个美丽的花园。',
        keyWords: [
          { word: '草地', startIndex: 7, endIndex: 9 },
          { word: '花园', startIndex: 37, endIndex: 39 }
        ],
        characters: ['小兔白白', '小鸟'],
        question: {
          id: 'q2',
          question: '它们穿过了什么地方？',
          options: ['森林和大山', '草地和小溪', '沙漠和海洋'],
          answer: 1
        }
      },
      {
        id: 4,
        image: 'https://picsum.photos/id/1040/750/500',
        text: '原来，彩虹的尽头住着一位花仙子。她笑着说："欢迎你们，勇敢的小朋友。友谊就是最美的彩虹。"',
        keyWords: [
          { word: '花仙子', startIndex: 11, endIndex: 14 },
          { word: '友谊', startIndex: 29, endIndex: 31 }
        ],
        characters: ['小兔白白', '小鸟', '花仙子']
      }
    ]
  },
  {
    id: '2',
    title: '晚安，小月亮',
    cover: 'https://picsum.photos/id/1039/400/520',
    author: '王梓涵',
    ageRange: '2-4岁',
    theme: '睡前故事',
    duration: 8,
    description: '一个温馨的睡前故事，陪伴宝宝安然入眠。小月亮和小星星们一起玩游戏，然后互道晚安。',
    isFavorite: false,
    keywords: ['月亮', '星星', '晚安', '睡觉'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/1039/750/500',
        text: '太阳公公下山了，天空变成了深蓝色。小月亮揉了揉眼睛，从云朵后面探出头来。',
        keyWords: [
          { word: '太阳', startIndex: 0, endIndex: 2 },
          { word: '月亮', startIndex: 19, endIndex: 21 }
        ],
        characters: ['小月亮']
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/1050/750/500',
        text: '小星星们眨着亮晶晶的眼睛，围了过来："小月亮，今天我们玩什么游戏呀？"',
        keyWords: [
          { word: '星星', startIndex: 0, endIndex: 2 },
          { word: '游戏', startIndex: 35, endIndex: 37 }
        ],
        characters: ['小月亮', '小星星们']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/1044/750/500',
        text: '它们玩起了捉迷藏的游戏。小月亮躲在云朵后面，小星星们找呀找，就是找不到。',
        keyWords: [
          { word: '捉迷藏', startIndex: 7, endIndex: 10 },
          { word: '云朵', startIndex: 22, endIndex: 24 }
        ],
        characters: ['小月亮', '小星星们']
      }
    ]
  },
  {
    id: '3',
    title: '森林里的音乐会',
    cover: 'https://picsum.photos/id/237/400/520',
    author: '陈思远',
    ageRange: '4-7岁',
    theme: '音乐',
    duration: 12,
    description: '森林里举办了一场盛大的音乐会，每个小动物都展示了自己独特的音乐才能。',
    isFavorite: true,
    keywords: ['音乐', '森林', '动物', '快乐'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/237/750/500',
        text: '春天来了，森林里要举办一年一度的音乐会。小动物们都在积极地练习。',
        keyWords: [
          { word: '春天', startIndex: 0, endIndex: 2 },
          { word: '音乐会', startIndex: 16, endIndex: 19 }
        ],
        characters: ['小动物们']
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/1062/750/500',
        text: '小熊敲起了大鼓，咚咚咚！小猴弹起了吉他，叮叮叮！小鸟唱起了歌，叽叽喳！',
        keyWords: [
          { word: '小熊', startIndex: 0, endIndex: 2 },
          { word: '小猴', startIndex: 12, endIndex: 14 },
          { word: '小鸟', startIndex: 24, endIndex: 26 }
        ],
        characters: ['小熊', '小猴', '小鸟']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/1084/750/500',
        text: '森林里充满了欢声笑语。大家说："这是最棒的音乐会！明年我们还要一起演奏！"',
        keyWords: [
          { word: '欢笑', startIndex: 5, endIndex: 7 },
          { word: '演奏', startIndex: 36, endIndex: 38 }
        ],
        characters: ['小熊', '小猴', '小鸟', '其他动物']
      }
    ]
  },
  {
    id: '4',
    title: '神秘的海底世界',
    cover: 'https://picsum.photos/id/64/400/520',
    author: '李雨涵',
    ageRange: '5-8岁',
    theme: '科普',
    duration: 15,
    description: '跟随小海豚探索神秘的海底世界，认识各种有趣的海洋生物。',
    isFavorite: false,
    keywords: ['海洋', '海豚', '探索', '科普'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/64/750/500',
        text: '小海豚朵朵生活在蓝色的大海里。今天，它要带我们去探索神秘的海底世界。',
        keyWords: [
          { word: '海豚', startIndex: 0, endIndex: 2 },
          { word: '海底', startIndex: 32, endIndex: 34 }
        ],
        characters: ['小海豚朵朵']
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/104/750/500',
        text: '看！那里有五颜六色的珊瑚，还有成群结队的小鱼在珊瑚丛中穿来穿去。',
        keyWords: [
          { word: '珊瑚', startIndex: 11, endIndex: 13 },
          { word: '小鱼', startIndex: 22, endIndex: 24 }
        ],
        characters: ['小海豚朵朵', '小鱼群']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/110/750/500',
        text: '远处，一只巨大的海龟慢悠悠地游过来。它已经活了一百多岁了，见过大海的许多变化。',
        keyWords: [
          { word: '海龟', startIndex: 7, endIndex: 9 },
          { word: '大海', startIndex: 33, endIndex: 35 }
        ],
        characters: ['小海豚朵朵', '海龟爷爷']
      }
    ]
  },
  {
    id: '5',
    title: '我的情绪小怪兽',
    cover: 'https://picsum.photos/id/91/400/520',
    author: '张悦然',
    ageRange: '3-6岁',
    theme: '情绪管理',
    duration: 9,
    description: '帮助孩子认识和管理自己的情绪，学会用正确的方式表达喜怒哀乐。',
    isFavorite: false,
    keywords: ['情绪', '管理', '表达', '成长'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/91/750/500',
        text: '每个人心里都住着一只情绪小怪兽。当你开心时，它是黄色的，像太阳一样明亮。',
        keyWords: [
          { word: '情绪', startIndex: 7, endIndex: 9 },
          { word: '开心', startIndex: 19, endIndex: 21 }
        ],
        characters: ['情绪小怪兽']
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/177/750/500',
        text: '当你难过时，小怪兽变成蓝色的，像下雨天一样忧郁。这时候，抱抱它就会好起来。',
        keyWords: [
          { word: '难过', startIndex: 3, endIndex: 5 },
          { word: '蓝色', startIndex: 13, endIndex: 15 }
        ],
        characters: ['情绪小怪兽']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/338/750/500',
        text: '当你生气时，小怪兽变成红色的，像一团火焰。深呼吸，让它慢慢平静下来吧。',
        keyWords: [
          { word: '生气', startIndex: 3, endIndex: 5 },
          { word: '红色', startIndex: 13, endIndex: 15 }
        ],
        characters: ['情绪小怪兽']
      }
    ]
  },
  {
    id: '6',
    title: '小熊学做饭',
    cover: 'https://picsum.photos/id/1062/400/520',
    author: '刘子轩',
    ageRange: '4-7岁',
    theme: '生活技能',
    duration: 11,
    description: '小熊跟着妈妈学习做饭，从手忙脚乱到做出美味的蜂蜜蛋糕。',
    isFavorite: true,
    keywords: ['做饭', '独立', '学习', '亲情'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/1062/750/500',
        text: '小熊波波看到妈妈在厨房里忙碌，说："妈妈，我也想学做饭！"妈妈笑着答应了。',
        keyWords: [
          { word: '小熊', startIndex: 0, endIndex: 2 },
          { word: '妈妈', startIndex: 7, endIndex: 9 }
        ],
        characters: ['小熊波波', '熊妈妈']
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/225/750/500',
        text: '首先，我们要准备好材料：面粉、鸡蛋、牛奶，还有波波最喜欢的蜂蜜。',
        keyWords: [
          { word: '面粉', startIndex: 14, endIndex: 16 },
          { word: '蜂蜜', startIndex: 29, endIndex: 31 }
        ],
        characters: ['小熊波波', '熊妈妈']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/292/750/500',
        text: '蛋糕烤好了，香喷喷的。波波尝了一口，说："这是世界上最好吃的蛋糕！"',
        keyWords: [
          { word: '蛋糕', startIndex: 0, endIndex: 2 },
          { word: '好吃', startIndex: 30, endIndex: 32 }
        ],
        characters: ['小熊波波', '熊妈妈']
      }
    ]
  },
  {
    id: '7',
    title: '小蝌蚪找妈妈',
    cover: 'https://picsum.photos/id/718/400/520',
    author: '钱雨桐',
    ageRange: '3-5岁',
    theme: '经典故事',
    duration: 10,
    description: '经典童话故事，小蝌蚪在寻找妈妈的过程中认识了自己的成长变化。',
    isFavorite: false,
    keywords: ['童话', '成长', '亲情', '经典'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/718/750/500',
        text: '池塘里有一群小蝌蚪，它们不知道自己的妈妈是谁。于是，它们决定去寻找妈妈。',
        keyWords: [
          { word: '蝌蚪', startIndex: 5, endIndex: 7 },
          { word: '妈妈', startIndex: 23, endIndex: 25 }
        ],
        characters: ['小蝌蚪们']
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/659/750/500',
        text: '它们遇到了金鱼阿姨，问："您是我们的妈妈吗？"金鱼说："你们的妈妈有四条腿。"',
        keyWords: [
          { word: '金鱼', startIndex: 6, endIndex: 8 },
          { word: '腿', startIndex: 43, endIndex: 44 }
        ],
        characters: ['小蝌蚪们', '金鱼阿姨']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/783/750/500',
        text: '最后，它们终于找到了妈妈。原来，它们的妈妈是青蛙，而它们自己也慢慢变成了小青蛙。',
        keyWords: [
          { word: '青蛙', startIndex: 27, endIndex: 29 },
          { word: '小青蛙', startIndex: 47, endIndex: 50 }
        ],
        characters: ['小蝌蚪们', '青蛙妈妈']
      }
    ]
  },
  {
    id: '8',
    title: '不刷牙的小老虎',
    cover: 'https://picsum.photos/id/1025/400/520',
    author: '赵一诺',
    ageRange: '2-5岁',
    theme: '好习惯',
    duration: 7,
    description: '小老虎因为不喜欢刷牙而牙疼，后来学会了每天认真刷牙。',
    isFavorite: false,
    keywords: ['刷牙', '习惯', '健康', '成长'],
    pages: [
      {
        id: 1,
        image: 'https://picsum.photos/id/1025/750/500',
        text: '小老虎壮壮最爱吃糖，却最讨厌刷牙。妈妈让它刷牙，它总是说："明天再刷！"',
        keyWords: [
          { word: '老虎', startIndex: 0, endIndex: 2 },
          { word: '刷牙', startIndex: 11, endIndex: 13 }
        ],
        characters: ['小老虎壮壮', '虎妈妈']
      },
      {
        id: 2,
        image: 'https://picsum.photos/id/1074/750/500',
        text: '有一天，壮壮的牙疼得厉害。它捂着腮帮子，哭得可伤心了。妈妈带它去看牙医。',
        keyWords: [
          { word: '牙疼', startIndex: 8, endIndex: 10 },
          { word: '牙医', startIndex: 40, endIndex: 42 }
        ],
        characters: ['小老虎壮壮', '虎妈妈', '牙医']
      },
      {
        id: 3,
        image: 'https://picsum.photos/id/219/750/500',
        text: '从那以后，壮壮每天都认真刷牙。它的牙齿变得又白又亮，再也不疼了。',
        keyWords: [
          { word: '刷牙', startIndex: 13, endIndex: 15 },
          { word: '牙齿', startIndex: 25, endIndex: 27 }
        ],
        characters: ['小老虎壮壮']
      }
    ]
  }
];

export const ageOptions = [
  { label: '全部年龄', value: 'all' },
  { label: '2-4岁', value: '2-4岁' },
  { label: '3-5岁', value: '3-5岁' },
  { label: '3-6岁', value: '3-6岁' },
  { label: '4-7岁', value: '4-7岁' },
  { label: '5-8岁', value: '5-8岁' }
];

export const themeOptions = [
  { label: '全部主题', value: 'all' },
  { label: '冒险', value: '冒险' },
  { label: '睡前故事', value: '睡前故事' },
  { label: '音乐', value: '音乐' },
  { label: '科普', value: '科普' },
  { label: '情绪管理', value: '情绪管理' },
  { label: '生活技能', value: '生活技能' },
  { label: '经典故事', value: '经典故事' },
  { label: '好习惯', value: '好习惯' }
];

export const durationOptions = [
  { label: '全部时长', value: 'all' },
  { label: '5-8分钟', value: 'short' },
  { label: '8-12分钟', value: 'medium' },
  { label: '12分钟以上', value: 'long' }
];
