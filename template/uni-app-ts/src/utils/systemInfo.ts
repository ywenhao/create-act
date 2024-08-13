const brands = {
  IPHONE: 'IPHONE|IPAD|IPOD|IOS',
  OPPO: 'OPPO',
  VIVO: 'VIVO',
  HONOR: 'HONOR',
  HUAWEI: 'HUAWEI',
  XIAOMI: 'XIAOMI|REDMI',
  SAMSUNG: 'SAMSUNG',
} as const

export type BrandKey = keyof typeof brands

export type AndroidBrandKey = Exclude<BrandKey, 'IPHONE'>

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
const brandsRegExps: Record<BrandKey, RegExp> = {}

for (const key in brands) {
  const k = key as BrandKey
  brandsRegExps[k] = new RegExp(brands[k], 'i')
}

const userAgent = (() => {
  let userAgent = ''

  // #ifdef MP_WEIXIN
  userAgent = 'micromessenger miniprogram'
  // #endif

  userAgent = window ? window.navigator.userAgent.toUpperCase() : ''

  return userAgent
})()

/**
 * 获取系统名: 小程序，安卓或者ios
 */
export function getOS(): 'MP_WEIXIN' | 'MP_WEIXIN_WEBVIEW' | 'ANDROID' | 'IOS' | undefined {
  const isMP_WEIXIN = /micromessenger/i.test(userAgent) && /miniprogram/i.test(userAgent)
  if (!!window && isMP_WEIXIN) {
    return 'MP_WEIXIN_WEBVIEW'
  }

  if (isMP_WEIXIN) {
    return 'MP_WEIXIN'
  }
  if (userAgent.includes('ANDROID')) {
    return 'ANDROID'
  }
  if (userAgent.includes('IPHONE')) {
    return 'IOS'
  }
}

/**
 * 获取设备品牌
 */
export function getBrand() {
  const result = []
  for (const key in brands) {
    if (brandsRegExps[key as BrandKey].test(userAgent)) {
      result.push(key)
    }
  }
  return result[0] as BrandKey | undefined
}

// 获取系统信息
export const systemInfo = {
  os: getOS(),
  brand: getBrand(),
}

/** 是否微信小程序webview环境 */
export const isMP_WEIXIN_WEBVIEW = systemInfo.os === 'MP_WEIXIN_WEBVIEW'
/** 是否微信小程序环境 */
export const isMP_WEIXIN = systemInfo.os === 'MP_WEIXIN'
/** 是否安卓环境 */
export const isAndroid = systemInfo.os === 'ANDROID'
/** 是否苹果环境 */
export const isIOS = systemInfo.os === 'IOS'
/** 是否edge浏览器环境 */
export const isEdge = !isMP_WEIXIN && userAgent.includes('EDG')
