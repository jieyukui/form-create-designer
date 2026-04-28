// 常用的内置对象及其属性和方法（带完整签名）

export const builtinCompletions = {
    Math: [
        {label: 'abs', type: 'function', detail: '(x: number) => number', info: '返回绝对值'},
        {label: 'ceil', type: 'function', detail: '(x: number) => number', info: '向上取整'},
        {label: 'floor', type: 'function', detail: '(x: number) => number', info: '向下取整'},
        {label: 'round', type: 'function', detail: '(x: number) => number', info: '四舍五入'},
        {label: 'max', type: 'function', detail: '(...values: number[]) => number', info: '返回最大值'},
        {label: 'min', type: 'function', detail: '(...values: number[]) => number', info: '返回最小值'},
        {label: 'random', type: 'function', detail: '() => number', info: '返回 0-1 之间的随机数'},
        {label: 'sqrt', type: 'function', detail: '(x: number) => number', info: '返回平方根'},
        {
            label: 'pow',
            type: 'function',
            detail: '(base: number, exponent: number) => number',
            info: '返回 base 的 exponent 次幂'
        },
        {label: 'sin', type: 'function', detail: '(x: number) => number', info: '返回正弦值'},
        {label: 'cos', type: 'function', detail: '(x: number) => number', info: '返回余弦值'},
        {label: 'tan', type: 'function', detail: '(x: number) => number', info: '返回正切值'},
        {label: 'asin', type: 'function', detail: '(x: number) => number', info: '返回反正弦值'},
        {label: 'acos', type: 'function', detail: '(x: number) => number', info: '返回反余弦值'},
        {label: 'atan', type: 'function', detail: '(x: number) => number', info: '返回反正切值'},
        {
            label: 'atan2',
            type: 'function',
            detail: '(y: number, x: number) => number',
            info: '返回从 x 轴到点 (x,y) 的角度'
        },
        {label: 'exp', type: 'function', detail: '(x: number) => number', info: '返回 e 的 x 次幂'},
        {label: 'log', type: 'function', detail: '(x: number) => number', info: '返回自然对数'},
        {label: 'log10', type: 'function', detail: '(x: number) => number', info: '返回以 10 为底的对数'},
        {label: 'cbrt', type: 'function', detail: '(x: number) => number', info: '返回立方根'},
        {label: 'hypot', type: 'function', detail: '(...values: number[]) => number', info: '返回平方和的平方根'},
        {label: 'trunc', type: 'function', detail: '(x: number) => number', info: '返回整数部分'},
        {label: 'sign', type: 'function', detail: '(x: number) => number', info: '返回符号函数'},
        {label: 'PI', type: 'constant', detail: '3.141592653589793', info: '圆周率 π'},
        {label: 'E', type: 'constant', detail: '2.718281828459045', info: '自然对数的底数 e'},
        {label: 'LN2', type: 'constant', detail: '0.6931471805599453', info: '2 的自然对数'},
        {label: 'LN10', type: 'constant', detail: '2.302585092994046', info: '10 的自然对数'},
        {label: 'LOG2E', type: 'constant', detail: '1.4426950408889634', info: '以 2 为底 e 的对数'},
        {label: 'LOG10E', type: 'constant', detail: '0.4342944819032518', info: '以 10 为底 e 的对数'},
        {label: 'SQRT1_2', type: 'constant', detail: '0.7071067811865476', info: '1/2 的平方根'},
        {label: 'SQRT2', type: 'constant', detail: '1.4142135623730951', info: '2 的平方根'}
    ],
    console: [
        {label: 'log', type: 'function', detail: '(...args: any[]) => void', info: '输出日志信息'},
        {label: 'error', type: 'function', detail: '(...args: any[]) => void', info: '输出错误信息'},
        {label: 'warn', type: 'function', detail: '(...args: any[]) => void', info: '输出警告信息'},
        {label: 'info', type: 'function', detail: '(...args: any[]) => void', info: '输出信息'},
        {label: 'debug', type: 'function', detail: '(...args: any[]) => void', info: '输出调试信息'},
        {
            label: 'table',
            type: 'function',
            detail: '(data: any, columns?: string[]) => void',
            info: '以表格形式显示数据'
        },
        {label: 'time', type: 'function', detail: '(label?: string) => void', info: '启动计时器'},
        {label: 'timeEnd', type: 'function', detail: '(label?: string) => void', info: '停止计时器'},
        {label: 'group', type: 'function', detail: '(label?: string) => void', info: '创建分组'},
        {label: 'groupEnd', type: 'function', detail: '() => void', info: '结束分组'},
        {label: 'clear', type: 'function', detail: '() => void', info: '清空控制台'}
    ],
    JSON: [
        {
            label: 'parse',
            type: 'function',
            detail: '(text: string, reviver?: Function) => any',
            info: '解析 JSON 字符串'
        },
        {
            label: 'stringify',
            type: 'function',
            detail: '(value: any, replacer?: Function, space?: number) => string',
            info: '序列化为 JSON 字符串'
        }
    ],
    Array: [
        {label: 'isArray', type: 'function', detail: '(value: any) => boolean', info: '判断是否为数组'},
        {
            label: 'from',
            type: 'function',
            detail: '(arrayLike: ArrayLike<T>, mapFn?: Function, thisArg?: any) => T[]',
            info: '从类数组对象创建数组'
        },
        {label: 'of', type: 'function', detail: '(...items: T[]) => T[]', info: '从参数创建数组'}
    ],
    Object: [
        {label: 'keys', type: 'function', detail: '(obj: object) => string[]', info: '返回对象自身的可枚举属性名'},
        {label: 'values', type: 'function', detail: '(obj: object) => any[]', info: '返回对象自身的可枚举属性值'},
        {label: 'entries', type: 'function', detail: '(obj: object) => [string, any][]', info: '返回键值对数组'},
        {label: 'assign', type: 'function', detail: '(target: T, ...sources: any[]) => T', info: '合并对象'},
        {
            label: 'create',
            type: 'function',
            detail: '(proto: object | null, properties?: PropertyDescriptorMap) => object',
            info: '创建新对象'
        },
        {
            label: 'defineProperty',
            type: 'function',
            detail: '(obj: object, prop: string, descriptor: PropertyDescriptor) => object',
            info: '定义属性'
        },
        {label: 'freeze', type: 'function', detail: '(obj: T) => T', info: '冻结对象'},
        {label: 'seal', type: 'function', detail: '(obj: T) => T', info: '密封对象'}
    ],
    String: [
        {
            label: 'fromCharCode',
            type: 'function',
            detail: '(...codes: number[]) => string',
            info: '从 Unicode 编码创建字符串'
        },
        {
            label: 'fromCodePoint',
            type: 'function',
            detail: '(...codePoints: number[]) => string',
            info: '从码点创建字符串'
        },
        {
            label: 'raw',
            type: 'function',
            detail: '(template: TemplateStringsArray, ...substitutions: any[]) => string',
            info: '获取原始字符串'
        }
    ],
    Promise: [
        {label: 'resolve', type: 'function', detail: '<T>(value: T) => Promise<T>', info: '创建已解决的 Promise'},
        {
            label: 'reject',
            type: 'function',
            detail: '<T = never>(reason?: any) => Promise<T>',
            info: '创建已拒绝的 Promise'
        },
        {
            label: 'all',
            type: 'function',
            detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T[]>',
            info: '等待所有 Promise 完成'
        },
        {
            label: 'race',
            type: 'function',
            detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T>',
            info: '返回最先完成的 Promise'
        },
        {
            label: 'allSettled',
            type: 'function',
            detail: '<T>(promises: Iterable<Promise<T>>) => Promise<PromiseSettledResult<T>[]>',
            info: '等待所有 Promise 完成（无论成功或失败）'
        },
        {
            label: 'any',
            type: 'function',
            detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T>',
            info: '返回第一个成功的 Promise'
        }
    ],

    /**
     * ==================== Document 对象 ====================
     */
    document: [
        // 元素查找方法
        {
            label: 'getElementById',
            type: 'function',
            detail: '(id: string) => HTMLElement | null',
            info: '通过 ID 获取元素'
        },
        {
            label: 'getElementsByClassName',
            type: 'function',
            detail: '(classNames: string) => HTMLCollection',
            info: '通过类名获取元素集合'
        },
        {
            label: 'getElementsByTagName',
            type: 'function',
            detail: '(tagName: string) => HTMLCollection',
            info: '通过标签名获取元素集合'
        },
        {
            label: 'getElementsByName',
            type: 'function',
            detail: '(name: string) => NodeList',
            info: '通过 name 属性获取元素集合'
        },
        {
            label: 'querySelector',
            type: 'function',
            detail: '(selectors: string) => Element | null',
            info: '返回匹配的第一个元素'
        },
        {
            label: 'querySelectorAll',
            type: 'function',
            detail: '(selectors: string) => NodeList',
            info: '返回匹配的所有元素'
        },

        // 属性
        {label: 'body', type: 'property', detail: 'HTMLElement', info: '文档的 body 元素'},
        {label: 'head', type: 'property', detail: 'HTMLElement', info: '文档的 head 元素'},
        {label: 'documentElement', type: 'property', detail: 'HTMLElement', info: '文档的根元素 (html)'},
        {label: 'title', type: 'property', detail: 'string', info: '文档标题'},
        {label: 'URL', type: 'property', detail: 'string', info: '文档的完整 URL'},
        {label: 'domain', type: 'property', detail: 'string', info: '文档的域名'},
        {label: 'referrer', type: 'property', detail: 'string', info: '来源页面的 URL'},
        {label: 'cookie', type: 'property', detail: 'string', info: '文档的 Cookie'},
        {label: 'readyState', type: 'property', detail: 'string', info: '文档加载状态 (loading/interactive/complete)'},

        // 元素创建方法
        {label: 'createElement', type: 'function', detail: '(tagName: string) => HTMLElement', info: '创建元素节点'},
        {label: 'createTextNode', type: 'function', detail: '(data: string) => Text', info: '创建文本节点'},
        {label: 'createDocumentFragment', type: 'function', detail: '() => DocumentFragment', info: '创建文档片段'},
        {label: 'createComment', type: 'function', detail: '(data: string) => Comment', info: '创建注释节点'},
        {label: 'createAttribute', type: 'function', detail: '(name: string) => Attr', info: '创建属性节点'},

        // 事件相关
        {
            label: 'addEventListener',
            type: 'function',
            detail: '(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void',
            info: '添加事件监听器'
        },
        {
            label: 'removeEventListener',
            type: 'function',
            detail: '(type: string, listener: EventListener, options?: boolean | EventListenerOptions) => void',
            info: '移除事件监听器'
        },
        {label: 'dispatchEvent', type: 'function', detail: '(event: Event) => boolean', info: '派发事件'},

        // 写入方法
        {label: 'write', type: 'function', detail: '(...text: string[]) => void', info: '向文档写入 HTML'},
        {label: 'writeln', type: 'function', detail: '(...text: string[]) => void', info: '向文档写入 HTML 并添加换行'},
        {label: 'open', type: 'function', detail: '() => void', info: '打开文档流'},
        {label: 'close', type: 'function', detail: '() => void', info: '关闭文档流'},

        // 其他常用方法和属性
        {
            label: 'execCommand',
            type: 'function',
            detail: '(commandId: string, showUI?: boolean, value?: string) => boolean',
            info: '执行命令（已废弃）'
        },
        {label: 'hasFocus', type: 'function', detail: '() => boolean', info: '检查文档是否获得焦点'},
        {label: 'getSelection', type: 'function', detail: '() => Selection | null', info: '获取当前选中的文本'},
        {label: 'exitFullscreen', type: 'function', detail: '() => Promise<void>', info: '退出全屏模式'},
        {label: 'fullscreenElement', type: 'property', detail: 'Element | null', info: '当前全屏的元素'},
        {label: 'hidden', type: 'property', detail: 'boolean', info: '页面是否隐藏'},
        {label: 'visibilityState', type: 'property', detail: 'string', info: '页面可见性状态'},
        {label: 'fonts', type: 'property', detail: 'FontFaceSet', info: '字体集合'},
        {label: 'images', type: 'property', detail: 'HTMLCollection', info: '文档中的图片集合'},
        {label: 'links', type: 'property', detail: 'HTMLCollection', info: '文档中的链接集合'},
        {label: 'scripts', type: 'property', detail: 'HTMLCollection', info: '文档中的脚本集合'},
        {label: 'styleSheets', type: 'property', detail: 'StyleSheetList', info: '文档的样式表集合'},
        {label: 'forms', type: 'property', detail: 'HTMLCollection', info: '文档中的表单集合'},
        {label: 'anchors', type: 'property', detail: 'HTMLCollection', info: '文档中的锚点集合'},
        {label: 'embeds', type: 'property', detail: 'HTMLCollection', info: '文档中的嵌入对象集合'},

        // 剪贴板 API
        {
            label: 'execCommand',
            type: 'function',
            detail: '(commandId: string, showUI?: boolean, value?: string) => boolean',
            info: '执行编辑命令'
        },

        // 跨文档通信
        {label: 'defaultView', type: 'property', detail: 'Window | null', info: '关联的 window 对象'},
        {label: 'parentWindow', type: 'property', detail: 'Window | null', info: '父窗口对象（已废弃）'},
        {label: 'defaultCharset', type: 'property', detail: 'string', info: '默认字符集'},
        {label: 'characterSet', type: 'property', detail: 'string', info: '文档的字符集'},
        {label: 'charset', type: 'property', detail: 'string', info: '文档字符集（已废弃）'},
        {label: 'contentType', type: 'property', detail: 'string', info: '文档的 MIME 类型'},

        // DOCTYPE 相关
        {label: 'doctype', type: 'property', detail: 'DocumentType | null', info: '文档类型声明'},
        {label: 'implementation', type: 'property', detail: 'DOMImplementation', info: 'DOM 实现对象'},

        // 节点遍历
        {
            label: 'createNodeIterator',
            type: 'function',
            detail: '(root: Node, whatToShow?: number, filter?: NodeFilter) => NodeIterator',
            info: '创建节点迭代器'
        },
        {
            label: 'createTreeWalker',
            type: 'function',
            detail: '(root: Node, whatToShow?: number, filter?: NodeFilter) => TreeWalker',
            info: '创建树遍历器'
        },

        // 范围操作
        {label: 'createRange', type: 'function', detail: '() => Range', info: '创建范围对象'},
        {
            label: 'caretRangeFromPoint',
            type: 'function',
            detail: '(x: number, y: number) => Range | null',
            info: '从坐标获取范围'
        },

        // 元素定位
        {
            label: 'elementFromPoint',
            type: 'function',
            detail: '(x: number, y: number) => Element | null',
            info: '获取指定坐标的元素'
        },
        {
            label: 'elementsFromPoint',
            type: 'function',
            detail: '(x: number, y: number) => Element[]',
            info: '获取指定坐标的所有元素'
        },

        // 滚动相关
        {label: 'scrollingElement', type: 'property', detail: 'Element | null', info: '滚动元素'},

        // 权限相关
        {label: 'hasStorageAccess', type: 'function', detail: '() => Promise<boolean>', info: '检查是否有存储访问权限'},
        {label: 'requestStorageAccess', type: 'function', detail: '() => Promise<void>', info: '请求存储访问权限'},

        // 图片加载
        {label: 'pictureInPictureEnabled', type: 'property', detail: 'boolean', info: '画中画是否可用'},

        // 当前脚本
        {label: 'currentScript', type: 'property', detail: 'HTMLScriptElement | null', info: '当前执行的脚本元素'}
    ],

    /**
     * ==================== localStorage 对象 ====================
     */
    localStorage: [
        // 存储方法
        {label: 'setItem', type: 'function', detail: '(key: string, value: string) => void', info: '存储键值对'},
        {label: 'getItem', type: 'function', detail: '(key: string) => string | null', info: '获取指定键的值'},
        {label: 'removeItem', type: 'function', detail: '(key: string) => void', info: '删除指定键'},
        {label: 'clear', type: 'function', detail: '() => void', info: '清空所有存储'},
        {label: 'key', type: 'function', detail: '(index: number) => string | null', info: '获取指定索引的键名'},

        // 属性
        {label: 'length', type: 'property', detail: 'number', info: '存储的键值对数量'}
    ],

    /**
     * ==================== sessionStorage 对象 ====================
     */
    sessionStorage: [
        // 存储方法
        {label: 'setItem', type: 'function', detail: '(key: string, value: string) => void', info: '存储键值对'},
        {label: 'getItem', type: 'function', detail: '(key: string) => string | null', info: '获取指定键的值'},
        {label: 'removeItem', type: 'function', detail: '(key: string) => void', info: '删除指定键'},
        {label: 'clear', type: 'function', detail: '() => void', info: '清空所有存储'},
        {label: 'key', type: 'function', detail: '(index: number) => string | null', info: '获取指定索引的键名'},

        // 属性
        {label: 'length', type: 'property', detail: 'number', info: '存储的键值对数量'}
    ],

    /**
     * ==================== location 对象 ====================
     */
    location: [
        // 导航方法
        {label: 'assign', type: 'function', detail: '(url: string) => void', info: '加载新文档'},
        {label: 'replace', type: 'function', detail: '(url: string) => void', info: '替换当前文档（不产生历史记录）'},
        {label: 'reload', type: 'function', detail: '() => void', info: '重新加载当前文档'},
        {label: 'toString', type: 'function', detail: '() => string', info: '返回完整 URL 字符串'},

        // URL 组成部分
        {label: 'href', type: 'property', detail: 'string', info: '完整 URL'},
        {label: 'protocol', type: 'property', detail: 'string', info: '协议部分 (如 http:)'},
        {label: 'host', type: 'property', detail: 'string', info: '主机名和端口号'},
        {label: 'hostname', type: 'property', detail: 'string', info: '主机名'},
        {label: 'port', type: 'property', detail: 'string', info: '端口号'},
        {label: 'pathname', type: 'property', detail: 'string', info: '路径部分'},
        {label: 'search', type: 'property', detail: 'string', info: '查询字符串（包含 ?）'},
        {label: 'hash', type: 'property', detail: 'string', info: '锚点部分（包含 #）'},
        {label: 'origin', type: 'property', detail: 'string', info: '源（协议+主机+端口）'},

        // 其他属性
        {label: 'ancestorOrigins', type: 'property', detail: 'DOMStringList', info: '祖先框架的源列表'}
    ],

    /**
     * ==================== window 对象 ====================
     */
    window: [
        // 弹窗方法
        {label: 'alert', type: 'function', detail: '(message?: any) => void', info: '显示警告对话框'},
        {
            label: 'confirm',
            type: 'function',
            detail: '(message?: string) => boolean',
            info: '显示确认对话框，返回用户确认状态'
        },
        {
            label: 'prompt',
            type: 'function',
            detail: '(message?: string, defaultValue?: string) => string | null',
            info: '显示输入对话框，返回用户输入的内容'
        },

        // 定时器方法
        {
            label: 'setTimeout',
            type: 'function',
            detail: '(handler: Function, timeout?: number, ...args: any[]) => number',
            info: '设置延迟执行的定时器'
        },
        {label: 'clearTimeout', type: 'function', detail: '(id: number) => void', info: '清除延迟执行的定时器'},
        {
            label: 'setInterval',
            type: 'function',
            detail: '(handler: Function, timeout?: number, ...args: any[]) => number',
            info: '设置周期性执行的定时器'
        },
        {label: 'clearInterval', type: 'function', detail: '(id: number) => void', info: '清除周期性执行的定时器'},
        {
            label: 'requestAnimationFrame',
            type: 'function',
            detail: '(callback: FrameRequestCallback) => number',
            info: '请求下一帧动画'
        },
        {label: 'cancelAnimationFrame', type: 'function', detail: '(handle: number) => void', info: '取消动画帧请求'},
        {
            label: 'requestIdleCallback',
            type: 'function',
            detail: '(callback: IdleRequestCallback, options?: IdleRequestOptions) => number',
            info: '请求空闲时执行回调'
        },
        {label: 'cancelIdleCallback', type: 'function', detail: '(handle: number) => void', info: '取消空闲回调请求'},

        // 窗口尺寸和位置
        {label: 'innerWidth', type: 'property', detail: 'number', info: '窗口的内宽度（包含滚动条）'},
        {label: 'innerHeight', type: 'property', detail: 'number', info: '窗口的内高度（包含滚动条）'},
        {label: 'outerWidth', type: 'property', detail: 'number', info: '窗口的外宽度'},
        {label: 'outerHeight', type: 'property', detail: 'number', info: '窗口的外高度'},
        {label: 'screenX', type: 'property', detail: 'number', info: '窗口相对于屏幕的 X 坐标'},
        {label: 'screenY', type: 'property', detail: 'number', info: '窗口相对于屏幕的 Y 坐标'},
        {label: 'screenLeft', type: 'property', detail: 'number', info: '窗口相对于屏幕的左侧距离'},
        {label: 'screenTop', type: 'property', detail: 'number', info: '窗口相对于屏幕的顶部距离'},
        {label: 'pageXOffset', type: 'property', detail: 'number', info: '文档水平滚动的像素数'},
        {label: 'pageYOffset', type: 'property', detail: 'number', info: '文档垂直滚动的像素数'},
        {label: 'scrollX', type: 'property', detail: 'number', info: '文档水平滚动的像素数'},
        {label: 'scrollY', type: 'property', detail: 'number', info: '文档垂直滚动的像素数'},

        // 窗口操作方法
        {label: 'scroll', type: 'function', detail: '(x: number, y: number) => void', info: '滚动窗口到指定位置'},
        {label: 'scrollTo', type: 'function', detail: '(x: number, y: number) => void', info: '滚动窗口到指定位置'},
        {label: 'scrollBy', type: 'function', detail: '(x: number, y: number) => void', info: '相对当前滚动位置滚动'},
        {label: 'resizeTo', type: 'function', detail: '(width: number, height: number) => void', info: '调整窗口大小'},
        {label: 'resizeBy', type: 'function', detail: '(x: number, y: number) => void', info: '相对调整窗口大小'},
        {label: 'moveTo', type: 'function', detail: '(x: number, y: number) => void', info: '移动窗口到指定位置'},
        {label: 'moveBy', type: 'function', detail: '(x: number, y: number) => void', info: '相对移动窗口'},
        {label: 'focus', type: 'function', detail: '() => void', info: '使窗口获得焦点'},
        {label: 'blur', type: 'function', detail: '() => void', info: '使窗口失去焦点'},
        {label: 'close', type: 'function', detail: '() => void', info: '关闭窗口'},
        {label: 'print', type: 'function', detail: '() => void', info: '打印当前文档'},
        {label: 'stop', type: 'function', detail: '() => void', info: '停止加载页面'},

        // 新窗口打开
        {
            label: 'open',
            type: 'function',
            detail: '(url?: string, target?: string, features?: string, replace?: boolean) => Window | null',
            info: '打开新窗口或标签页'
        },

        // 事件相关
        {
            label: 'addEventListener',
            type: 'function',
            detail: '(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void',
            info: '添加事件监听器'
        },
        {
            label: 'removeEventListener',
            type: 'function',
            detail: '(type: string, listener: EventListener, options?: boolean | EventListenerOptions) => void',
            info: '移除事件监听器'
        },
        {label: 'dispatchEvent', type: 'function', detail: '(event: Event) => boolean', info: '派发事件'},
        {label: 'onload', type: 'property', detail: 'Function | null', info: '页面加载完成事件'},
        {label: 'onerror', type: 'property', detail: 'Function | null', info: '错误事件'},
        {label: 'onresize', type: 'property', detail: 'Function | null', info: '窗口大小改变事件'},
        {label: 'onscroll', type: 'property', detail: 'Function | null', info: '窗口滚动事件'},
        {label: 'onbeforeunload', type: 'property', detail: 'Function | null', info: '页面卸载前事件'},
        {label: 'onunload', type: 'property', detail: 'Function | null', info: '页面卸载事件'},
        {label: 'onfocus', type: 'property', detail: 'Function | null', info: '窗口获得焦点事件'},
        {label: 'onblur', type: 'property', detail: 'Function | null', info: '窗口失去焦点事件'},
        {label: 'onmessage', type: 'property', detail: 'Function | null', info: '接收跨文档消息事件'},

        // 存储对象
        {label: 'localStorage', type: 'property', detail: 'Storage', info: '本地存储对象'},
        {label: 'sessionStorage', type: 'property', detail: 'Storage', info: '会话存储对象'},

        // 导航对象
        {label: 'location', type: 'property', detail: 'Location', info: '当前 URL 信息对象'},
        {label: 'history', type: 'property', detail: 'History', info: '历史记录对象'},
        {label: 'navigator', type: 'property', detail: 'Navigator', info: '浏览器信息对象'},
        {label: 'screen', type: 'property', detail: 'Screen', info: '屏幕信息对象'},
        {label: 'document', type: 'property', detail: 'Document', info: '文档对象'},

        // 剪贴板
        {label: 'clipboardData', type: 'property', detail: 'DataTransfer | null', info: '剪贴板数据（已废弃）'},
        {label: 'navigator', type: 'property', detail: 'Navigator', info: '浏览器信息对象'},

        // 跨窗口通信
        {
            label: 'postMessage',
            type: 'function',
            detail: '(message: any, targetOrigin: string, transfer?: Transferable[]) => void',
            info: '向其他窗口发送消息'
        },

        // 控制台
        {label: 'console', type: 'property', detail: 'Console', info: '控制台对象'},

        // 当前窗口引用
        {label: 'self', type: 'property', detail: 'Window', info: '当前窗口的引用'},
        {label: 'window', type: 'property', detail: 'Window', info: '当前窗口的引用'},
        {label: 'top', type: 'property', detail: 'Window | null', info: '最顶层窗口的引用'},
        {label: 'parent', type: 'property', detail: 'Window | null', info: '父窗口的引用'},
        {label: 'opener', type: 'property', detail: 'Window | null', info: '打开当前窗口的窗口引用'},
        {label: 'frames', type: 'property', detail: 'Window', info: '当前窗口的子框架集合'},
        {label: 'length', type: 'property', detail: 'number', info: '框架数量'},
        {label: 'name', type: 'property', detail: 'string', info: '窗口名称'},
        {label: 'closed', type: 'property', detail: 'boolean', info: '窗口是否已关闭'},

        // 全屏 API
        {label: 'fullScreen', type: 'property', detail: 'boolean', info: '窗口是否全屏（已废弃）'},
        {label: 'isSecureContext', type: 'property', detail: 'boolean', info: '上下文是否安全'},

        // 设备相关
        {label: 'devicePixelRatio', type: 'property', detail: 'number', info: '设备像素比'},

        // 滚动元素
        {label: 'scrollbars', type: 'property', detail: 'Scrollbars', info: '滚动条对象'},

        // 性能
        {label: 'performance', type: 'property', detail: 'Performance', info: '性能对象'},

        // 错误处理
        {label: 'onerror', type: 'property', detail: 'Function | null', info: '错误事件处理程序'},
        {label: 'onunhandledrejection', type: 'property', detail: 'Function | null', info: '未处理的 Promise 拒绝事件'},

        // 缓存
        {label: 'caches', type: 'property', detail: 'CacheStorage', info: '缓存存储对象'},

        // 索引数据库
        {label: 'indexedDB', type: 'property', detail: 'IDBFactory', info: 'IndexedDB 数据库对象'},

        // 自定义元素
        {label: 'customElements', type: 'property', detail: 'CustomElementRegistry', info: '自定义元素注册表'},

        // 跨域隔离
        {label: 'crossOriginIsolated', type: 'property', detail: 'boolean', info: '是否跨域隔离'},

        // 获取选择器
        {label: 'getSelection', type: 'function', detail: '() => Selection | null', info: '获取当前选中的文本'},

        // 查找元素
        {label: 'find', type: 'function', detail: '(str: string) => boolean', info: '在页面中查找文本'},

        // 获取计算样式
        {
            label: 'getComputedStyle',
            type: 'function',
            detail: '(element: Element, pseudoElement?: string) => CSSStyleDeclaration',
            info: '获取元素的计算样式'
        },

        // 匹配媒体查询
        {label: 'matchMedia', type: 'function', detail: '(query: string) => MediaQueryList', info: '匹配媒体查询条件'},

        // 更新页面
        {label: 'updateCommands', type: 'function', detail: '() => void', info: '更新命令状态'},

        // 国际化
        {label: 'navigator', type: 'property', detail: 'Navigator', info: '浏览器信息对象'},

        // ==================== Base64 编码解码 ====================
        {label: 'atob', type: 'function', detail: '(encodedData: string) => string', info: '解码 Base64 编码的字符串'},
        {
            label: 'btoa',
            type: 'function',
            detail: '(stringToEncode: string) => string',
            info: '将字符串编码为 Base64 格式'
        },

        // ==================== URL 编码解码 ====================
        {label: 'encodeURI', type: 'function', detail: '(uri: string) => string', info: '编码 URI（保留特殊字符）'},
        {
            label: 'decodeURI',
            type: 'function',
            detail: '(encodedURI: string) => string',
            info: '解码 encodeURI 编码的字符串'
        },
        {
            label: 'encodeURIComponent',
            type: 'function',
            detail: '(component: string) => string',
            info: '编码 URI 组件（转义特殊字符）'
        },
        {
            label: 'decodeURIComponent',
            type: 'function',
            detail: '(encodedComponent: string) => string',
            info: '解码 encodeURIComponent 编码的字符串'
        },
        {
            label: 'escape',
            type: 'function',
            detail: '(str: string) => string',
            info: '编码字符串（已废弃，使用 encodeURIComponent）'
        },
        {
            label: 'unescape',
            type: 'function',
            detail: '(str: string) => string',
            info: '解码 escape 编码的字符串（已废弃）'
        },

        // ==================== 解析方法 ====================
        {
            label: 'parseInt',
            type: 'function',
            detail: '(string: string, radix?: number) => number',
            info: '解析字符串为整数'
        },
        {label: 'parseFloat', type: 'function', detail: '(string: string) => number', info: '解析字符串为浮点数'},
        {label: 'isNaN', type: 'function', detail: '(value: any) => boolean', info: '判断值是否为 NaN'},
        {label: 'isFinite', type: 'function', detail: '(value: any) => boolean', info: '判断值是否为有限数'},

        // ==================== 类型判断 ====================
        {label: 'typeof', type: 'function', detail: '(operand: any) => string', info: '返回操作数的类型'},
        {
            label: 'instanceof',
            type: 'function',
            detail: '(object: any, constructor: Function) => boolean',
            info: '检查对象是否为指定构造函数的实例'
        },

        // ==================== 全局对象和值 ====================
        {label: 'NaN', type: 'property', detail: 'number', info: 'Not-a-Number 的全局值'},
        {label: 'Infinity', type: 'property', detail: 'number', info: '无穷大的全局值'},
        {label: 'undefined', type: 'property', detail: 'undefined', info: '未定义的全局值'},
        {label: 'globalThis', type: 'property', detail: 'Window', info: '全局对象的统一访问方式'},

        // ==================== 控制器和调度 ====================
        {label: 'AbortController', type: 'class', detail: 'AbortController', info: '中止一个或多个 Web 请求的控制器'},
        {label: 'AbortSignal', type: 'class', detail: 'AbortSignal', info: 'AbortController 的信号对象'},

        // ==================== 事件和消息 ====================
        {label: 'Event', type: 'class', detail: 'Event', info: '事件对象构造函数'},
        {label: 'CustomEvent', type: 'class', detail: 'CustomEvent', info: '自定义事件构造函数'},
        {label: 'MessageChannel', type: 'class', detail: 'MessageChannel', info: '消息通道对象'},
        {label: 'MessagePort', type: 'class', detail: 'MessagePort', info: '消息端口对象'},
        {label: 'MessageEvent', type: 'class', detail: 'MessageEvent', info: '消息事件对象'},

        // ==================== 观察者 API ====================
        {label: 'IntersectionObserver', type: 'class', detail: 'IntersectionObserver', info: '观察元素交叉状态的 API'},
        {label: 'MutationObserver', type: 'class', detail: 'MutationObserver', info: '观察 DOM 变化的 API'},
        {label: 'ResizeObserver', type: 'class', detail: 'ResizeObserver', info: '观察元素尺寸变化的 API'},
        {label: 'PerformanceObserver', type: 'class', detail: 'PerformanceObserver', info: '观察性能条目的 API'},
        {label: 'ReportingObserver', type: 'class', detail: 'ReportingObserver', info: '观察过时 API 报告的 API'},

        // ==================== 存储和缓存 ====================
        {label: 'localStorage', type: 'property', detail: 'Storage', info: '本地存储对象，持久化存储数据'},
        {label: 'sessionStorage', type: 'property', detail: 'Storage', info: '会话存储对象，仅在当前会话有效'},
        {label: 'caches', type: 'property', detail: 'CacheStorage', info: '缓存存储对象（Service Worker API）'},
        {label: 'indexedDB', type: 'property', detail: 'IDBFactory', info: 'IndexedDB 数据库对象'},
        {label: 'sessionStorage', type: 'property', detail: 'Storage', info: '会话存储对象'},

        // ==================== 网络和通信 ====================
        {
            label: 'fetch',
            type: 'function',
            detail: '(input: RequestInfo, init?: RequestInit) => Promise<Response>',
            info: '发起网络请求（Fetch API）'
        },
        {label: 'Request', type: 'class', detail: 'Request', info: 'Fetch API 的请求对象'},
        {label: 'Response', type: 'class', detail: 'Response', info: 'Fetch API 的响应对象'},
        {label: 'Headers', type: 'class', detail: 'Headers', info: 'Fetch API 的头部对象'},
        {label: 'WebSocket', type: 'class', detail: 'WebSocket', info: 'WebSocket 连接对象'},
        {label: 'EventSource', type: 'class', detail: 'EventSource', info: 'Server-Sent Events 客户端对象'},

        // ==================== 文件 API ====================
        {label: 'File', type: 'class', detail: 'File', info: '文件对象构造函数'},
        {label: 'FileReader', type: 'class', detail: 'FileReader', info: '读取文件内容的 API'},
        {label: 'Blob', type: 'class', detail: 'Blob', info: '二进制大对象构造函数'},
        {label: 'URL', type: 'class', detail: 'URL', info: 'URL 操作对象'},
        {label: 'URLSearchParams', type: 'class', detail: 'URLSearchParams', info: 'URL 查询字符串操作对象'},
        {label: 'FormData', type: 'class', detail: 'FormData', info: '表单数据对象'},

        // ==================== 图形和动画 API ====================
        {
            label: 'requestAnimationFrame',
            type: 'function',
            detail: '(callback: FrameRequestCallback) => number',
            info: '请求下一帧动画'
        },
        {label: 'cancelAnimationFrame', type: 'function', detail: '(handle: number) => void', info: '取消动画帧请求'},
        {
            label: 'requestIdleCallback',
            type: 'function',
            detail: '(callback: IdleRequestCallback, options?: IdleRequestOptions) => number',
            info: '请求空闲时执行回调'
        },
        {label: 'cancelIdleCallback', type: 'function', detail: '(handle: number) => void', info: '取消空闲回调请求'},

        // ==================== Web Components ====================
        {label: 'customElements', type: 'property', detail: 'CustomElementRegistry', info: '自定义元素注册表'},
        {label: 'ShadowRoot', type: 'class', detail: 'ShadowRoot', info: 'Shadow DOM 根节点'},

        // ==================== 安全 API ====================
        {label: 'crypto', type: 'property', detail: 'Crypto', info: '加密 API 对象'},
        {label: 'Crypto', type: 'class', detail: 'Crypto', info: '加密 API 构造函数'},
        {label: 'SubtleCrypto', type: 'class', detail: 'SubtleCrypto', info: '底层加密 API'},

        // ==================== 跨窗口通信 ====================
        {
            label: 'postMessage',
            type: 'function',
            detail: '(message: any, targetOrigin: string, transfer?: Transferable[]) => void',
            info: '向其他窗口发送消息'
        },
        {label: 'BroadcastChannel', type: 'class', detail: 'BroadcastChannel', info: '广播通道 API'},

        // ==================== 其他常用对象 ====================
        {label: 'console', type: 'property', detail: 'Console', info: '控制台对象'},
        {label: 'performance', type: 'property', detail: 'Performance', info: '性能对象'},
        {label: 'navigator', type: 'property', detail: 'Navigator', info: '浏览器信息对象'},
        {label: 'location', type: 'property', detail: 'Location', info: '当前 URL 信息对象'},
        {label: 'history', type: 'property', detail: 'History', info: '历史记录对象'},
        {label: 'screen', type: 'property', detail: 'Screen', info: '屏幕信息对象'},
        {label: 'document', type: 'property', detail: 'Document', info: '文档对象'},

        // ==================== 数据结构 ====================
        {label: 'Array', type: 'class', detail: 'Array', info: '数组构造函数'},
        {label: 'Object', type: 'class', detail: 'Object', info: '对象构造函数'},
        {label: 'Map', type: 'class', detail: 'Map', info: 'Map 数据结构'},
        {label: 'Set', type: 'class', detail: 'Set', info: 'Set 数据结构'},
        {label: 'WeakMap', type: 'class', detail: 'WeakMap', info: 'WeakMap 数据结构'},
        {label: 'WeakSet', type: 'class', detail: 'WeakSet', info: 'WeakSet 数据结构'},
        {label: 'Promise', type: 'class', detail: 'Promise', info: 'Promise 异步编程'},
        {label: 'Proxy', type: 'class', detail: 'Proxy', info: '代理对象'},
        {label: 'Reflect', type: 'class', detail: 'Reflect', info: '反射 API'},
        {label: 'Symbol', type: 'class', detail: 'Symbol', info: '符号构造函数'},
        {label: 'BigInt', type: 'class', detail: 'BigInt', info: '大整数构造函数'},

        // ==================== 国际化 API ====================
        {label: 'Intl', type: 'class', detail: 'Intl', info: '国际化 API 命名空间'},

        // ==================== Web Worker ====================
        {label: 'Worker', type: 'class', detail: 'Worker', info: 'Web Worker 构造函数'},
        {label: 'SharedWorker', type: 'class', detail: 'SharedWorker', info: '共享 Worker 构造函数'},

        // ==================== 存储配额管理 ====================
        {label: 'storage', type: 'property', detail: 'StorageManager', info: '存储管理器'},

        // ==================== 通知 API ====================
        {label: 'Notification', type: 'class', detail: 'Notification', info: '通知 API 构造函数'},

        // ==================== 支付和认证 ====================
        {label: 'PaymentRequest', type: 'class', detail: 'PaymentRequest', info: '支付请求 API'},
        {label: 'CredentialsContainer', type: 'class', detail: 'CredentialsContainer', info: '凭证容器'},

        // ==================== 设备传感器 API ====================
        {label: 'DeviceOrientationEvent', type: 'class', detail: 'DeviceOrientationEvent', info: '设备方向事件'},
        {label: 'DeviceMotionEvent', type: 'class', detail: 'DeviceMotionEvent', info: '设备运动事件'},

        // ==================== 数据流和传输 ====================
        {label: 'ReadableStream', type: 'class', detail: 'ReadableStream', info: '可读流'},
        {label: 'WritableStream', type: 'class', detail: 'WritableStream', info: '可写流'},
        {label: 'TransformStream', type: 'class', detail: 'TransformStream', info: '转换流'},

        // ==================== 剪贴板 API ====================
        {label: 'Clipboard', type: 'class', detail: 'Clipboard', info: '剪贴板 API'},
        {label: 'ClipboardEvent', type: 'class', detail: 'ClipboardEvent', info: '剪贴板事件'},

        // ==================== 全屏 API ====================
        {label: 'fullScreen', type: 'property', detail: 'boolean', info: '窗口是否全屏（已废弃）'},
        {label: 'exitFullscreen', type: 'function', detail: '() => Promise<void>', info: '退出全屏模式'},

        // ==================== 屏幕唤醒锁定 ====================
        {label: 'wakeLock', type: 'property', detail: 'WakeLock', info: '屏幕唤醒锁定对象'},

        // ==================== 键盘锁定 ====================
        {label: 'keyboard', type: 'property', detail: 'Keyboard', info: '键盘 API 对象'},

        // ==================== 虚拟现实 API ====================
        {label: 'XRSystem', type: 'class', detail: 'XRSystem', info: 'WebXR API 入口点'},

        // ==================== 调度和任务管理 ====================
        {label: 'scheduler', type: 'property', detail: 'Scheduler', info: '调度器对象'},
        {label: 'queueMicrotask', type: 'function', detail: '(callback: Function) => void', info: '将微任务加入队列'},

        // ==================== 错误和调试 ====================
        {label: 'console', type: 'property', detail: 'Console', info: '控制台对象'},
        {label: 'debugger', type: 'keyword', detail: 'debugger', info: '断点调试语句'},

        // ==================== 导入和模块 ====================
        {label: 'import', type: 'function', detail: '(specifier: string) => Promise<any>', info: '动态导入模块'}

    ],

    /**
     * ==================== history 对象 ====================
     */
    history: [
        // 导航方法
        {label: 'back', type: 'function', detail: '() => void', info: '返回上一页（等同于点击后退按钮）'},
        {label: 'forward', type: 'function', detail: '() => void', info: '前进到下一页（等同于点击前进按钮）'},
        {label: 'go', type: 'function', detail: '(delta: number) => void', info: '相对当前页面跳转指定的步数'},

        // 状态管理（单页应用）
        {
            label: 'pushState',
            type: 'function',
            detail: '(state: any, title: string, url?: string | null) => void',
            info: '添加历史记录条目'
        },
        {
            label: 'replaceState',
            type: 'function',
            detail: '(state: any, title: string, url?: string | null) => void',
            info: '替换当前历史记录条目'
        },

        // 属性
        {label: 'length', type: 'property', detail: 'number', info: '历史记录堆栈中的条目数量'},
        {label: 'state', type: 'property', detail: 'any', info: '当前历史记录条目的状态对象'},
        {label: 'scrollRestoration', type: 'property', detail: 'string', info: '滚动恢复模式 (auto/manual)'}
    ],

    /**
     * ==================== navigator 对象 ====================
     */
    navigator: [
        // 浏览器信息
        {label: 'userAgent', type: 'property', detail: 'string', info: '浏览器的 User-Agent 字符串'},
        {label: 'platform', type: 'property', detail: 'string', info: '操作系统平台'},
        {label: 'appCodeName', type: 'property', detail: 'string', info: '浏览器代码名称（固定为 Mozilla）'},
        {label: 'appName', type: 'property', detail: 'string', info: '浏览器名称'},
        {label: 'appVersion', type: 'property', detail: 'string', info: '浏览器版本信息'},
        {label: 'product', type: 'property', detail: 'string', info: '产品名称（固定为 Gecko）'},
        {label: 'productSub', type: 'property', detail: 'string', info: '产品子版本'},
        {label: 'vendor', type: 'property', detail: 'string', info: '浏览器供应商'},
        {label: 'vendorSub', type: 'property', detail: 'string', info: '供应商子版本'},

        // 语言信息
        {label: 'language', type: 'property', detail: 'string', info: '首选语言'},
        {label: 'languages', type: 'property', detail: 'string[]', info: '浏览器接受的语言数组'},

        // 在线状态
        {label: 'onLine', type: 'property', detail: 'boolean', info: '浏览器是否在线'},

        // 硬件信息
        {label: 'hardwareConcurrency', type: 'property', detail: 'number', info: 'CPU 核心数'},
        {label: 'deviceMemory', type: 'property', detail: 'number', info: '设备内存大小（GB）'},

        // 电池信息（已废弃）
        {label: 'getBattery', type: 'function', detail: '() => Promise<BatteryManager>', info: '获取电池信息'},

        // 地理位置
        {label: 'geolocation', type: 'property', detail: 'Geolocation', info: '地理位置对象'},

        // 剪贴板
        {label: 'clipboard', type: 'property', detail: 'Clipboard', info: '剪贴板 API'},

        // 媒体设备
        {label: 'mediaDevices', type: 'property', detail: 'MediaDevices', info: '媒体设备对象（摄像头、麦克风）'},
        {label: 'mediaSession', type: 'property', detail: 'MediaSession', info: '媒体会话对象'},

        // 权限管理
        {label: 'permissions', type: 'property', detail: 'Permissions', info: '权限管理对象'},

        // 蓝牙
        {label: 'bluetooth', type: 'property', detail: 'Bluetooth', info: '蓝牙 API'},

        // USB
        {label: 'usb', type: 'property', detail: 'USB', info: 'USB API'},

        // 串行端口
        {label: 'serial', type: 'property', detail: 'Serial', info: '串行端口 API'},

        // HID
        {label: 'hid', type: 'property', detail: 'HID', info: '人机接口设备 API'},

        // 存储管理
        {label: 'storage', type: 'property', detail: 'StorageManager', info: '存储管理器'},

        // 服务工作者
        {label: 'serviceWorker', type: 'property', detail: 'ServiceWorkerContainer', info: 'Service Worker 容器'},

        // 网络信息
        {label: 'connection', type: 'property', detail: 'NetworkInformation', info: '网络连接信息'},

        // 跨源隔离
        {label: 'cookieEnabled', type: 'property', detail: 'boolean', info: 'Cookie 是否启用'},

        // 注册协议处理程序
        {
            label: 'registerProtocolHandler',
            type: 'function',
            detail: '(scheme: string, url: string, title: string) => void',
            info: '注册协议处理程序'
        },
        {
            label: 'unregisterProtocolHandler',
            type: 'function',
            detail: '(scheme: string, url: string) => void',
            info: '注销协议处理程序'
        },

        // 内容分析器
        {label: 'javaEnabled', type: 'function', detail: '() => boolean', info: 'Java 是否启用（已废弃）'},

        // 震动 API
        {label: 'vibrate', type: 'function', detail: '(pattern: number | number[]) => boolean', info: '触发设备震动'},

        // 链接
        {label: 'canShare', type: 'function', detail: '(data?: ShareData) => boolean', info: '是否可以分享指定的数据'},
        {label: 'share', type: 'function', detail: '(data?: ShareData) => Promise<void>', info: '调用系统分享功能'},

        // 浏览器窗口认证
        {label: 'credentials', type: 'property', detail: 'CredentialsContainer', info: '凭证容器对象'},

        // 支付
        {
            label: 'getUserMedia',
            type: 'function',
            detail: '(constraints: MediaStreamConstraints) => Promise<MediaStream>',
            info: '获取用户媒体设备（摄像头/麦克风）'
        },

        // 通知
        {
            label: 'Notification',
            type: 'function',
            detail: '(title: string, options?: NotificationOptions) => Notification',
            info: '创建通知对象'
        },

        // 自定义字体
        {label: 'fontFamilies', type: 'property', detail: 'FontFamilies', info: '字体族列表'},

        // 发送信标
        {
            label: 'sendBeacon',
            type: 'function',
            detail: '(url: string, data?: BodyInit) => boolean',
            info: '异步发送数据'
        },

        // 复制
        {label: 'clipboard', type: 'property', detail: 'Clipboard', info: '剪贴板 API'},

        // 锁管理
        {label: 'locks', type: 'property', detail: 'LockManager', info: '锁管理器'},

        // 调度器
        {label: 'scheduling', type: 'property', detail: 'Scheduling', info: '调度器'}
    ],

    /**
     * ==================== screen 对象 ====================
     */
    screen: [
        // 尺寸属性
        {label: 'width', type: 'property', detail: 'number', info: '屏幕的总宽度（像素）'},
        {label: 'height', type: 'property', detail: 'number', info: '屏幕的总高度（像素）'},
        {label: 'availWidth', type: 'property', detail: 'number', info: '屏幕可用宽度（减去任务栏等）'},
        {label: 'availHeight', type: 'property', detail: 'number', info: '屏幕可用高度（减去任务栏等）'},

        // 颜色深度
        {label: 'colorDepth', type: 'property', detail: 'number', info: '屏幕的颜色深度（位）'},
        {label: 'pixelDepth', type: 'property', detail: 'number', info: '屏幕的像素深度（位）'},

        // 设备像素比
        {label: 'deviceXDPI', type: 'property', detail: 'number', info: '设备 X 方向的实际 DPI（仅 IE）'},
        {label: 'deviceYDPI', type: 'property', detail: 'number', info: '设备 Y 方向的实际 DPI（仅 IE）'},
        {label: 'logicalXDPI', type: 'property', detail: 'number', info: '设备 X 方向的逻辑 DPI（仅 IE）'},
        {label: 'logicalYDPI', type: 'property', detail: 'number', info: '设备 Y 方向的逻辑 DPI（仅 IE）'},

        // 方向
        {label: 'orientation', type: 'property', detail: 'ScreenOrientation', info: '屏幕方向对象'},

        // 系统字体（仅 IE）
        {label: 'fontSmoothingEnabled', type: 'property', detail: 'boolean', info: '字体平滑是否启用'},

        // 缓冲区深度
        {label: 'bufferDepth', type: 'property', detail: 'number', info: '离屏缓冲区位深度'},

        // 更新模式
        {label: 'updateInterval', type: 'property', detail: 'number', info: '屏幕更新间隔'},

        // 是否独立
        {label: 'isExtended', type: 'property', detail: 'boolean', info: '屏幕是否扩展'},

        // 获取屏幕方向锁
        {
            label: 'lockOrientation',
            type: 'function',
            detail: '(orientation: string | string[]) => Promise<void>',
            info: '锁定屏幕方向（已废弃）'
        },
        {label: 'unlockOrientation', type: 'function', detail: '() => void', info: '解锁屏幕方向（已废弃）'},

        // 方向改变事件
        {label: 'onorientationchange', type: 'property', detail: 'Function | null', info: '屏幕方向改变事件处理程序'}
    ]
};