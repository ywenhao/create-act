const _cbMap = new Map()

let _cbId = 0

// const _bridge = (): any | undefined => (window as any).jsBridge
const isReady = (): boolean => !!(window as any).jsBridge

function _registerCallback<T>(resolve: (value: T) => void, reject: (reason?: any) => void) {
  const id = `jscallback${_cbId++}`
  _cbMap.set(id, { resolve, reject })
  if (!(window as any).jsResolve) {
    ;(window as any).jsResolve = (id: string, value: any) => {
      const cb = _cbMap.get(id)
      if (cb) {
        _cbMap.delete(id)
        cb.resolve(value)
      }
    }
    ;(window as any).jsReject = (id: string, reason?: any) => {
      const cb = _cbMap.get(id)
      if (cb) {
        _cbMap.delete(id)
        try {
          if (reason) {
            cb.reject(reason)
          }
          else {
            cb.reject({})
          }
        }
        catch (error) {
          cb.reject(reason)
        }
      }
    }
  }
  return id
}

function _callJsPlugin(name: string, args?: any, cbId?: string) {
  if (isReady()) {
    let params: any = { name, args }
    if (typeof cbId !== 'undefined' && cbId !== null) {
      params = { ...params, cb: cbId }
    }
    const json = encodeURIComponent(JSON.stringify(params))
    document.location = `jsbridge://jsPlugin?q=${json}`
  }
}

/**
 * 没有返回值的调用
 */
const _invoke = (name: string, args?: any) => _callJsPlugin(name, args)

/**
 * 有返回值的调用
 * @param name
 * @param args
 */
function _invokeWithResult<T>(name: string, args?: any): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (isReady()) {
      const id = _registerCallback(resolve, reject)
      _callJsPlugin(name, args, id)
    }
    else {
      reject(new Error('jsBridge is not ready'))
    }
  })
}

function onReady(callback: () => void) {
  if (isReady()) {
    callback()
  }
  else {
    const listener = () => {
      window.removeEventListener('onJsBridgeReady', listener)
      callback()
    }
    window.addEventListener('onJsBridgeReady', listener)
  }
}

export default {
  isReady,
  onReady,
  /** 示例 */
  updateToken: (token: string) => _invoke('updateToken', token),
  getLocation: () => _invokeWithResult<{ latitude: string, longitude: string }>('getLocation'),
}
