import type { PageMetaDatum } from '@uni-helper/vite-plugin-uni-pages'

export const homeRoutes: PageMetaDatum[] = [
  {
    path: 'pages/index/index',
    type: 'home',
    needLogin: false,
  },
]
