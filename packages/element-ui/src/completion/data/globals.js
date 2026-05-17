/**
 * 全局变量补全数据
 *
 * 这些是所有环境（或大多数环境）都支持的全局标识符。
 * 根据 requires 字段，在环境检测后自动过滤。
 */
export const globalCompletions = [
    // ==================== 始终可用的内置对象 ====================
    {label: 'Math', type: 'class', detail: 'object', info: '数学运算对象'},
    {label: 'console', type: 'class', detail: 'object', info: '控制台对象'},
    {label: 'JSON', type: 'class', detail: 'object', info: 'JSON 解析和序列化'},
    {label: 'Array', type: 'class', detail: 'constructor', info: '数组构造函数'},
    {label: 'Object', type: 'class', detail: 'constructor', info: '对象构造函数'},
    {label: 'String', type: 'class', detail: 'constructor', info: '字符串构造函数'},
    {label: 'Number', type: 'class', detail: 'constructor', info: '数字构造函数'},
    {label: 'Boolean', type: 'class', detail: 'constructor', info: '布尔构造函数'},
    {label: 'Date', type: 'class', detail: 'constructor', info: '日期构造函数'},
    {label: 'RegExp', type: 'class', detail: 'constructor', info: '正则表达式构造函数'},
    {label: 'Promise', type: 'class', detail: 'constructor', info: 'Promise 构造函数'},
    {label: 'Map', type: 'class', detail: 'constructor', info: 'Map 构造函数'},
    {label: 'Set', type: 'class', detail: 'constructor', info: 'Set 构造函数'},
    {label: 'WeakMap', type: 'class', detail: 'constructor', info: 'WeakMap 构造函数'},
    {label: 'WeakSet', type: 'class', detail: 'constructor', info: 'WeakSet 构造函数'},
    {label: 'Error', type: 'class', detail: 'constructor', info: '错误构造函数'},
    {label: 'TypeError', type: 'class', detail: 'constructor', info: '类型错误构造函数'},
    {label: 'RangeError', type: 'class', detail: 'constructor', info: '范围错误构造函数'},
    {label: 'SyntaxError', type: 'class', detail: 'constructor', info: '语法错误构造函数'},
    {label: 'ReferenceError', type: 'class', detail: 'constructor', info: '引用错误构造函数'},

    // ==================== 全局函数 ====================
    {
        label: 'setTimeout',
        type: 'function',
        detail: '(handler: Function, timeout?: number, ...args: any[]) => number',
        info: '延迟执行函数'
    },
    {
        label: 'setInterval',
        type: 'function',
        detail: '(handler: Function, timeout?: number, ...args: any[]) => number',
        info: '定时执行函数'
    },
    {label: 'clearTimeout', type: 'function', detail: '(id: number) => void', info: '清除延迟执行'},
    {label: 'clearInterval', type: 'function', detail: '(id: number) => void', info: '清除定时执行'},
    {
        label: 'fetch',
        type: 'function',
        detail: '(input: RequestInfo, init?: RequestInit) => Promise<Response>',
        info: '发起网络请求'
    },
    {label: 'parseInt', type: 'function', detail: '(string: string, radix?: number) => number', info: '解析整数'},
    {label: 'parseFloat', type: 'function', detail: '(string: string) => number', info: '解析浮点数'},
    {label: 'isNaN', type: 'function', detail: '(value: any) => boolean', info: '判断是否为 NaN'},
    {label: 'isFinite', type: 'function', detail: '(value: any) => boolean', info: '判断是否为有限数'},
    {label: 'encodeURI', type: 'function', detail: '(uri: string) => string', info: '编码 URI'},
    {label: 'decodeURI', type: 'function', detail: '(encodedURI: string) => string', info: '解码 URI'},
    {label: 'encodeURIComponent', type: 'function', detail: '(component: string) => string', info: '编码 URI 组件'},
    {
        label: 'decodeURIComponent',
        type: 'function',
        detail: '(encodedComponent: string) => string',
        info: '解码 URI 组件'
    },
    {label: 'atob', type: 'function', detail: '(encodedData: string) => string', info: '解码 Base64'},
    {label: 'btoa', type: 'function', detail: '(stringToEncode: string) => string', info: '编码 Base64'},

    // ==================== 全局值 ====================
    {label: 'NaN', type: 'constant', detail: 'number', info: 'Not-a-Number'},
    {label: 'Infinity', type: 'constant', detail: 'number', info: '无穷大'},
    {label: 'undefined', type: 'constant', detail: 'undefined', info: '未定义'},
    {label: 'globalThis', type: 'class', detail: 'Window | typeof globalThis', info: '全局对象'},

    // ==================== 浏览器专属（有 requires） ====================
    {label: 'document', type: 'class', detail: 'Document', info: '文档对象', requires: ['hasDocument']},
    {label: 'localStorage', type: 'class', detail: 'Storage', info: '本地存储对象', requires: ['hasLocalStorage']},
    {label: 'sessionStorage', type: 'class', detail: 'Storage', info: '会话存储对象', requires: ['hasSessionStorage']},
    {label: 'location', type: 'class', detail: 'Location', info: '位置对象', requires: ['hasWindow']},
    {label: 'history', type: 'class', detail: 'History', info: '历史记录对象', requires: ['hasWindow']},
    {label: 'navigator', type: 'class', detail: 'Navigator', info: '浏览器信息对象', requires: ['hasNavigator']},
    {label: 'screen', type: 'class', detail: 'Screen', info: '屏幕信息对象', requires: ['hasWindow']},
    {label: 'window', type: 'class', detail: 'Window', info: '浏览器窗口对象', requires: ['hasWindow']},
    {label: 'self', type: 'class', detail: 'Window', info: '当前窗口的引用', requires: ['hasWindow']},
    {label: 'top', type: 'class', detail: 'Window', info: '最顶层窗口的引用', requires: ['hasWindow']},
    {label: 'parent', type: 'class', detail: 'Window', info: '父窗口的引用', requires: ['hasWindow']},
    {label: 'alert', type: 'function', detail: '(message?: any) => void', info: '警告弹窗', requires: ['hasWindow']},
    {
        label: 'confirm',
        type: 'function',
        detail: '(message?: string) => boolean',
        info: '确认弹窗',
        requires: ['hasWindow']
    },
    {
        label: 'prompt',
        type: 'function',
        detail: '(message?: string, defaultValue?: string) => string | null',
        info: '输入弹窗',
        requires: ['hasWindow']
    },

    // ==================== 条件可用 ====================
    {label: 'crypto', type: 'class', detail: 'Crypto', info: '加密 API', requires: ['hasCrypto']},
    {label: 'performance', type: 'class', detail: 'Performance', info: '性能 API', requires: ['hasPerformance']},
    {label: 'Symbol', type: 'class', detail: 'Symbol', info: '符号类型', requires: ['hasSymbol']},
    {label: 'BigInt', type: 'class', detail: 'BigInt', info: '大整数', requires: ['hasBigInt']},
    {label: 'Intl', type: 'class', detail: 'Intl', info: '国际化 API', requires: ['hasIntl']},
    {label: 'Proxy', type: 'class', detail: 'Proxy', info: '代理对象', requires: ['hasProxy']},
    {label: 'Reflect', type: 'class', detail: 'Reflect', info: '反射 API', requires: ['hasProxy']},
    {label: 'WebSocket', type: 'class', detail: 'WebSocket', info: 'WebSocket 连接', requires: ['hasWebSocket']},
    {label: 'EventSource', type: 'class', detail: 'EventSource', info: 'SSE 客户端', requires: ['hasWindow']},
    {label: 'Worker', type: 'class', detail: 'Worker', info: 'Web Worker', requires: ['hasWorker']},
    {label: 'File', type: 'class', detail: 'File', info: '文件对象', requires: ['hasFileAPI']},
    {label: 'FileReader', type: 'class', detail: 'FileReader', info: '文件读取器', requires: ['hasFileAPI']},
    {label: 'Blob', type: 'class', detail: 'Blob', info: '二进制大对象', requires: ['hasFileAPI']},
    {label: 'URL', type: 'class', detail: 'URL', info: 'URL 对象', requires: ['hasWindow']},
    {label: 'URLSearchParams', type: 'class', detail: 'URLSearchParams', info: 'URL 查询参数', requires: ['hasWindow']},
    {label: 'FormData', type: 'class', detail: 'FormData', info: '表单数据', requires: ['hasWindow']},
    {
        label: 'IntersectionObserver',
        type: 'class',
        detail: 'IntersectionObserver',
        info: '交叉观察器',
        requires: ['hasIntersectionObserver']
    },
    {
        label: 'MutationObserver',
        type: 'class',
        detail: 'MutationObserver',
        info: '突变观察器',
        requires: ['hasMutationObserver']
    },
    {
        label: 'ResizeObserver',
        type: 'class',
        detail: 'ResizeObserver',
        info: '尺寸观察器',
        requires: ['hasResizeObserver']
    },
    {
        label: 'AbortController',
        type: 'class',
        detail: 'AbortController',
        info: '中止控制器',
        requires: ['hasAbortController']
    },
    {label: 'ReadableStream', type: 'class', detail: 'ReadableStream', info: '可读流', requires: ['hasReadableStream']},
    {label: 'WritableStream', type: 'class', detail: 'WritableStream', info: '可写流', requires: ['hasReadableStream']},
    {
        label: 'BroadcastChannel',
        type: 'class',
        detail: 'BroadcastChannel',
        info: '广播通道',
        requires: ['hasBroadcastChannel']
    },
    {label: 'Notification', type: 'class', detail: 'Notification', info: '通知 API', requires: ['hasNotification']},
    {label: 'Clipboard', type: 'class', detail: 'Clipboard', info: '剪贴板 API', requires: ['hasClipboard']},
    {label: 'scheduler', type: 'class', detail: 'Scheduler', info: '调度器', requires: ['hasScheduler']},
    {label: 'queueMicrotask', type: 'function', detail: '(callback: Function) => void', info: '添加微任务'},

    // Node.js 全局
    {label: 'process', type: 'class', detail: 'Process', info: 'Node.js 进程对象', requires: ['type:node']},
    {label: 'Buffer', type: 'class', detail: 'Buffer', info: 'Node.js Buffer 类', requires: ['type:node']},
    {label: 'global', type: 'class', detail: 'typeof global', info: 'Node.js 全局对象', requires: ['type:node']},
    {label: '__dirname', type: 'variable', detail: 'string', info: '当前目录路径', requires: ['type:node']},
    {label: '__filename', type: 'variable', detail: 'string', info: '当前文件路径', requires: ['type:node']},
    {
        label: 'require',
        type: 'function',
        detail: '(id: string) => any',
        info: 'Node.js require 函数',
        requires: ['type:node']
    },
    {label: 'module', type: 'class', detail: 'Module', info: 'Node.js 模块对象', requires: ['type:node']},
    {label: 'exports', type: 'class', detail: 'object', info: 'Node.js 导出对象', requires: ['type:node']},
];

