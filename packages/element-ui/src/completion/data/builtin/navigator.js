/** navigator 对象补全项 */
export const navigatorCompletions = [
  // 标识与语言
  {label: 'userAgent', type: 'property', detail: 'string', info: 'User-Agent 字符串'},
  {label: 'platform', type: 'property', detail: 'string', info: '操作系统平台'},
  {label: 'vendor', type: 'property', detail: 'string', info: '浏览器厂商'},
  {label: 'appVersion', type: 'property', detail: 'string', info: '应用版本信息'},
  {label: 'appName', type: 'property', detail: 'string', info: '应用名称'},
  {label: 'appCodeName', type: 'property', detail: 'string', info: '应用代号'},
  {label: 'product', type: 'property', detail: 'string', info: '产品名称'},
  {label: 'productSub', type: 'property', detail: 'string', info: '产品子版本'},
  {label: 'language', type: 'property', detail: 'string', info: '首选语言'},
  {label: 'languages', type: 'property', detail: 'readonly string[]', info: '接受的语言列表'},
  {label: 'userAgentData', type: 'property', detail: 'NavigatorUAData', info: '用户代理数据（Client Hints）'},

  // 网络与在线状态
  {label: 'onLine', type: 'property', detail: 'boolean', info: '是否在线'},
  {label: 'connection', type: 'property', detail: 'NetworkInformation', info: '网络连接信息'},
  {label: 'cookieEnabled', type: 'property', detail: 'boolean', info: 'Cookie 是否启用'},
  {label: 'doNotTrack', type: 'property', detail: 'string | null', info: 'DNT 设置'},

  // 硬件与能力
  {label: 'hardwareConcurrency', type: 'property', detail: 'number', info: '逻辑 CPU 核心数'},
  {label: 'deviceMemory', type: 'property', detail: 'number', info: '设备内存（GB，约数）'},
  {label: 'maxTouchPoints', type: 'property', detail: 'number', info: '最大触控点数'},
  {label: 'pdfViewerEnabled', type: 'property', detail: 'boolean', info: '是否支持内嵌 PDF 查看'},

  // 子 API
  {label: 'geolocation', type: 'property', detail: 'Geolocation', info: '地理位置 API'},
  {label: 'mediaDevices', type: 'property', detail: 'MediaDevices', info: '媒体设备（摄像头/麦克风）'},
  {label: 'permissions', type: 'property', detail: 'Permissions', info: '权限查询 API'},
  {label: 'clipboard', type: 'property', detail: 'Clipboard', info: '剪贴板 API'},
  {label: 'storage', type: 'property', detail: 'StorageManager', info: '存储配额与持久化'},
  {label: 'credentials', type: 'property', detail: 'CredentialsContainer', info: '凭据管理 API'},
  {label: 'serviceWorker', type: 'property', detail: 'ServiceWorkerContainer', info: 'Service Worker 容器'},
  {label: 'usb', type: 'property', detail: 'USB', info: 'WebUSB API'},
  {label: 'serial', type: 'property', detail: 'Serial', info: 'Web Serial API'},
  {label: 'bluetooth', type: 'property', detail: 'Bluetooth', info: 'Web Bluetooth API'},
  {label: 'wakeLock', type: 'property', detail: 'WakeLock', info: '屏幕唤醒锁'},
  {label: 'keyboard', type: 'property', detail: 'Keyboard', info: '键盘 API'},
  {label: 'locks', type: 'property', detail: 'LockManager', info: 'Web Locks API'},
  {label: 'mediaCapabilities', type: 'property', detail: 'MediaCapabilities', info: '媒体解码能力'},
  {label: 'mediaSession', type: 'property', detail: 'MediaSession', info: '媒体会话（锁屏控制等）'},
  {label: 'presentation', type: 'property', detail: 'Presentation', info: '演示/投屏 API'},
  {label: 'scheduling', type: 'property', detail: 'Scheduling', info: '调度 API'},
  {label: 'userActivation', type: 'property', detail: 'UserActivation', info: '用户激活状态'},
  {label: 'virtualKeyboard', type: 'property', detail: 'VirtualKeyboard', info: '虚拟键盘 API'},
  {label: 'windowControlsOverlay', type: 'property', detail: 'WindowControlsOverlay', info: '窗口控件覆盖层'},
  {label: 'xr', type: 'property', detail: 'XRSystem', info: 'WebXR 设备'},
  {label: 'gpu', type: 'property', detail: 'GPU', info: 'WebGPU 适配器请求'},

  // 方法
  {label: 'javaEnabled', type: 'function', detail: '() => boolean', info: '是否启用 Java（已废弃）'},
  {label: 'sendBeacon', type: 'function', detail: '(url: string, data?: BodyInit) => boolean', info: '异步发送信标数据'},
  {label: 'vibrate', type: 'function', detail: '(pattern: number | number[]) => boolean', info: '设备振动'},
  {label: 'share', type: 'function', detail: '(data?: ShareData) => Promise<void>', info: '系统分享'},
  {label: 'canShare', type: 'function', detail: '(data?: ShareData) => boolean', info: '是否可分享'},
  {label: 'getBattery', type: 'function', detail: '() => Promise<BatteryManager>', info: '电池信息（已废弃，用 getBattery）'},
  {label: 'requestMediaKeySystemAccess', type: 'function', detail: '(keySystem: string, supportedConfigurations: MediaKeySystemConfiguration[]) => Promise<MediaKeySystemAccess>', info: 'DRM 密钥系统'},
  {label: 'requestMIDIAccess', type: 'function', detail: '(options?: MIDIOptions) => Promise<MIDIAccess>', info: 'MIDI 设备访问'},
  {label: 'registerProtocolHandler', type: 'function', detail: '(scheme: string, url: string | URL) => void', info: '注册自定义协议处理'},
  {label: 'unregisterProtocolHandler', type: 'function', detail: '(scheme: string) => void', info: '注销协议处理'},
];
