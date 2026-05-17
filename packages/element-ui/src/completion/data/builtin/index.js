import {mathCompletions} from './math';
import {jsonCompletions} from './json';
import {consoleCompletions} from './console';
import {arrayCompletions} from './array';
import {objectCompletions} from './object';
import {stringCompletions} from './string';
import {numberCompletions} from './number';
import {dateCompletions} from './date';
import {symbolCompletions} from './symbol';

/**
 * 内置对象补全数据
 *
 * 每个对象定义包含：
 * - completions: 补全项数组
 * - requires: 环境依赖特性（可选，默认总是可用）
 * - globalAlias: 全局变量名（同时也是 window 的属性名）
 */
export const builtinDataRegistry = {
    Math: {
        completions: mathCompletions,
        requires: [], // Math 在所有 JS 环境都可用
    },
    console: {
        completions: consoleCompletions,
        requires: [], // console 在所有现代环境都可用
    },
    JSON: {
        completions: jsonCompletions,
        requires: [],
    },
    Array: {
        completions: arrayCompletions,
        requires: [],
    },
    Object: {
        completions: objectCompletions,
        requires: [],
    },
    String: {
        completions: stringCompletions,
        requires: [],
    },
    Number: {
        completions: numberCompletions,
        requires: [],
    },
    Boolean: {
        completions: [],
        requires: [],
    },
    Date: {
        completions: dateCompletions,
        requires: [],
    },
    RegExp: {
        completions: [
            {label: 'lastIndex', type: 'property', detail: 'number', info: '下次匹配的起始索引'},
        ],
        requires: [],
    },
    Promise: {
        completions: [
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
            },
            {
                label: 'withResolvers',
                type: 'function',
                detail: '() => { promise: Promise<T>, resolve: Function, reject: Function }',
                info: '创建带控制器的 Promise'
            },
        ],
        requires: [],
    },
    Map: {
        completions: [],
        requires: [],
    },
    Set: {
        completions: [],
        requires: [],
    },
    WeakMap: {
        completions: [],
        requires: [],
    },
    WeakSet: {
        completions: [],
        requires: [],
    },
    Symbol: {
        completions: symbolCompletions,
        requires: ['hasSymbol'],
    },
    BigInt: {
        completions: [
            {
                label: 'asIntN',
                type: 'function',
                detail: '(bits: number, bigint: bigint) => bigint',
                info: '截断为指定位数'
            },
            {
                label: 'asUintN',
                type: 'function',
                detail: '(bits: number, bigint: bigint) => bigint',
                info: '截断为无符号指定位数'
            },
        ],
        requires: ['hasBigInt'],
    },
    Intl: {
        completions: [
            {label: 'Collator', type: 'class', detail: 'Intl.Collator', info: '语言字符串比较'},
            {label: 'DateTimeFormat', type: 'class', detail: 'Intl.DateTimeFormat', info: '日期时间格式化'},
            {label: 'NumberFormat', type: 'class', detail: 'Intl.NumberFormat', info: '数字格式化'},
            {label: 'PluralRules', type: 'class', detail: 'Intl.PluralRules', info: '复数规则'},
            {label: 'RelativeTimeFormat', type: 'class', detail: 'Intl.RelativeTimeFormat', info: '相对时间格式化'},
            {label: 'ListFormat', type: 'class', detail: 'Intl.ListFormat', info: '列表格式化'},
            {label: 'Segmenter', type: 'class', detail: 'Intl.Segmenter', info: '文本分段'},
            {label: 'DisplayNames', type: 'class', detail: 'Intl.DisplayNames', info: '显示名称'},
            {label: 'Locale', type: 'class', detail: 'Intl.Locale', info: '语言环境'},
            {
                label: 'getCanonicalLocales',
                type: 'function',
                detail: '(locales: string | string[]) => string[]',
                info: '获取规范语言环境'
            },
        ],
        requires: ['hasIntl'],
    },
    Proxy: {
        completions: [],
        requires: ['hasProxy'],
    },
    Reflect: {
        completions: [
            {
                label: 'apply',
                type: 'function',
                detail: '(target: Function, thisArg: any, args: any[]) => any',
                info: '调用函数'
            },
            {
                label: 'construct',
                type: 'function',
                detail: '(target: Function, args: any[], newTarget?: Function) => any',
                info: '调用构造函数'
            },
            {
                label: 'defineProperty',
                type: 'function',
                detail: '(target: object, key: string, attributes: object) => boolean',
                info: '定义属性'
            },
            {
                label: 'deleteProperty',
                type: 'function',
                detail: '(target: object, key: string) => boolean',
                info: '删除属性'
            },
            {
                label: 'get',
                type: 'function',
                detail: '(target: object, key: string, receiver?: any) => any',
                info: '获取属性值'
            },
            {
                label: 'getOwnPropertyDescriptor',
                type: 'function',
                detail: '(target: object, key: string) => PropertyDescriptor | undefined',
                info: '获取属性描述符'
            },
            {label: 'getPrototypeOf', type: 'function', detail: '(target: object) => object | null', info: '获取原型'},
            {label: 'has', type: 'function', detail: '(target: object, key: string) => boolean', info: '检查属性'},
            {label: 'isExtensible', type: 'function', detail: '(target: object) => boolean', info: '检查可扩展性'},
            {
                label: 'ownKeys',
                type: 'function',
                detail: '(target: object) => Array<string | symbol>',
                info: '获取所有自身键'
            },
            {label: 'preventExtensions', type: 'function', detail: '(target: object) => boolean', info: '阻止扩展'},
            {
                label: 'set',
                type: 'function',
                detail: '(target: object, key: string, value: any, receiver?: any) => boolean',
                info: '设置属性值'
            },
            {
                label: 'setPrototypeOf',
                type: 'function',
                detail: '(target: object, proto: object | null) => boolean',
                info: '设置原型'
            },
        ],
        requires: ['hasProxy'],
    },

    // ==================== DOM/浏览器相关 ====================
    document: {
        completions: [
            // 查询方法
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
            {label: 'readyState', type: 'property', detail: 'string', info: '文档加载状态'},
            // 元素创建
            {
                label: 'createElement',
                type: 'function',
                detail: '(tagName: string) => HTMLElement',
                info: '创建元素节点'
            },
            {label: 'createTextNode', type: 'function', detail: '(data: string) => Text', info: '创建文本节点'},
            {label: 'createDocumentFragment', type: 'function', detail: '() => DocumentFragment', info: '创建文档片段'},
            {label: 'createComment', type: 'function', detail: '(data: string) => Comment', info: '创建注释节点'},
            {label: 'createAttribute', type: 'function', detail: '(name: string) => Attr', info: '创建属性节点'},
            // 事件
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
            // 写入
            {label: 'write', type: 'function', detail: '(...text: string[]) => void', info: '向文档写入 HTML'},
            {
                label: 'writeln',
                type: 'function',
                detail: '(...text: string[]) => void',
                info: '向文档写入 HTML 并添加换行'
            },
            // 其他
            {label: 'hasFocus', type: 'function', detail: '() => boolean', info: '检查文档是否获得焦点'},
            {label: 'getSelection', type: 'function', detail: '() => Selection | null', info: '获取当前选中的文本'},
            {label: 'createRange', type: 'function', detail: '() => Range', info: '创建范围对象'},
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
            {label: 'hidden', type: 'property', detail: 'boolean', info: '页面是否隐藏'},
            {label: 'visibilityState', type: 'property', detail: 'string', info: '页面可见性状态'},
        ],
        requires: ['hasDocument'],
    },
    localStorage: {
        completions: [
            {label: 'setItem', type: 'function', detail: '(key: string, value: string) => void', info: '存储键值对'},
            {label: 'getItem', type: 'function', detail: '(key: string) => string | null', info: '获取指定键的值'},
            {label: 'removeItem', type: 'function', detail: '(key: string) => void', info: '删除指定键'},
            {label: 'clear', type: 'function', detail: '() => void', info: '清空所有存储'},
            {label: 'key', type: 'function', detail: '(index: number) => string | null', info: '获取指定索引的键名'},
            {label: 'length', type: 'property', detail: 'number', info: '存储的键值对数量'},
        ],
        requires: ['hasLocalStorage'],
    },
    sessionStorage: {
        completions: [
            {label: 'setItem', type: 'function', detail: '(key: string, value: string) => void', info: '存储键值对'},
            {label: 'getItem', type: 'function', detail: '(key: string) => string | null', info: '获取指定键的值'},
            {label: 'removeItem', type: 'function', detail: '(key: string) => void', info: '删除指定键'},
            {label: 'clear', type: 'function', detail: '() => void', info: '清空所有存储'},
            {label: 'key', type: 'function', detail: '(index: number) => string | null', info: '获取指定索引的键名'},
            {label: 'length', type: 'property', detail: 'number', info: '存储的键值对数量'},
        ],
        requires: ['hasSessionStorage'],
    },
    location: {
        completions: [
            {label: 'assign', type: 'function', detail: '(url: string) => void', info: '加载新文档'},
            {label: 'replace', type: 'function', detail: '(url: string) => void', info: '替换当前文档（不产生历史记录）'},
            {label: 'reload', type: 'function', detail: '() => void', info: '重新加载当前文档'},
            {label: 'toString', type: 'function', detail: '() => string', info: '返回完整 URL 字符串'},
            {label: 'href', type: 'property', detail: 'string', info: '完整 URL'},
            {label: 'protocol', type: 'property', detail: 'string', info: '协议部分'},
            {label: 'host', type: 'property', detail: 'string', info: '主机名和端口号'},
            {label: 'hostname', type: 'property', detail: 'string', info: '主机名'},
            {label: 'port', type: 'property', detail: 'string', info: '端口号'},
            {label: 'pathname', type: 'property', detail: 'string', info: '路径部分'},
            {label: 'search', type: 'property', detail: 'string', info: '查询字符串'},
            {label: 'hash', type: 'property', detail: 'string', info: '锚点部分'},
            {label: 'origin', type: 'property', detail: 'string', info: '源'},
        ],
        requires: ['hasWindow'],
    },
    history: {
        completions: [
            {label: 'back', type: 'function', detail: '() => void', info: '返回上一页'},
            {label: 'forward', type: 'function', detail: '() => void', info: '前进到下一页'},
            {label: 'go', type: 'function', detail: '(delta: number) => void', info: '相对当前页面跳转'},
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
            {label: 'length', type: 'property', detail: 'number', info: '历史记录条目数量'},
            {label: 'state', type: 'property', detail: 'any', info: '当前状态对象'},
            {label: 'scrollRestoration', type: 'property', detail: 'string', info: '滚动恢复模式'},
        ],
        requires: ['hasWindow'],
    },
    navigator: {
        completions: (function () {
            // 基础方法 - navigator 属性非常多，这里只列出常用的
            const base = [
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
            return base;
        })(),
        requires: ['hasNavigator'],
    },
    screen: {
        completions: [
            {label: 'width', type: 'property', detail: 'number', info: '屏幕的总宽度'},
            {label: 'height', type: 'property', detail: 'number', info: '屏幕的总高度'},
            {label: 'availWidth', type: 'property', detail: 'number', info: '屏幕可用宽度'},
            {label: 'availHeight', type: 'property', detail: 'number', info: '屏幕可用高度'},
            {label: 'colorDepth', type: 'property', detail: 'number', info: '屏幕的颜色深度'},
            {label: 'pixelDepth', type: 'property', detail: 'number', info: '屏幕的像素深度'},
            {label: 'orientation', type: 'property', detail: 'ScreenOrientation', info: '屏幕方向对象'},
        ],
        requires: ['hasWindow'],
    },
    crypto: {
        completions: [
            {label: 'randomUUID', type: 'function', detail: '() => string', info: '生成随机 UUID'},
            {
                label: 'getRandomValues',
                type: 'function',
                detail: '(array: TypedArray) => TypedArray',
                info: '填充随机值'
            },
            {label: 'subtle', type: 'property', detail: 'SubtleCrypto', info: '底层加密 API'},
        ],
        requires: ['hasCrypto'],
    },
    performance: {
        completions: [
            {label: 'now', type: 'function', detail: '() => number', info: '返回高精度时间戳'},
            {label: 'mark', type: 'function', detail: '(markName: string) => void', info: '创建时间标记'},
            {
                label: 'measure',
                type: 'function',
                detail: '(measureName: string, startMark?: string, endMark?: string) => void',
                info: '测量时间间隔'
            },
            {label: 'getEntries', type: 'function', detail: '() => PerformanceEntry[]', info: '获取性能条目列表'},
            {
                label: 'getEntriesByName',
                type: 'function',
                detail: '(name: string, type?: string) => PerformanceEntry[]',
                info: '按名称获取性能条目'
            },
            {
                label: 'getEntriesByType',
                type: 'function',
                detail: '(type: string) => PerformanceEntry[]',
                info: '按类型获取性能条目'
            },
            {label: 'clearMarks', type: 'function', detail: '(markName?: string) => void', info: '清除标记'},
            {label: 'clearMeasures', type: 'function', detail: '(measureName?: string) => void', info: '清除测量'},
            {label: 'timeOrigin', type: 'property', detail: 'number', info: '性能测量起始时间'},
            {label: 'memory', type: 'property', detail: 'object', info: '内存信息（仅 Chrome）'},
        ],
        requires: ['hasPerformance'],
    },
};

/**
 * 获取当前环境可用的内置对象数据
 * @param {Object} environment - 环境检测结果
 * @returns {Object} 过滤后的 registry
 */
export function getAvailableBuiltinData(environment) {
    const available = {};

    for (const [name, config] of Object.entries(builtinDataRegistry)) {
        if (!config.requires || config.requires.length === 0) {
            // 无依赖，始终可用
            available[name] = config.completions;
        } else {
            // 检查所有依赖是否满足
            const allMet = config.requires.every(req => {
                if (req.startsWith('has')) {
                    return environment[req] === true;
                }
                return true;
            });
            if (allMet) {
                available[name] = config.completions;
            }
        }
    }

    return available;
}

export {
    mergeBuiltinWithCustomObjects,
    normalizeCustomObjectCompletions,
    resolveCustomObjectCompletions
} from '../../utils/custom-object-completions';