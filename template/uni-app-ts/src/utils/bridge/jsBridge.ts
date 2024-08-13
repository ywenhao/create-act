import androidBridge from './androidBridge'
import iosBridge from './iosBridge'

const { os } = systemInfo

export const jsBridge = os === 'IOS' ? iosBridge : androidBridge
