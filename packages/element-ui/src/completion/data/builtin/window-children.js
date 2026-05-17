/**
 * window 对象上的常见子属性（用于 window. 补全列表）
 * 未单独拆文件的 API 在此登记；运行时仍会合并扫描未列出的属性。
 */
export const windowChildCompletions = [
    {label: 'indexedDB', type: 'class', detail: 'IDBFactory', info: 'IndexedDB 数据库工厂'},
    {label: 'caches', type: 'class', detail: 'CacheStorage', info: 'Cache Storage API'},
    {label: 'frames', type: 'class', detail: 'Window', info: '子框架 window 集合'},
    {label: 'opener', type: 'property', detail: 'Window | null', info: '打开当前窗口的窗口引用'},
    {label: 'closed', type: 'property', detail: 'boolean', info: '窗口是否已关闭'},
    {label: 'name', type: 'property', detail: 'string', info: '窗口名称'},
    {label: 'status', type: 'property', detail: 'string', info: '状态栏文本（已废弃）'},
    {label: 'devicePixelRatio', type: 'property', detail: 'number', info: '设备像素比'},
    {label: 'innerWidth', type: 'property', detail: 'number', info: '视口宽度（含滚动条）'},
    {label: 'innerHeight', type: 'property', detail: 'number', info: '视口高度'},
    {label: 'outerWidth', type: 'property', detail: 'number', info: '浏览器窗口外部宽度'},
    {label: 'outerHeight', type: 'property', detail: 'number', info: '浏览器窗口外部高度'},
    {label: 'screenX', type: 'property', detail: 'number', info: '窗口相对屏幕左偏移'},
    {label: 'screenY', type: 'property', detail: 'number', info: '窗口相对屏幕上偏移'},
    {label: 'scrollX', type: 'property', detail: 'number', info: '水平滚动偏移（pageXOffset 别名）'},
    {label: 'scrollY', type: 'property', detail: 'number', info: '垂直滚动偏移（pageYOffset 别名）'},
    {label: 'visualViewport', type: 'property', detail: 'VisualViewport', info: '视觉视口（移动端缩放）'},
    {label: 'customElements', type: 'property', detail: 'CustomElementRegistry', info: '自定义元素注册表'},
    {label: 'trustedTypes', type: 'property', detail: 'TrustedTypePolicyFactory', info: 'Trusted Types'},
    {label: 'cookieStore', type: 'property', detail: 'CookieStore', info: 'Cookie Store API'},
    {label: 'launchQueue', type: 'property', detail: 'LaunchQueue', info: 'PWA 启动队列'},
    {
        label: 'showOpenFilePicker',
        type: 'function',
        detail: '(options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>',
        info: '打开文件选择器'
    },
    {
        label: 'showSaveFilePicker',
        type: 'function',
        detail: '(options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>',
        info: '保存文件选择器'
    },
    {
        label: 'showDirectoryPicker',
        type: 'function',
        detail: '(options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>',
        info: '目录选择器'
    },
    {
        label: 'requestAnimationFrame',
        type: 'function',
        detail: '(callback: FrameRequestCallback) => number',
        info: '请求动画帧'
    },
    {label: 'cancelAnimationFrame', type: 'function', detail: '(id: number) => void', info: '取消动画帧'},
    {label: 'matchMedia', type: 'function', detail: '(query: string) => MediaQueryList', info: '媒体查询'},
    {
        label: 'getComputedStyle',
        type: 'function',
        detail: '(elt: Element, pseudoElt?: string | null) => CSSStyleDeclaration',
        info: '计算样式'
    },
    {label: 'getSelection', type: 'function', detail: '() => Selection | null', info: '获取文本选区'},
    {label: 'focus', type: 'function', detail: '() => void', info: '聚焦窗口'},
    {label: 'blur', type: 'function', detail: '() => void', info: '取消窗口焦点'},
    {
        label: 'open',
        type: 'function',
        detail: '(url?: string, target?: string, features?: string) => Window | null',
        info: '打开新窗口'
    },
    {label: 'close', type: 'function', detail: '() => void', info: '关闭窗口'},
    {
        label: 'postMessage',
        type: 'function',
        detail: '(message: any, targetOrigin: string, transfer?: Transferable[]) => void',
        info: '跨窗口消息'
    },
    {label: 'print', type: 'function', detail: '() => void', info: '打印'},
    {label: 'stop', type: 'function', detail: '() => void', info: '停止加载'},
    {
        label: 'find',
        type: 'function',
        detail: '(aString: string, aCaseSensitive?: boolean, aBackwards?: boolean, aWrapAround?: boolean, aWholeWord?: boolean, aSearchInFrames?: boolean, aShowDialog?: boolean) => boolean',
        info: '页面内查找'
    },
];
