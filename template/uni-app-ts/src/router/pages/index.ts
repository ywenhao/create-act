import type { PageMetaDatum } from '@uni-helper/vite-plugin-uni-pages'
import { homeRoutes } from './home'
import { loginRoutes } from './login'
import { mineRoutes } from './mine'

export const pages: PageMetaDatum[] = [
  ...homeRoutes,
  ...loginRoutes,
  ...mineRoutes,
]
