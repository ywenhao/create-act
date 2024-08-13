import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import 'uno.css'

import { interceptors } from '@/interceptors'

export function createApp() {
  const app = createSSRApp(App)

  // 拦截器
  app.use(interceptors)
  app.use(stores)
  return {
    app,
    Pinia,
  }
}
