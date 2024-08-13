import { PageUrlEnum } from '@/enums/pageEnum'

const InterceptorList = ['navigateTo', 'switchTab', 'reLaunch', 'redirectTo'] as const

type InterceptorKey = typeof InterceptorList[number]

function createInvokeHandler(_type: InterceptorKey) {
  const pages = getAllPages()
  const noLoginPages = pages.filter(item => !item.needLogin)
  const noLoginPaths = noLoginPages.map(item => `/${item.path}`)

  return (result: any) => {
    const path = getPath(result.url)
    // 判断是否需要登录的页面
    if (noLoginPaths.includes(path))
      return true

    // 判断是否是已登录登录状态
    const loginStore = useLoginStore()
    if (loginStore.isLogin)
      return true

    // 跳转到登录页
    const redirectRoute = `${PageUrlEnum.LOGIN}?redirect=${encodeURIComponent(result.url)}`
    uni.navigateTo({ url: redirectRoute })

    // console.log('router-invoke', { path, noLoginPaths })
    return false
  }
}

function getPath(path: string) {
  if (path === '/')
    return PageUrlEnum.HOME

  return path.split('?')[0]
}

// 拦截路由
export function routerInterceptor() {
  // if (isMP_WEIXIN) {
  InterceptorList.forEach((type) => {
    uni.addInterceptor(type, {
      invoke: createInvokeHandler(type),
    })
  })
// }
}
