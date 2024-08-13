import { type Plugin, loadEnv } from 'vite'

export interface ObsStaticOption {
  /**
   * 'development' | 'production'
   * @default 'development'
   */
  mode?: string
  /**
   * @default true
   */
  important?: boolean
  /**
   * @default true
   */
  src?: boolean
  /**
   * @default true
   */
  bgUrl?: boolean
}

export function obsStatic(option?: ObsStaticOption): Plugin {
  const { mode = 'development', important = true, src = true, bgUrl = true } = option || {}
  // eslint-disable-next-line node/prefer-global/process
  const env = loadEnv(mode, process.cwd())
  const { VITE_OBS_URL } = env
  if (!VITE_OBS_URL) {
    throw new Error('VITE_OBS_URL is required')
  }
  return {
    name: 'obs-static',
    transform(code) {
      if (important) {
        code = code.replace(
          /import (.*) from '@\/static\//g,
          ($1, $2) => `const ${$2} = '${VITE_OBS_URL}/static/`,
        )
      }
      if (src) {
        code = code
          .replace(/src="@?\/static\//g, `src="${VITE_OBS_URL}/static/`)
          .replace(/:src="(.*)'(@?\/static\/)/g, ($1, $2, $3) =>
            $1.replace(new RegExp($3, 'g'), `${VITE_OBS_URL}/static/`))
      }

      if (bgUrl) {
        code = code.replace(/url\('@?\/static\//g, `url('${VITE_OBS_URL}/static/`)
      }

      code = code.replace(/'\/static\//g, `'${VITE_OBS_URL}/static/`)
      code = code.replace(/'(\.\.\/)+static\//g, `'${VITE_OBS_URL}/static/`)

      return code
    },
  }
}
