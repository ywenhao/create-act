import type { PageMetaDatum } from '@uni-helper/vite-plugin-uni-pages'

export const mineRoutes: PageMetaDatum[] = [
  {
    path: 'pages/mine/index',
    type: 'mine',
    needLogin: false,
  },
]