/**
 * 添加全局函数/变量（从全局补全中提取）
 */
export const windowGlobalProps = [
    {
        label: 'parseInt',
        type: 'function',
        detail: '(string: string, radix?: number) => number',
        info: '解析字符串为整数'
    },
    {label: 'parseFloat', type: 'function', detail: '(string: string) => number', info: '解析字符串为浮点数'},
    {label: 'isNaN', type: 'function', detail: '(value: any) => boolean', info: '判断值是否为 NaN'},
    {label: 'isFinite', type: 'function', detail: '(value: any) => boolean', info: '判断值是否为有限数'},
    {label: 'encodeURI', type: 'function', detail: '(uri: string) => string', info: '编码 URI'},
    {label: 'decodeURI', type: 'function', detail: '(encodedURI: string) => string', info: '解码 URI'},
    {label: 'encodeURIComponent', type: 'function', detail: '(component: string) => string', info: '编码 URI 组件'},
    {
        label: 'decodeURIComponent',
        type: 'function',
        detail: '(encodedComponent: string) => string',
        info: '解码 URI 组件'
    },
    {label: 'atob', type: 'function', detail: '(encodedData: string) => string', info: '解码 Base64'},
    {label: 'btoa', type: 'function', detail: '(stringToEncode: string) => string', info: '编码 Base64'},
    {
        label: 'fetch',
        type: 'function',
        detail: '(input: RequestInfo, init?: RequestInit) => Promise<Response>',
        info: '发起网络请求'
    },
    {
        label: 'setTimeout',
        type: 'function',
        detail: '(handler: Function, timeout?: number, ...args: any[]) => number',
        info: '延迟执行'
    },
    {label: 'clearTimeout', type: 'function', detail: '(id: number) => void', info: '清除延迟执行'},
    {
        label: 'setInterval',
        type: 'function',
        detail: '(handler: Function, timeout?: number, ...args: any[]) => number',
        info: '定时执行'
    },
    {label: 'clearInterval', type: 'function', detail: '(id: number) => void', info: '清除定时执行'},
    {label: 'alert', type: 'function', detail: '(message?: any) => void', info: '警告弹窗'},
    {label: 'confirm', type: 'function', detail: '(message?: string) => boolean', info: '确认弹窗'},
    {
        label: 'prompt',
        type: 'function',
        detail: '(message?: string, defaultValue?: string) => string | null',
        info: '输入弹窗'
    },
    {label: 'NaN', type: 'constant', detail: 'number', info: 'Not-a-Number'},
    {label: 'Infinity', type: 'constant', detail: 'number', info: '无穷大'},
    {label: 'undefined', type: 'constant', detail: 'undefined', info: '未定义'},
];