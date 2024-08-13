import { URL, fileURLToPath } from 'node:url'

import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'
import UniPages from '@uni-helper/vite-plugin-uni-pages'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'
import uni from '@dcloudio/vite-plugin-uni'
import UniMiddleware from '@uni-helper/vite-plugin-uni-middleware'
import UniPlatformModifier from '@uni-helper/vite-plugin-uni-platform-modifier'
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'
import Components from '@uni-helper/vite-plugin-uni-components'
import AutoImport from 'unplugin-auto-import/vite'
import { UniUIResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'

export default async ({ mode }: ConfigEnv) => {
  const UnoCSS = (await import('unocss/vite')).default

  // eslint-disable-next-line node/prefer-global/process
  const env = loadEnv(mode, process.cwd())
  const { VITE_PORT, VITE_SERVER_BASEURL, VITE_SHOW_SOURCEMAP, VITE_DELETE_CONSOLE } = env

  return <UserConfig>{
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      // 替换项目中static路径
      // obsStatic(),
      // https://github.com/uni-helper/vite-plugin-uni-pages
      UniPages({
        exclude: ['**/components/**/**.*'],
        routeBlockLang: 'json5',
        dts: './uni-pages.d.ts',
      }),
      // https://github.com/uni-helper/vite-plugin-uni-layouts
      UniLayouts(),
      // https://github.com/uni-helper/vite-plugin-uni-platform
      UniPlatform(),
      uni(),
      UnoCSS(),
      // https://github.com/uni-helper/vite-plugin-uni-middleware
      UniMiddleware(),
      // https://github.com/uni-helper/vite-plugin-uni-platform-modifier
      UniPlatformModifier(),
      // https://github.com/uni-helper/vite-plugin-uni-manifest
      UniManifest(),
      Components({
        dts: true,
        resolvers: [UniUIResolver()],
      }),
      AutoImport({
        imports: ['vue', 'uni-app', 'pinia', '@vueuse/core'],
        dts: './auto-imports.d.ts',
        dirs: ['src/hooks', 'src/utils/**/*', 'src/stores'],
        eslintrc: { enabled: true },
        vueTemplate: true,
      }),
      // 删除打包产物的静态资源
      // deleteStatic(['tabBar']),
    ],
    build: {
      target: 'es6',
      cssTarget: 'chrome61',
      // 方便非h5端调试
      sourcemap: VITE_SHOW_SOURCEMAP === 'true', // 默认是false
      // 开发环境不用压缩
      minify: mode === 'development' ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: VITE_DELETE_CONSOLE === 'true',
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      exclude: [
        'vue-demi',
      ],
    },
    server: {
      port: Number(VITE_PORT),
      proxy: {
        '/api': {
          target: VITE_SERVER_BASEURL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
}
