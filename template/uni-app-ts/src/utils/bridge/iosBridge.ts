function setupWebViewJavascriptBridge(callback: any) {
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  if (window.WebViewJavascriptBridge) {
  // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return callback(window.WebViewJavascriptBridge)
  }
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  if (window.WVJBCallbacks) {
  // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return window.WVJBCallbacks.push(callback)
  }
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  window.WVJBCallbacks = [callback]
  const WVJBIframe = document.createElement('iframe')
  WVJBIframe.style.display = 'none'
  WVJBIframe.src = 'https://__bridge_loaded__'
  document.documentElement.appendChild(WVJBIframe)
  setTimeout(() => {
    document.documentElement.removeChild(WVJBIframe)
  }, 0)
}

const isReady = (): boolean => !!(window as any).WebViewJavascriptBridge

const handler = {
  callHandler<T>(name: string, data?: any) {
    return new Promise<T>((resolve) => {
      setupWebViewJavascriptBridge((bridge: any) => {
        bridge.callHandler(name, data, (res: any) => {
          resolve(res)
        })
      })
    })
  },
  registerHandler(name: string, callback: any) {
    setupWebViewJavascriptBridge((bridge: any) => {
      bridge.registerHandler(name, (data: any, responseCallback: any) => {
        callback(data, responseCallback)
      })
    })
  },
}

/**
 * 没有返回值的调用
 */
function _invoke(name: string, args?: any) {
  handler.callHandler(name, args)
}

/**
 * 有返回值的调用
 * @param name
 * @param args
 */
function _invokeWithResult<T>(name: string, args?: any): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (isReady()) {
      resolve(handler.callHandler<T>(name, args))
    }
    else {
      reject(new Error('jsBridge is not ready'))
    }
  })
}

function onReady(callback: () => void) {
  setupWebViewJavascriptBridge(() => {
    callback()
  })
}

export default {
  isReady,
  onReady,
  /** 示例 */
  updateToken: (token: string) => _invoke('updateToken', token),
  getLocation: () => _invokeWithResult<{ latitude: string, longitude: string }>('getLocation'),
}
