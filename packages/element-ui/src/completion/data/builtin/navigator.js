/** navigator 对象补全项 */
export const navigatorCompletions = [
    {label: 'userAgent', type: 'property', detail: 'string', info: '浏览器的 User-Agent 字符串'},
    {label: 'platform', type: 'property', detail: 'string', info: '操作系统平台'},
    {label: 'language', type: 'property', detail: 'string', info: '首选语言'},
    {label: 'languages', type: 'property', detail: 'string[]', info: '浏览器接受的语言数组'},
    {label: 'onLine', type: 'property', detail: 'boolean', info: '浏览器是否在线'},
    {label: 'hardwareConcurrency', type: 'property', detail: 'number', info: 'CPU 核心数'},
    {label: 'cookieEnabled', type: 'property', detail: 'boolean', info: 'Cookie 是否启用'},
    {label: 'clipboard', type: 'property', detail: 'Clipboard', info: '剪贴板 API'},
    {label: 'storage', type: 'property', detail: 'StorageManager', info: '存储管理器'},
    {
        label: 'serviceWorker',
        type: 'property',
        detail: 'ServiceWorkerContainer',
        info: 'Service Worker 容器'
    },
];
