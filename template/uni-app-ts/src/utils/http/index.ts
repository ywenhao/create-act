import LuchRequest, { type HttpData, type HttpRequestConfig, type HttpRequestTask, type HttpResponse } from 'luch-request'
import { ResultEnum } from '@/enums/httpEnum'
import { PageUrlEnum } from '@/enums/pageEnum'

export interface HttpCustom {
  /**
   * 请求是否需要登录
   * @default true
   */
  needLogin?: boolean
  /**
   * 请求是否返回原生数据
   * @default false
   */
  isNativeData?: boolean
  /**
   * 请求是否需要隐藏错误提示
   * @default false
   */
  hideErrorToast?: boolean
}

export interface IResData<T> {
  data: T
  code: number
  msg: string
}

// h5 使用前缀结合vite代理，其他平台直接使用 VITE_SERVER_BASEURL
let BASE_URL = import.meta.env.VITE_SERVER_BASEURL
// #ifdef H5
BASE_URL = import.meta.env.VITE_API_PREFIX
// #endif

const instance = new LuchRequest({
  baseURL: BASE_URL,
  custom: {
    needLogin: true,
    isNativeData: false,
  } satisfies HttpCustom,
})

/**
 * 请求拦截器
 */
instance.interceptors.request.use((config) => {
  const custom = config?.custom as HttpCustom

  // 不需要登录
  const needLogin = !!custom?.needLogin
  if (!needLogin)
    return config

  if (!isCurrentPageNeedLogin() && needLogin) {
    const currentPages = getCurrentPages()
    const page = currentPages[currentPages.length - 1]
    console.error('当前页面不需要登录，但该请求需要登录：', { page, requestConfig: config })
    return Promise.reject(config)
  }

  // 没有token
  const loginStore = useLoginStore()
  if (!loginStore.token) {
    toLoginPage()
    return Promise.reject(config)
  }

  config.header = {
    ...config.header,
    Authorization: `Bearer ${loginStore.token}`,
  }

  return config
}, config => Promise.reject(config))

/**
 * 响应拦截器
 */
instance.interceptors.response.use((response) => {
  const custom = response.config?.custom as HttpCustom

  const isNativeData = !!custom?.isNativeData
  const hideErrorToast = !!custom?.hideErrorToast

  const data = response.data
  const { code, msg, data: resData } = data || {}

  if (code === ResultEnum.SUCCESS)
    return Promise.resolve(isNativeData ? response : resData)

  // 错误弹窗
  !hideErrorToast && uni.showToast({
    title: msg || '请求失败',
    icon: 'none',
  })

  return Promise.reject(data)
}, (error) => {
  // error.statusCode !== 200 会走这里
  const custom = error.config?.custom as HttpCustom

  const isNativeData = !!custom?.isNativeData
  const hideErrorToast = !!custom?.hideErrorToast

  const { data, statusCode } = error

  const resData = isNativeData ? error : data

  // 错误弹窗
  !hideErrorToast && uni.showToast({
    title: data?.msg || '请求失败',
    icon: 'none',
  })

  // 未登录
  statusCode === ResultEnum.UNAUTHORIZED && toLoginPage()

  return Promise.reject(resData)
})

type HttpConfig<O extends keyof HttpRequestConfig = 'data', T = HttpRequestTask> = Omit<HttpRequestConfig<T>, 'custom' | O> & {
  custom?: HttpCustom
}

type HttpRes<D, C extends HttpConfig> = NonNullable<NonNullable<C>['custom']>['isNativeData'] extends true ? Promise<HttpResponse<IResData<D>>> : Promise<D>

function requestGet<D = any, C extends HttpConfig = HttpConfig<'params'>>(url: string, params?: any, config?: C) {
  return instance.get(url, {
    ...config,
    params,
  }) as HttpRes<D, C>
}

function requestPost<D = any, C extends HttpConfig = HttpConfig<'data'>>(url: string, data?: HttpData, config?: C) {
  return instance.post(url, {
    ...config,
    data,
  }) as HttpRes<D, C>
}

function requestDelete<D = any, C extends HttpConfig = HttpConfig<'data'>>(url: string, data?: HttpData, config?: C) {
  return instance.delete(url, {
    ...config,
    data,
  }) as HttpRes<D, C>
}

function requestPut<D = any, C extends HttpConfig = HttpConfig<'data'>>(url: string, data?: HttpData, config?: C) {
  return instance.put(url, {
    ...config,
    data,
  }) as HttpRes<D, C>
}

function toLoginPage() {
  toPage(PageUrlEnum.LOGIN)
}

export const $http = {
  get: requestGet,
  post: requestPost,
  delete: requestDelete,
  put: requestPut,
}
