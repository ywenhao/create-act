// 是否开发环境 （dev/build）
export const isDev = import.meta.env.DEV

// 开发环境模式
export const envMode = import.meta.env.MODE
export const isDevelopmentMode = envMode === 'development'
export const isProductionMode = envMode === 'production'
export const isTestMode = envMode === 'test'
