export default defineAppConfig({
  pages: [
    'pages/bookshelf/index',
    'pages/tasks/index',
    'pages/recording/index',
    'pages/growth/index',
    'pages/reader/index',
    'pages/book-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF8A65',
    navigationBarTitleText: '睡前共读',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF8F0'
  },
  tabBar: {
    color: '#A1887F',
    selectedColor: '#FF8A65',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/bookshelf/index',
        text: '书架'
      },
      {
        pagePath: 'pages/tasks/index',
        text: '亲子任务'
      },
      {
        pagePath: 'pages/recording/index',
        text: '录音'
      },
      {
        pagePath: 'pages/growth/index',
        text: '成长记录'
      }
    ]
  }
})
