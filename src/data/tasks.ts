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
    completed: false,
    hint: '还记得小兔是怎么认识新朋友的吗？',
    retellPrompt: '请按顺序说说：小兔遇到了谁？发生了什么事？最后结局怎么样？'
  },
  {
    id: '2',
    type: 'find',
    title: '找一找：数星星',
    description: '在画面中找出所有闪烁的小星星，一共几颗？',
    bookId: '2',
    bookTitle: '晚安，小月亮',
    difficulty: 'easy',
    completed: false,
    hint: '星星藏在天空和树梢上哦~',
    findScene: {
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20night%20sky%20scene%20with%20moon%20and%20stars%20soft%20pastel%20colors%20dreamy%20children%20book%20illustration&image_size=landscape_16_9',
      targets: [
        { id: 's1', label: '星星1', x: 12, y: 15, width: 8, height: 8, found: false },
        { id: 's2', label: '星星2', x: 35, y: 8, width: 8, height: 8, found: false },
        { id: 's3', label: '星星3', x: 62, y: 18, width: 8, height: 8, found: false },
        { id: 's4', label: '星星4', x: 78, y: 28, width: 8, height: 8, found: false },
        { id: 's5', label: '星星5', x: 25, y: 45, width: 8, height: 8, found: false }
      ]
    }
  },
  {
    id: '3',
    type: 'emotion',
    title: '情绪选择',
    description: '当小怪兽变成红色的时候，它现在是什么心情？',
    bookId: '5',
    bookTitle: '我的情绪小怪兽',
    difficulty: 'medium',
    completed: false,
    hint: '红色通常代表什么情绪呢？',
    emotionQuestion: {
      scene: '小怪兽全身变红了，它的眼睛瞪得大大的，嘴巴也紧紧抿着，手攥成了拳头，脚还在用力跺地板...',
      options: [
        { id: 'e1', emoji: '😊', label: '开心', correct: false, feedback: '不是哦~ 开心的时候小怪兽是黄色的，会笑得眼睛弯弯的！' },
        { id: 'e2', emoji: '😠', label: '生气', correct: true, feedback: '答对啦！🔥 红色小怪兽代表生气，这时候我们可以深呼吸，数到10让自己平静下来~' },
        { id: 'e3', emoji: '😢', label: '难过', correct: false, feedback: '不是哦~ 难过的时候小怪兽是蓝色的，会默默流眼泪...' },
        { id: 'e4', emoji: '😰', label: '害怕', correct: false, feedback: '不是哦~ 害怕的时候小怪兽是黑色的，会缩成一团躲起来...' }
      ]
    }
  },
  {
    id: '4',
    type: 'color',
    title: '简单涂色',
    description: '给《森林里的音乐会》中的小动物们涂上你喜欢的颜色',
    bookId: '3',
    bookTitle: '森林里的音乐会',
    difficulty: 'medium',
    completed: false,
    hint: '点击颜色，再点击要涂色的区域就可以啦！',
    colorPalettes: [
      { id: 'c1', color: '#FF8A65', name: '橘色' },
      { id: 'c2', color: '#81C784', name: '绿色' },
      { id: 'c3', color: '#64B5F6', name: '蓝色' },
      { id: 'c4', color: '#FFD54F', name: '黄色' },
      { id: 'c5', color: '#BA68C8', name: '紫色' },
      { id: 'c6', color: '#FF8A80', name: '粉色' },
      { id: 'c7', color: '#8D6E63', name: '棕色' },
      { id: 'c8', color: '#FFFFFF', name: '橡皮' }
    ],
    colorZones: [
      { id: 'z1', label: '小兔子', filled: false, color: 'transparent' },
      { id: 'z2', label: '小松鼠', filled: false, color: 'transparent' },
      { id: 'z3', label: '小狐狸', filled: false, color: 'transparent' },
      { id: 'z4', label: '小蘑菇', filled: false, color: 'transparent' },
      { id: 'z5', label: '小花朵', filled: false, color: 'transparent' },
      { id: 'z6', label: '大树叶', filled: false, color: 'transparent' }
    ]
  },
  {
    id: '5',
    type: 'retell',
    title: '故事创编',
    description: '看完《神秘的海底世界》后，说说你最喜欢的海洋生物是什么',
    bookId: '4',
    bookTitle: '神秘的海底世界',
    difficulty: 'medium',
    completed: false,
    hint: '可以录下声音哦~',
    retellPrompt: '说一说：你最喜欢的海洋生物长什么样？它住在什么地方？如果遇到它，你想和它做什么游戏？'
  },
  {
    id: '6',
    type: 'find',
    title: '找一找：食材大搜索',
    description: '找出小熊做蛋糕需要的3种材料',
    bookId: '6',
    bookTitle: '小熊学做饭',
    difficulty: 'easy',
    completed: false,
    hint: '做蛋糕需要鸡蛋、面粉和牛奶哦~',
    findScene: {
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20kitchen%20scene%20with%20various%20ingredients%20scattered%20flour%20eggs%20milk%20fruits%20soft%20colors%20children%20book%20illustration&image_size=landscape_16_9',
      targets: [
        { id: 'f1', label: '鸡蛋', x: 15, y: 55, width: 12, height: 12, found: false },
        { id: 'f2', label: '面粉', x: 45, y: 35, width: 14, height: 14, found: false },
        { id: 'f3', label: '牛奶', x: 72, y: 50, width: 12, height: 14, found: false }
      ]
    }
  },
  {
    id: '7',
    type: 'emotion',
    title: '心情分享',
    description: '小老虎牙疼的时候是什么心情？你有过类似的经历吗？',
    bookId: '8',
    bookTitle: '不刷牙的小老虎',
    difficulty: 'medium',
    completed: false,
    hint: '牙疼的时候你会怎么样呢？',
    emotionQuestion: {
      scene: '小老虎捂着腮帮子，眼泪在眼眶里打转，眉头皱得紧紧的，连最爱吃的糖果都不想碰了...',
      options: [
        { id: 'h1', emoji: '😄', label: '兴奋', correct: false, feedback: '不是哦~ 兴奋的时候会蹦蹦跳跳，才不会捂着脸呢！' },
        { id: 'h2', emoji: '😖', label: '难受', correct: true, feedback: '答对啦！😣 牙疼的感觉真的很难受，所以我们要每天认真刷牙，保护好小牙齿哦~' },
        { id: 'h3', emoji: '🤗', label: '温暖', correct: false, feedback: '不是哦~ 温暖是被爸爸妈妈抱着的感觉！' },
        { id: 'h4', emoji: '😴', label: '困倦', correct: false, feedback: '不是哦~ 困倦的时候会打哈欠，想睡觉！' }
      ]
    }
  },
  {
    id: '8',
    type: 'color',
    title: '画一画小蝌蚪',
    description: '给小蝌蚪和它的朋友们涂上漂亮的颜色',
    bookId: '7',
    bookTitle: '小蝌蚪找妈妈',
    difficulty: 'hard',
    completed: false,
    hint: '小蝌蚪长大后会变成小青蛙哦~',
    colorPalettes: [
      { id: 'g1', color: '#4CAF50', name: '青蛙绿' },
      { id: 'g2', color: '#2196F3', name: '水蓝色' },
      { id: 'g3', color: '#FFC107', name: '金鱼黄' },
      { id: 'g4', color: '#9C27B0', name: '梦幻紫' },
      { id: 'g5', color: '#FF5722', name: '珊瑚橙' },
      { id: 'g6', color: '#E91E63', name: '粉色' },
      { id: 'g7', color: '#333333', name: '黑色' },
      { id: 'g8', color: '#FFFFFF', name: '橡皮' }
    ],
    colorZones: [
      { id: 'a1', label: '小蝌蚪们', filled: false, color: 'transparent' },
      { id: 'a2', label: '青蛙妈妈', filled: false, color: 'transparent' },
      { id: 'a3', label: '小金鱼', filled: false, color: 'transparent' },
      { id: 'a4', label: '大乌龟', filled: false, color: 'transparent' },
      { id: 'a5', label: '小鲤鱼', filled: false, color: 'transparent' },
      { id: 'a6', label: '池塘水', filled: false, color: 'transparent' },
      { id: 'a7', label: '小荷叶', filled: false, color: 'transparent' },
      { id: 'a8', label: '水泡泡', filled: false, color: 'transparent' }
    ]
  }
];
