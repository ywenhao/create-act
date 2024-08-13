import { routerInterceptor } from './router'

export const interceptors = {
  install() {
    routerInterceptor()
  },
}
