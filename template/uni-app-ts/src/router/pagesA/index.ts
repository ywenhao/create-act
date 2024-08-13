import type { SubPackage } from '@uni-helper/vite-plugin-uni-pages'
import { testRoutes } from './test'

export const pagesA: SubPackage = {
  root: 'pagesA',
  pages: [...testRoutes],
}
