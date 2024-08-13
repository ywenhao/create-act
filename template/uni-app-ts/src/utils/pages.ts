/// <reference types="@uni-helper/vite-plugin-uni-pages/client" />
import type { PageMetaDatum, SubPackage } from '@uni-helper/vite-plugin-uni-pages'
import { pages, subPackages } from 'virtual:uni-pages'

export type PageItem = PageMetaDatum & {
  isSubPage?: boolean
}

/**
 * 获取所有页面
 * @returns 页面列表
 */
export function getAllPages(): PageItem[] {
  const sub = subPackages.flatMap((item: SubPackage) =>
    item.pages.map((v: PageItem) =>
      ({ ...v, path: `${item.root}/${v.path}`, isSubPage: true }),
    ),
  )
  return [...pages, ...sub]
}

/**
 * 当前页面是否需要登录
 * @returns boolean
 */
export function isCurrentPageNeedLogin() {
  const currentPages = getCurrentPages()
  const currentPage = currentPages[currentPages.length - 1]
  const pages = getAllPages()
  const noLoginPages = pages.filter(item => !item.needLogin)
  return noLoginPages.some(item => item.path === currentPage)
}

export type SwitchPageUrl = UniNamespace.SwitchTabOptions['url'] & SwitchTabOptions['url']
export type PageUrl = Exclude<UniNamespace.NavigateToOptions['url'] & NavigateToOptions['url'], SwitchPageUrl>

/**
 * 跳转页面
 * @param url 页面路径
 */
export function toPage(url: PageUrl) {
  uni.navigateTo({ url })
}

export function toReplacePage(url: PageUrl) {
  uni.reLaunch({ url })
}

export function toRedirectPage(url: PageUrl) {
  uni.redirectTo({ url })
}

export function toSwitchTab(url: SwitchPageUrl) {
  uni.switchTab({ url })
}
