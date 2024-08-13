import type { PageMetaDatum } from '@uni-helper/vite-plugin-uni-pages'

export const loginRoutes: PageMetaDatum[] = [
  {
    path: 'pages/login/index',
    type: 'login',
    needLogin: false,
  },
]
