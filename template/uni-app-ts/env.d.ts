/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

// import.meta.env 的类型定义扩写
interface ImportMetaEnv {
  /** 网站标题 */
  VITE_APP_TITLE: string
  /** 服务端口 */
  VITE_PORT: number
  /** 接口请求前缀 */
  VITE_API_PREFIX: string
  /** 后台接口地址 */
  VITE_SERVER_BASEURL: string
  /** 是否清除console */
  readonly VITE_DELETE_CONSOLE: string
  // 更多环境变量...
}
