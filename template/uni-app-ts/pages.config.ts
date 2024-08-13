import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import { pages, pagesA } from './src/router'

export default defineUniPages({
  pages: [...pages],
  subPackages: [pagesA],
  tabBar: {
    color: '#999999',
    selectedColor: '#018d71',
    backgroundColor: '#F8F8F8',
    borderStyle: 'black',
    height: '50px',
    fontSize: '10px',
    iconWidth: '24px',
    spacing: '3px',
    list: [
      {
        iconPath: 'static/tabbar/index.png',
        selectedIconPath: 'static/tabbar/index_active.png',
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        iconPath: 'static/tabbar/mine.png',
        selectedIconPath: 'static/tabbar/mine_active.png',
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
  globalStyle: {
    backgroundColor: '@bgColor',
    backgroundColorBottom: '@bgColorBottom',
    backgroundColorTop: '@bgColorTop',
    backgroundTextStyle: '@bgTxtStyle',
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: '@navTxtStyle',
    navigationBarTitleText: 'Uni Creator',
    navigationStyle: 'custom',
  },
})
