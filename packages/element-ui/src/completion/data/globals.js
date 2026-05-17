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

/**
 * JavaScript 关键字补全（供 global-source 使用，非 window 属性）
 *
 * trailingSpace: false 表示补全后不追加空格（后接 ; . : 等）
 * 未设置时由 keyword-apply.js 按关键字类型自动判断
 */
export const keywordCompletions = [
    // ==================== 声明 ====================
    {label: 'let', type: 'keyword', detail: 'let', info: '声明块级作用域变量', boost: 95},
    {label: 'const', type: 'keyword', detail: 'const', info: '声明常量', boost: 95},
    {label: 'var', type: 'keyword', detail: 'var', info: '声明变量', boost: 90},
    {label: 'function', type: 'keyword', detail: 'function', info: '声明函数', boost: 95},
    {label: 'class', type: 'keyword', detail: 'class', info: '声明类', boost: 95},
    {label: 'async', type: 'keyword', detail: 'async', info: '声明异步函数', boost: 90},
    {label: 'static', type: 'keyword', detail: 'static', info: '类静态成员', boost: 82},
    {label: 'get', type: 'keyword', detail: 'get', info: 'getter 访问器', boost: 80},
    {label: 'set', type: 'keyword', detail: 'set', info: 'setter 访问器', boost: 80},

    // ==================== 条件与分支 ====================
    {label: 'if', type: 'keyword', detail: 'if', info: '条件语句', boost: 90},
    {label: 'else', type: 'keyword', detail: 'else', info: '条件语句的否则分支', boost: 85},
    {label: 'switch', type: 'keyword', detail: 'switch', info: 'switch 分支语句', boost: 85},
    {label: 'case', type: 'keyword', detail: 'case', info: 'switch 的分支', boost: 80},
    {label: 'default', type: 'keyword', detail: 'default', info: 'switch 默认分支 / export default', boost: 80, trailingSpace: false},

    // ==================== 循环 ====================
    {label: 'for', type: 'keyword', detail: 'for', info: '循环语句', boost: 90},
    {label: 'while', type: 'keyword', detail: 'while', info: 'while 循环', boost: 85},
    {label: 'do', type: 'keyword', detail: 'do', info: 'do...while 循环', boost: 80},
    {label: 'in', type: 'keyword', detail: 'in', info: 'for...in 遍历对象属性', boost: 82},
    {label: 'of', type: 'keyword', detail: 'of', info: 'for...of 遍历可迭代对象', boost: 82},
    {label: 'break', type: 'keyword', detail: 'break', info: '跳出当前循环或 switch', boost: 88, trailingSpace: false},
    {label: 'continue', type: 'keyword', detail: 'continue', info: '跳过本次循环，进入下一次', boost: 88, trailingSpace: false},

    // ==================== 跳转与返回 ====================
    {label: 'return', type: 'keyword', detail: 'return', info: '返回语句', boost: 95},
    {label: 'throw', type: 'keyword', detail: 'throw', info: '抛出异常', boost: 85},

    // ==================== 异常处理 ====================
    {label: 'try', type: 'keyword', detail: 'try', info: '异常处理 try 块', boost: 85},
    {label: 'catch', type: 'keyword', detail: 'catch', info: '异常处理 catch 块', boost: 85},
    {label: 'finally', type: 'keyword', detail: 'finally', info: '异常处理 finally 块', boost: 80},

    // ==================== 模块 ====================
    {label: 'import', type: 'keyword', detail: 'import', info: '导入模块', boost: 90},
    {label: 'export', type: 'keyword', detail: 'export', info: '导出模块', boost: 90},
    {label: 'from', type: 'keyword', detail: 'from', info: 'import ... from 模块路径', boost: 78},
    {label: 'as', type: 'keyword', detail: 'as', info: 'import/export 别名', boost: 76},

    // ==================== 类与继承 ====================
    {label: 'extends', type: 'keyword', detail: 'extends', info: '类继承', boost: 85},
    {label: 'super', type: 'keyword', detail: 'super', info: '调用父类构造函数或方法', boost: 85, trailingSpace: false},
    {label: 'new', type: 'keyword', detail: 'new', info: '创建实例', boost: 90},

    // ==================== 运算符关键字 ====================
    {label: 'typeof', type: 'keyword', detail: 'typeof', info: '返回操作数的类型', boost: 85},
    {label: 'instanceof', type: 'keyword', detail: 'instanceof', info: '检查是否为指定类的实例', boost: 85},
    {label: 'delete', type: 'keyword', detail: 'delete', info: '删除对象属性', boost: 80},
    {label: 'void', type: 'keyword', detail: 'void', info: 'void 运算符，返回 undefined', boost: 75},

    // ==================== 异步 / 生成器 ====================
    {label: 'await', type: 'keyword', detail: 'await', info: '等待 Promise 完成', boost: 90},
    {label: 'yield', type: 'keyword', detail: 'yield', info: '生成器 yield 表达式', boost: 85},

    // ==================== 字面量 ====================
    {label: 'this', type: 'keyword', detail: 'this', info: '当前执行上下文', boost: 90, trailingSpace: false},
    {label: 'null', type: 'keyword', detail: 'null', info: '空值', boost: 85, trailingSpace: false},
    {label: 'true', type: 'keyword', detail: 'boolean', info: '布尔值：真', boost: 80, trailingSpace: false},
    {label: 'false', type: 'keyword', detail: 'boolean', info: '布尔值：假', boost: 80, trailingSpace: false},

    // ==================== 调试 ====================
    {label: 'debugger', type: 'keyword', detail: 'debugger', info: '断点调试语句', boost: 75, trailingSpace: false},
];