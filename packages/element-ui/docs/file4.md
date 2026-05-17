好的，继续完成剩余文件。

---

## 8. `completion/sources/window-fallback-source.js` - Window 兜底补全源

```javascript
// completion/sources/window-fallback-source.js

import { getWindowScope } from '../core/environment';
import { parseFunctionSignature } from '../resolvers/signature-parser';
import { Priority } from '../core/priority';
import { globalCompletionCache } from '../core/cache';

/**
 * 创建 window 兜底补全源
 * 
 * 当其他所有补全源都没有匹配结果时，此源作为最后的兜底方案。
 * 它会扫描 window 对象的所有属性，提供基础的补全。
 * 
 * 策略：
 * 1. 使用缓存避免重复扫描
 * 2. 已知的内置对象不会重复（由其他源处理）
 * 3. 按字母排序
 * 4. 环境版本变化时自动失效
 * 
 * @param {Object} options
 * @param {Object} options.windowScope - window 作用域（如果不传则自动检测）
 * @param {Object} options.knownNames - 已知的对象名集合（用于排除）
 * @param {Object} options.environment - 环境信息
 * @returns {Function} 补全源函数
 */
export function createWindowFallbackSource(options = {}) {
    const {
        windowScope: providedScope,
        knownNames = new Set(),
        environment
    } = options;

    // window 自身不应该作为补全源的一部分被添加的标识
    const SELF_REFERENCES = ['window', 'self', 'top', 'parent', 'frames', 'globalThis'];
    // 已知在别处已有精确定义的对象
    const WELL_KNOWN = new Set([
        'Math', 'console', 'JSON', 'Array', 'Object', 'String', 'Number', 
        'Boolean', 'Date', 'RegExp', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet',
        'Symbol', 'BigInt', 'Intl', 'Proxy', 'Reflect', 'Error', 'TypeError',
        'RangeError', 'SyntaxError', 'ReferenceError', 'EvalError', 'URIError',
        'AggregateError', 'ArrayBuffer', 'SharedArrayBuffer', 'Uint8Array',
        'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'Int8Array', 
        'Int16Array', 'Int32Array', 'Float32Array', 'Float64Array',
        'BigInt64Array', 'BigUint64Array', 'DataView', 'Atomics',
        'AbortController', 'AbortSignal', 'Event', 'CustomEvent', 'EventTarget',
        'IntersectionObserver', 'MutationObserver', 'ResizeObserver',
        'URL', 'URLSearchParams', 'Blob', 'File', 'FileReader', 'FormData',
        'Request', 'Response', 'Headers', 'WebSocket', 'EventSource',
        'ReadableStream', 'WritableStream', 'TransformStream',
        'MessageChannel', 'MessagePort', 'MessageEvent',
        'BroadcastChannel', 'Worker', 'SharedWorker',
        'localStorage', 'sessionStorage', 'document', 'location', 'history',
        'navigator', 'screen', 'crypto', 'performance',
        'Notification', 'Clipboard', 'PaymentRequest',
        'Cache', 'CacheStorage',
        ...SELF_REFERENCES
    ]);

    // 过滤掉已知的和 well-known 对象名，以及用户已知的名称
    const excludedNames = new Set([...SELF_REFERENCES, ...WELL_KNOWN, ...knownNames]);

    /**
     * 获取 window 属性补全列表（带缓存）
     */
    function getWindowFallbackCompletions() {
        const cacheKey = 'window_fallback_completions';
        
        return globalCompletionCache.memoize(cacheKey, () => {
            const win = providedScope || getWindowScope();
            if (!win) return [];

            const completions = [];

            try {
                const propNames = Object.getOwnPropertyNames(win);

                for (const prop of propNames) {
                    // 跳过已排除的名称
                    if (excludedNames.has(prop)) continue;
                    // 跳过私有属性（以 _ 开头）
                    if (prop.startsWith('_')) continue;
                    // 跳过全大写常量（通常是浏览器特定的内部属性）
                    if (prop === prop.toUpperCase() && prop.length > 3) continue;
                    // 跳过以 on 开头且后续大写的事件处理属性（如 onload、onclick）
                    // 这些太多了，不实用
                    if (/^on[A-Z]/.test(prop)) continue;

                    try {
                        const value = win[prop];

                        if (typeof value === 'function') {
                            const signature = parseFunctionSignature(value);
                            completions.push({
                                label: prop,
                                type: 'function',
                                detail: signature || 'function',
                                info: `window.${prop} (兜底)`,
                                boost: 20,
                                source: 'window-fallback'
                            });
                        } else if (value && typeof value === 'object' && value !== null) {
                            // 对于对象，尝试获取原型名称
                            let objType = 'object';
                            try {
                                const constructor = value.constructor;
                                if (constructor && constructor.name) {
                                    objType = constructor.name;
                                }
                            } catch (e) {}
                            
                            const propCount = Object.keys(value).length;
                            completions.push({
                                label: prop,
                                type: 'class',
                                detail: objType !== 'Object' ? objType : `{${propCount}}`,
                                info: `window.${prop} (${objType})`,
                                boost: 18,
                                source: 'window-fallback'
                            });
                        } else {
                            completions.push({
                                label: prop,
                                type: 'variable',
                                detail: JSON.stringify(value).slice(0, 50),
                                info: `window.${prop} (兜底)`,
                                boost: 15,
                                source: 'window-fallback'
                            });
                        }
                    } catch (e) {
                        // 某些属性可能因安全策略无法访问
                        completions.push({
                            label: prop,
                            type: 'variable',
                            detail: '<protected>',
                            info: `window.${prop} (受保护)`,
                            boost: 10,
                            source: 'window-fallback'
                        });
                    }
                }
            } catch (e) {
                console.warn('获取 window 属性失败:', e);
            }

            // 按 boost 降序排列，同 boost 按字母排序
            completions.sort((a, b) => {
                const boostDiff = (b.boost || 0) - (a.boost || 0);
                if (boostDiff !== 0) return boostDiff;
                return a.label.localeCompare(b.label);
            });

            return completions;
        }, { 
            ttl: 10 * 60 * 1000, // 10分钟
            dependencies: ['environment'] 
        });
    }

    return (context) => {
        const before = context.matchBefore(/\w*/);
        if (!before || (before.from === before.to && !context.explicit)) return null;

        const word = before.text;
        const completions = getWindowFallbackCompletions();
        
        const matched = completions.filter(c =>
            c.label.toLowerCase().startsWith(word.toLowerCase())
        );

        if (matched.length === 0) return null;

        return {
            from: before.from,
            options: matched,
            validFor: /^\w*$/,
            sourcePriority: Priority.FALLBACK
        };
    };
}

/**
 * 创建 window 对象属性补全的特殊处理源
 * 
 * 当用户在 window. 后面输入时，这个源提供：
 * 1. 预定义的 window 属性（已有精确定义）
 * 2. 运行时 window 属性（兜底）
 * 
 * 此源与 object-property-source 配合使用，
 * 在 object-property-source 处理 window.xxx 时优先使用精确定义。
 */
export function createWindowPropertyCompletionSource(options = {}) {
    const {
        environment,
        builtinCompletions = {},
        customObjects = {}
    } = options;

    const fallbackSource = createWindowFallbackSource({
        knownNames: new Set([
            ...Object.keys(builtinCompletions),
            ...Object.keys(customObjects)
        ]),
        environment
    });

    return (context) => {
        return fallbackSource(context);
    };
}
```

---

## 9. `completion/sources/chain-source.js` - 链式调用补全源（基础版）

```javascript
// completion/sources/chain-source.js

import { parseFunctionSignature } from '../resolvers/signature-parser';
import { Priority } from '../core/priority';
import { getGlobalScope } from '../core/environment';

/**
 * 类型映射表
 * 将已知的返回类型映射到补全数据
 */
const typeCompletionMap = {
    'HTMLElement': 'Element',
    'Element': 'Element',
    'HTMLDivElement': 'Element',
    'HTMLSpanElement': 'Element',
    'HTMLInputElement': 'Element',
    'HTMLButtonElement': 'Element',
    'HTMLFormElement': 'Element',
    'HTMLAnchorElement': 'Element',
    'HTMLImageElement': 'Element',
    'HTMLCanvasElement': 'Element',
    'HTMLVideoElement': 'Element',
    'HTMLAudioElement': 'Element',
    'NodeList': 'NodeList',
    'HTMLCollection': 'HTMLCollection',
    'Document': 'Document',
    'Window': 'Window',
    'Array': 'Array',
    'String': 'String',
    'Number': 'Number',
    'Promise': 'Promise',
    'Map': 'Map',
    'Set': 'Set',
    'RegExp': 'RegExp',
    'Date': 'Date',
    'Error': 'Error',
};

/**
 * 链式调用类型推断
 * 
 * 基于已知方法的返回值类型，推断后续的补全。
 * 
 * 这是一个基础实现，更完整的类型推断需要：
 * 1. 符号表分析
 * 2. 类型标注
 * 3. TypeScript 集成
 * 
 * 当前实现处理常见的 DOM 链式调用。
 */
export class ChainTypeResolver {
    constructor() {
        // 方法返回值类型映射
        this.returnTypeMap = new Map();
        // 类型属性/方法映射
        this.typeMembersMap = new Map();

        this._initializeMappings();
    }

    /**
     * 初始化常用映射
     */
    _initializeMappings() {
        // Document 的方法返回类型
        this.registerReturnType('document.querySelector', 'Element|null');
        this.registerReturnType('document.querySelectorAll', 'NodeList');
        this.registerReturnType('document.getElementById', 'Element|null');
        this.registerReturnType('document.getElementsByClassName', 'HTMLCollection');
        this.registerReturnType('document.getElementsByTagName', 'HTMLCollection');
        this.registerReturnType('document.createElement', 'HTMLElement');

        // Element 的方法返回类型
        this.registerReturnType('Element.querySelector', 'Element|null');
        this.registerReturnType('Element.querySelectorAll', 'NodeList');
        this.registerReturnType('Element.getElementsByClassName', 'HTMLCollection');
        this.registerReturnType('Element.getElementsByTagName', 'HTMLCollection');
        this.registerReturnType('Element.closest', 'Element|null');
        this.registerReturnType('Element.parentElement', 'Element|null');
        this.registerReturnType('Element.nextElementSibling', 'Element|null');
        this.registerReturnType('Element.previousElementSibling', 'Element|null');
        this.registerReturnType('Element.firstElementChild', 'Element|null');
        this.registerReturnType('Element.lastElementChild', 'Element|null');

        // Array 的方法返回类型
        this.registerReturnType('Array.prototype.map', 'Array');
        this.registerReturnType('Array.prototype.filter', 'Array');
        this.registerReturnType('Array.prototype.slice', 'Array');
        this.registerReturnType('Array.prototype.concat', 'Array');
        this.registerReturnType('Array.prototype.reverse', 'Array');
        this.registerReturnType('Array.prototype.sort', 'Array');
        this.registerReturnType('Array.prototype.splice', 'Array');
        this.registerReturnType('Array.prototype.flat', 'Array');
        this.registerReturnType('Array.prototype.flatMap', 'Array');

        // String 的方法返回类型
        this.registerReturnType('String.prototype.trim', 'String');
        this.registerReturnType('String.prototype.toUpperCase', 'String');
        this.registerReturnType('String.prototype.toLowerCase', 'String');
        this.registerReturnType('String.prototype.replace', 'String');
        this.registerReturnType('String.prototype.replaceAll', 'String');
        this.registerReturnType('String.prototype.slice', 'String');
        this.registerReturnType('String.prototype.substring', 'String');
        this.registerReturnType('String.prototype.concat', 'String');
        this.registerReturnType('String.prototype.padStart', 'String');
        this.registerReturnType('String.prototype.padEnd', 'String');

        // Promise 的方法返回类型
        this.registerReturnType('Promise.prototype.then', 'Promise');
        this.registerReturnType('Promise.prototype.catch', 'Promise');
        this.registerReturnType('Promise.prototype.finally', 'Promise');
    }

    /**
     * 注册方法返回类型
     */
    registerReturnType(methodPath, returnType) {
        this.returnTypeMap.set(methodPath, returnType);
    }

    /**
     * 获取方法的返回类型
     */
    getReturnType(methodPath) {
        return this.returnTypeMap.get(methodPath);
    }

    /**
     * 尝试从代码行中推断链式调用的类型
     * 
     * @param {string} line - 光标前的代码行
     * @returns {string | null} 推断出的类型，或 null
     */
    inferChainedType(line) {
        // 模式1: 已知函数调用的链式访问
        // 例如: document.querySelector('.class').|
        const chainMatch = line.match(/\)\.(\w*)$/);
        if (chainMatch) {
            // 尝试找到函数调用
            const callMatch = line.match(
                /(\w+(?:\.\w+)*)\.(\w+)\([^)]*\)\.\w*$/
            );
            if (callMatch) {
                const [, obj, method] = callMatch;
                const path = `${obj}.${method}`;
                
                // 检查直接映射
                let returnType = this.getReturnType(path);
                if (returnType) return returnType;

                // 检查是否为原型方法调用
                // 例如 arr.map().xxx -> Array.prototype.map
                returnType = this.getReturnType(`Array.prototype.${method}`);
                if (returnType) return returnType;
                
                returnType = this.getReturnType(`String.prototype.${method}`);
                if (returnType) return returnType;
            }
        }

        // 模式2: 属性链式访问
        // 例如: element.parentElement.|
        const propChain = line.match(
            /\.(\w+)\.(\w*)$/
        );
        if (propChain) {
            const [, lastProp] = propChain;
            // 查找前一个属性的类型
            const propType = this.getReturnType(`Element.${lastProp}`);
            if (propType) return propType;
        }

        return null;
    }
}

// 单例
let chainResolverInstance = null;

export function getChainTypeResolver() {
    if (!chainResolverInstance) {
        chainResolverInstance = new ChainTypeResolver();
    }
    return chainResolverInstance;
}

/**
 * 创建链式调用补全源
 * 
 * 尝试根据前一个调用的返回类型提供补全。
 * 这是一个实验性功能，在精确补全源无结果时作为补充。
 * 
 * @returns {Function} 补全源函数
 */
export function createChainCompletionSource() {
    const resolver = getChainTypeResolver();

    return (context) => {
        const cursor = context.pos;
        const line = context.state.sliceDoc(Math.max(0, cursor - 300), cursor);

        // 检测是否在链式调用中：xxx.yyy().|
        if (!/\)\.\w*$/.test(line)) return null;

        const inferredType = resolver.inferChainedType(line);
        if (!inferredType) return null;

        // 根据推断的类型提供补全
        const scope = getGlobalScope();
        if (!scope) return null;

        try {
            // 获取该类型的原型方法
            const typeObj = scope[inferredType];
            if (!typeObj || !typeObj.prototype) return null;

            const match = line.match(/\.(\w*)$/);
            const partialProp = match ? match[1] : '';

            const completions = [];
            const prototypeNames = Object.getOwnPropertyNames(typeObj.prototype);

            for (const name of prototypeNames) {
                if (name.startsWith('_')) continue;
                if (name === 'constructor') continue;

                if (!partialProp || name.toLowerCase().startsWith(partialProp.toLowerCase())) {
                    const value = typeObj.prototype[name];
                    
                    if (typeof value === 'function') {
                        const signature = parseFunctionSignature(value);
                        completions.push({
                            label: name,
                            type: 'function',
                            detail: signature || 'function',
                            info: `${inferredType}.prototype.${name} (推断)`,
                            boost: 60,
                            source: 'chain-inference'
                        });
                    } else {
                        completions.push({
                            label: name,
                            type: 'property',
                            detail: typeof value,
                            info: `${inferredType}.prototype.${name}`,
                            boost: 55,
                            source: 'chain-inference'
                        });
                    }
                }
            }

            if (completions.length === 0) return null;

            return {
                from: cursor - partialProp.length,
                options: completions,
                validFor: /^\w*$/,
                sourcePriority: Priority.RUNTIME_GENERIC
            };
        } catch (e) {
            return null;
        }
    };
}
```

---

## 10. `completion/data/prototypes/index.js` - 原型链补全汇总

```javascript
// completion/data/prototypes/index.js

/**
 * 原型链补全数据
 * 
 * 当用户使用字面量时（如 [].xxx, "".xxx），
 * 提供对应原型上的方法补全。
 */
export const prototypeCompletions = {
    // Array.prototype
    Array: [
        { label: 'push', type: 'function', detail: '(...items: T[]) => number', info: '在数组末尾添加元素' },
        { label: 'pop', type: 'function', detail: '() => T | undefined', info: '移除数组末尾元素' },
        { label: 'shift', type: 'function', detail: '() => T | undefined', info: '移除数组开头元素' },
        { label: 'unshift', type: 'function', detail: '(...items: T[]) => number', info: '在数组开头添加元素' },
        { label: 'slice', type: 'function', detail: '(start?: number, end?: number) => T[]', info: '返回数组的浅拷贝' },
        { label: 'splice', type: 'function', detail: '(start: number, deleteCount?: number, ...items: T[]) => T[]', info: '删除/替换/插入元素' },
        { label: 'concat', type: 'function', detail: '(...items: (T | T[])[]) => T[]', info: '合并数组' },
        { label: 'join', type: 'function', detail: '(separator?: string) => string', info: '将数组连接为字符串' },
        { label: 'indexOf', type: 'function', detail: '(searchElement: T, fromIndex?: number) => number', info: '查找元素索引' },
        { label: 'lastIndexOf', type: 'function', detail: '(searchElement: T, fromIndex?: number) => number', info: '反向查找元素索引' },
        { label: 'includes', type: 'function', detail: '(searchElement: T, fromIndex?: number) => boolean', info: '检查是否包含元素' },
        { label: 'find', type: 'function', detail: '(predicate: Function, thisArg?: any) => T | undefined', info: '查找第一个满足条件的元素' },
        { label: 'findIndex', type: 'function', detail: '(predicate: Function, thisArg?: any) => number', info: '查找第一个满足条件的索引' },
        { label: 'findLast', type: 'function', detail: '(predicate: Function, thisArg?: any) => T | undefined', info: '反向查找第一个满足条件的元素' },
        { label: 'findLastIndex', type: 'function', detail: '(predicate: Function, thisArg?: any) => number', info: '反向查找第一个满足条件的索引' },
        { label: 'filter', type: 'function', detail: '(predicate: Function, thisArg?: any) => T[]', info: '过滤数组' },
        { label: 'map', type: 'function', detail: '<U>(callback: (value: T, index: number, array: T[]) => U, thisArg?: any) => U[]', info: '映射数组' },
        { label: 'reduce', type: 'function', detail: '<U>(callback: (accumulator: U, currentValue: T, index: number, array: T[]) => U, initialValue: U) => U', info: '归约数组' },
        { label: 'reduceRight', type: 'function', detail: '<U>(callback: (accumulator: U, currentValue: T, index: number, array: T[]) => U, initialValue: U) => U', info: '反向归约数组' },
        { label: 'forEach', type: 'function', detail: '(callback: (value: T, index: number, array: T[]) => void, thisArg?: any) => void', info: '遍历数组' },
        { label: 'some', type: 'function', detail: '(predicate: Function, thisArg?: any) => boolean', info: '检查是否有元素满足条件' },
        { label: 'every', type: 'function', detail: '(predicate: Function, thisArg?: any) => boolean', info: '检查是否所有元素满足条件' },
        { label: 'sort', type: 'function', detail: '(compareFn?: (a: T, b: T) => number) => T[]', info: '排序数组' },
        { label: 'reverse', type: 'function', detail: '() => T[]', info: '反转数组' },
        { label: 'fill', type: 'function', detail: '(value: T, start?: number, end?: number) => T[]', info: '填充数组' },
        { label: 'copyWithin', type: 'function', detail: '(target: number, start: number, end?: number) => T[]', info: '复制数组内元素' },
        { label: 'flat', type: 'function', detail: '(depth?: number) => T[]', info: '展平数组' },
        { label: 'flatMap', type: 'function', detail: '<U>(callback: (value: T, index: number, array: T[]) => U | U[], thisArg?: any) => U[]', info: '映射并展平' },
        { label: 'toReversed', type: 'function', detail: '() => T[]', info: '返回反转后的新数组' },
        { label: 'toSorted', type: 'function', detail: '(compareFn?: Function) => T[]', info: '返回排序后的新数组' },
        { label: 'toSpliced', type: 'function', detail: '(start: number, deleteCount?: number, ...items: T[]) => T[]', info: '返回替换后的新数组' },
        { label: 'with', type: 'function', detail: '(index: number, value: T) => T[]', info: '返回替换指定位置的新数组' },
        { label: 'at', type: 'function', detail: '(index: number) => T | undefined', info: '返回指定位置的元素' },
        { label: 'entries', type: 'function', detail: '() => IterableIterator<[number, T]>', info: '返回键值对迭代器' },
        { label: 'keys', type: 'function', detail: '() => IterableIterator<number>', info: '返回键迭代器' },
        { label: 'values', type: 'function', detail: '() => IterableIterator<T>', info: '返回值迭代器' },
        { label: 'length', type: 'property', detail: 'number', info: '数组长度' },
        { label: 'toString', type: 'function', detail: '() => string', info: '返回字符串' },
        { label: 'toLocaleString', type: 'function', detail: '() => string', info: '返回本地化字符串' },
    ],

    // String.prototype
    String: [
        { label: 'length', type: 'property', detail: 'number', info: '字符串长度' },
        { label: 'charAt', type: 'function', detail: '(index: number) => string', info: '返回指定位置的字符' },
        { label: 'charCodeAt', type: 'function', detail: '(index: number) => number', info: '返回指定位置的 Unicode 值' },
        { label: 'codePointAt', type: 'function', detail: '(pos: number) => number | undefined', info: '返回码点值' },
        { label: 'concat', type: 'function', detail: '(...strings: string[]) => string', info: '连接字符串' },
        { label: 'includes', type: 'function', detail: '(searchString: string, position?: number) => boolean', info: '检查是否包含子串' },
        { label: 'indexOf', type: 'function', detail: '(searchValue: string, fromIndex?: number) => number', info: '查找子串位置' },
        { label: 'lastIndexOf', type: 'function', detail: '(searchValue: string, fromIndex?: number) => number', info: '反向查找子串位置' },
        { label: 'match', type: 'function', detail: '(regexp: RegExp | string) => RegExpMatchArray | null', info: '正则匹配' },
        { label: 'matchAll', type: 'function', detail: '(regexp: RegExp) => IterableIterator<RegExpMatchArray>', info: '正则全局匹配' },
        { label: 'replace', type: 'function', detail: '(searchValue: string | RegExp, replaceValue: string | Function) => string', info: '替换' },
        { label: 'replaceAll', type: 'function', detail: '(searchValue: string | RegExp, replaceValue: string | Function) => string', info: '全部替换' },
        { label: 'search', type: 'function', detail: '(regexp: RegExp | string) => number', info: '搜索匹配位置' },
        { label: 'slice', type: 'function', detail: '(start?: number, end?: number) => string', info: '提取子串' },
        { label: 'split', type: 'function', detail: '(separator: string | RegExp, limit?: number) => string[]', info: '分割字符串' },
        { label: 'substring', type: 'function', detail: '(start: number, end?: number) => string', info: '提取子串' },
        { label: 'toLowerCase', type: 'function', detail: '() => string', info: '转为小写' },
        { label: 'toUpperCase', type: 'function', detail: '() => string', info: '转为大写' },
        { label: 'toLocaleLowerCase', type: 'function', detail: '() => string', info: '转为本地小写' },
        { label: 'toLocaleUpperCase', type: 'function', detail: '() => string', info: '转为本地大写' },
        { label: 'trim', type: 'function', detail: '() => string', info: '去除首尾空白' },
        { label: 'trimStart', type: 'function', detail: '() => string', info: '去除开头空白' },
        { label: 'trimEnd', type: 'function', detail: '() => string', info: '去除末尾空白' },
        { label: 'padStart', type: 'function', detail: '(targetLength: number, padString?: string) => string', info: '开头填充' },
        { label: 'padEnd', type: 'function', detail: '(targetLength: number, padString?: string) => string', info: '末尾填充' },
        { label: 'startsWith', type: 'function', detail: '(searchString: string, position?: number) => boolean', info: '检查开头' },
        { label: 'endsWith', type: 'function', detail: '(searchString: string, endPosition?: number) => boolean', info: '检查末尾' },
        { label: 'repeat', type: 'function', detail: '(count: number) => string', info: '重复字符串' },
        { label: 'at', type: 'function', detail: '(index: number) => string | undefined', info: '返回指定位置字符' },
        { label: 'isWellFormed', type: 'function', detail: '() => boolean', info: '检查是否合规的 UTF-16' },
        { label: 'toWellFormed', type: 'function', detail: '() => string', info: '转换为合规的 UTF-16' },
        { label: 'toString', type: 'function', detail: '() => string', info: '返回字符串本身' },
    ],

    // Number.prototype
    Number: [
        { label: 'toFixed', type: 'function', detail: '(fractionDigits?: number) => string', info: '保留指定位数小数' },
        { label: 'toExponential', type: 'function', detail: '(fractionDigits?: number) => string', info: '转换为指数表示' },
        { label: 'toPrecision', type: 'function', detail: '(precision?: number) => string', info: '转换为指定精度' },
        { label: 'toString', type: 'function', detail: '(radix?: number) => string', info: '转换为字符串' },
        { label: 'toLocaleString', type: 'function', detail: '(locales?: string | string[], options?: object) => string', info: '本地化字符串' },
        { label: 'valueOf', type: 'function', detail: '() => number', info: '返回原始数值' },
    ],

    // Date.prototype
    Date: [
        { label: 'getFullYear', type: 'function', detail: '() => number', info: '获取年份' },
        { label: 'getMonth', type: 'function', detail: '() => number', info: '获取月份 (0-11)' },
        { label: 'getDate', type: 'function', detail: '() => number', info: '获取日期' },
        { label: 'getDay', type: 'function', detail: '() => number', info: '获取星期 (0-6)' },
        { label: 'getHours', type: 'function', detail: '() => number', info: '获取小时' },
        { label: 'getMinutes', type: 'function', detail: '() => number', info: '获取分钟' },
        { label: 'getSeconds', type: 'function', detail: '() => number', info: '获取秒' },
        { label: 'getMilliseconds', type: 'function', detail: '() => number', info: '获取毫秒' },
        { label: 'getTime', type: 'function', detail: '() => number', info: '获取时间戳' },
        { label: 'getTimezoneOffset', type: 'function', detail: '() => number', info: '获取时区偏移' },
        { label: 'getUTCFullYear', type: 'function', detail: '() => number', info: '获取 UTC 年份' },
        { label: 'getUTCMonth', type: 'function', detail: '() => number', info: '获取 UTC 月份' },
        { label: 'getUTCDate', type: 'function', detail: '() => number', info: '获取 UTC 日期' },
        { label: 'getUTCDay', type: 'function', detail: '() => number', info: '获取 UTC 星期' },
        { label: 'getUTCHours', type: 'function', detail: '() => number', info: '获取 UTC 小时' },
        { label: 'getUTCMinutes', type: 'function', detail: '() => number', info: '获取 UTC 分钟' },
        { label: 'getUTCSeconds', type: 'function', detail: '() => number', info: '获取 UTC 秒' },
        { label: 'getUTCMilliseconds', type: 'function', detail: '() => number', info: '获取 UTC 毫秒' },
        { label: 'setFullYear', type: 'function', detail: '(year: number, month?: number, date?: number) => number', info: '设置年份' },
        { label: 'setMonth', type: 'function', detail: '(month: number, date?: number) => number', info: '设置月份' },
        { label: 'setDate', type: 'function', detail: '(date: number) => number', info: '设置日期' },
        { label: 'setHours', type: 'function', detail: '(hours: number, min?: number, sec?: number, ms?: number) => number', info: '设置小时' },
        { label: 'setMinutes', type: 'function', detail: '(min: number, sec?: number, ms?: number) => number', info: '设置分钟' },
        { label: 'setSeconds', type: 'function', detail: '(sec: number, ms?: number) => number', info: '设置秒' },
        { label: 'setMilliseconds', type: 'function', detail: '(ms: number) => number', info: '设置毫秒' },
        { label: 'setTime', type: 'function', detail: '(time: number) => number', info: '设置时间戳' },
        { label: 'toISOString', type: 'function', detail: '() => string', info: '转为 ISO 字符串' },
        { label: 'toJSON', type: 'function', detail: '() => string', info: '转为 JSON 字符串' },
        { label: 'toLocaleDateString', type: 'function', detail: '() => string', info: '转为本地日期字符串' },
        { label: 'toLocaleTimeString', type: 'function', detail: '() => string', info: '转为本地时间字符串' },
        { label: 'toLocaleString', type: 'function', detail: '() => string', info: '转为本地字符串' },
        { label: 'toString', type: 'function', detail: '() => string', info: '转为字符串' },
        { label: 'toDateString', type: 'function', detail: '() => string', info: '转为日期字符串' },
        { label: 'toTimeString', type: 'function', detail: '() => string', info: '转为时间字符串' },
        { label: 'toUTCString', type: 'function', detail: '() => string', info: '转为 UTC 字符串' },
        { label: 'valueOf', type: 'function', detail: '() => number', info: '返回时间戳' },
        { label: 'getTimezoneOffset', type: 'function', detail: '() => number', info: '获取时区偏移' },
    ],

    // RegExp.prototype
    RegExp: [
        { label: 'exec', type: 'function', detail: '(string: string) => RegExpExecArray | null', info: '执行正则匹配' },
        { label: 'test', type: 'function', detail: '(string: string) => boolean', info: '测试是否匹配' },
        { label: 'toString', type: 'function', detail: '() => string', info: '转为字符串' },
        { label: 'source', type: 'property', detail: 'string', info: '正则表达式源码' },
        { label: 'flags', type: 'property', detail: 'string', info: '正则标志' },
        { label: 'global', type: 'property', detail: 'boolean', info: '是否有 g 标志' },
        { label: 'ignoreCase', type: 'property', detail: 'boolean', info: '是否有 i 标志' },
        { label: 'multiline', type: 'property', detail: 'boolean', info: '是否有 m 标志' },
        { label: 'dotAll', type: 'property', detail: 'boolean', info: '是否有 s 标志' },
        { label: 'unicode', type: 'property', detail: 'boolean', info: '是否有 u 标志' },
        { label: 'sticky', type: 'property', detail: 'boolean', info: '是否有 y 标志' },
        { label: 'lastIndex', type: 'property', detail: 'number', info: '下次匹配起始位置' },
        { label: 'hasIndices', type: 'property', detail: 'boolean', info: '是否有 d 标志' },
    ],

    // Map.prototype
    Map: [
        { label: 'get', type: 'function', detail: '(key: K) => V | undefined', info: '获取值' },
        { label: 'set', type: 'function', detail: '(key: K, value: V) => Map<K, V>', info: '设置键值对' },
        { label: 'has', type: 'function', detail: '(key: K) => boolean', info: '检查键是否存在' },
        { label: 'delete', type: 'function', detail: '(key: K) => boolean', info: '删除键值对' },
        { label: 'clear', type: 'function', detail: '() => void', info: '清空所有键值对' },
        { label: 'size', type: 'property', detail: 'number', info: '键值对数量' },
        { label: 'forEach', type: 'function', detail: '(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) => void', info: '遍历' },
        { label: 'keys', type: 'function', detail: '() => IterableIterator<K>', info: '键迭代器' },
        { label: 'values', type: 'function', detail: '() => IterableIterator<V>', info: '值迭代器' },
        { label: 'entries', type: 'function', detail: '() => IterableIterator<[K, V]>', info: '键值对迭代器' },
    ],

    // Set.prototype
    Set: [
        { label: 'add', type: 'function', detail: '(value: T) => Set<T>', info: '添加值' },
        { label: 'has', type: 'function', detail: '(value: T) => boolean', info: '检查值是否存在' },
        { label: 'delete', type: 'function', detail: '(value: T) => boolean', info: '删除值' },
        { label: 'clear', type: 'function', detail: '() => void', info: '清空所有值' },
        { label: 'size', type: 'property', detail: 'number', info: '值的数量' },
        { label: 'forEach', type: 'function', detail: '(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) => void', info: '遍历' },
        { label: 'keys', type: 'function', detail: '() => IterableIterator<T>', info: '值迭代器' },
        { label: 'values', type: 'function', detail: '() => IterableIterator<T>', info: '值迭代器' },
        { label: 'entries', type: 'function', detail: '() => IterableIterator<[T, T]>', info: '键值对迭代器' },
        { label: 'union', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '并集' },
        { label: 'intersection', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '交集' },
        { label: 'difference', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '差集' },
        { label: 'symmetricDifference', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '对称差集' },
        { label: 'isSubsetOf', type: 'function', detail: '(other: Set<T>) => boolean', info: '是否为子集' },
        { label: 'isSupersetOf', type: 'function', detail: '(other: Set<T>) => boolean', info: '是否为超集' },
        { label: 'isDisjointFrom', type: 'function', detail: '(other: Set<T>) => boolean', info: '是否无交集' },
    ],

    // Promise.prototype
    Promise: [
        { label: 'then', type: 'function', detail: '<TResult1 = T, TResult2 = never>(onfulfilled?: Function, onrejected?: Function) => Promise<TResult1 | TResult2>', info: '添加回调' },
        { label: 'catch', type: 'function', detail: '<TResult = never>(onrejected?: Function) => Promise<T | TResult>', info: '捕获错误' },
        { label: 'finally', type: 'function', detail: '(onfinally?: Function) => Promise<T>', info: '总是执行' },
    ],

    // Element (DOM)
    Element: [
        { label: 'id', type: 'property', detail: 'string', info: '元素 ID' },
        { label: 'className', type: 'property', detail: 'string', info: '类名字符串' },
        { label: 'classList', type: 'property', detail: 'DOMTokenList', info: '类名列表' },
        { label: 'innerHTML', type: 'property', detail: 'string', info: '内部 HTML' },
        { label: 'outerHTML', type: 'property', detail: 'string', info: '外部 HTML' },
        { label: 'textContent', type: 'property', detail: 'string', info: '文本内容' },
        { label: 'innerText', type: 'property', detail: 'string', info: '内部文本' },
        { label: 'tagName', type: 'property', detail: 'string', info: '标签名' },
        { label: 'children', type: 'property', detail: 'HTMLCollection', info: '子元素集合' },
        { label: 'childElementCount', type: 'property', detail: 'number', info: '子元素数量' },
        { label: 'parentElement', type: 'property', detail: 'Element | null', info: '父元素' },
        { label: 'parentNode', type: 'property', detail: 'Node | null', info: '父节点' },
        { label: 'nextElementSibling', type: 'property', detail: 'Element | null', info: '下一个兄弟元素' },
        { label: 'previousElementSibling', type: 'property', detail: 'Element | null', info: '上一个兄弟元素' },
        { label: 'firstElementChild', type: 'property', detail: 'Element | null', info: '第一个子元素' },
        { label: 'lastElementChild', type: 'property', detail: 'Element | null', info: '最后一个子元素' },
        { label: 'style', type: 'property', detail: 'CSSStyleDeclaration', info: '样式对象' },
        { label: 'dataset', type: 'property', detail: 'DOMStringMap', info: 'data-* 属性映射' },
        { label: 'scrollTop', type: 'property', detail: 'number', info: '垂直滚动位置' },
        { label: 'scrollLeft', type: 'property', detail: 'number', info: '水平滚动位置' },
        { label: 'scrollHeight', type: 'property', detail: 'number', info: '滚动高度' },
        { label: 'scrollWidth', type: 'property', detail: 'number', info: '滚动宽度' },
        { label: 'clientHeight', type: 'property', detail: 'number', info: '客户端高度' },
        { label: 'clientWidth', type: 'property', detail: 'number', info: '客户端宽度' },
        { label: 'offsetHeight', type: 'property', detail: 'number', info: '偏移高度' },
        { label: 'offsetWidth', type: 'property', detail: 'number', info: '偏移宽度' },
        { label: 'getAttribute', type: 'function', detail: '(name: string) => string | null', info: '获取属性值' },
        { label: 'setAttribute', type: 'function', detail: '(name: string, value: string) => void', info: '设置属性值' },
        { label: 'removeAttribute', type: 'function', detail: '(name: string) => void', info: '移除属性' },
        { label: 'hasAttribute', type: 'function', detail: '(name: string) => boolean', info: '检查是否有属性' },
        { label: 'querySelector', type: 'function', detail: '(selectors: string) => Element | null', info: '查找子元素' },
        { label: 'querySelectorAll', type: 'function', detail: '(selectors: string) => NodeList', info: '查找所有子元素' },
        { label: 'closest', type: 'function', detail: '(selectors: string) => Element | null', info: '查找最近的祖先元素' },
        { label: 'matches', type: 'function', detail: '(selectors: string) => boolean', info: '检查是否匹配选择器' },
        { label: 'append', type: 'function', detail: '(...nodes: (Node | string)[]) => void', info: '追加子节点' },
        { label: 'prepend', type: 'function', detail: '(...nodes: (Node | string)[]) => void', info: '前置子节点' },
        { label: 'remove', type: 'function', detail: '() => void', info: '移除元素' },
        { label: 'before', type: 'function', detail: '(...nodes: (Node | string)[]) => void', info: '在前面插入' },
        { label: 'after', type: 'function', detail: '(...nodes: (Node | string)[]) => void', info: '在后面插入' },
        { label: 'replaceWith', type: 'function', detail: '(...nodes: (Node | string)[]) => void', info: '替换元素' },
        { label: 'insertAdjacentHTML', type: 'function', detail: '(position: string, text: string) => void', info: '插入 HTML' },
        { label: 'insertAdjacentElement', type: 'function', detail: '(position: string, element: Element) => Element | null', info: '插入元素' },
        { label: 'addEventListener', type: 'function', detail: '(type: string, listener: EventListener, options?: object) => void', info: '添加事件监听' },
        { label: 'removeEventListener', type: 'function', detail: '(type: string, listener: EventListener, options?: object) => void', info: '移除事件监听' },
        { label: 'dispatchEvent', type: 'function', detail: '(event: Event) => boolean', info: '派发事件' },
        { label: 'click', type: 'function', detail: '() => void', info: '模拟点击' },
        { label: 'focus', type: 'function', detail: '() => void', info: '使元素获得焦点' },
        { label: 'blur', type: 'function', detail: '() => void', info: '使元素失去焦点' },
        { label: 'scrollIntoView', type: 'function', detail: '(arg?: boolean | ScrollIntoViewOptions) => void', info: '滚动到可见' },
        { label: 'getBoundingClientRect', type: 'function', detail: '() => DOMRect', info: '获取边界矩形' },
        { label: 'animate', type: 'function', detail: '(keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions) => Animation', info: '创建动画' },
    ],

    // NodeList (DOM)
    NodeList: [
        { label: 'length', type: 'property', detail: 'number', info: '节点数量' },
        { label: 'item', type: 'function', detail: '(index: number) => Node | null', info: '获取指定索引的节点' },
        { label: 'forEach', type: 'function', detail: '(callback: (node: Node, index: number, list: NodeList) => void, thisArg?: any) => void', info: '遍历节点' },
        { label: 'entries', type: 'function', detail: '() => IterableIterator<[number, Node]>', info: '键值对迭代器' },
        { label: 'keys', type: 'function', detail: '() => IterableIterator<number>', info: '键迭代器' },
        { label: 'values', type: 'function', detail: '() => IterableIterator<Node>', info: '值迭代器' },
    ],

    // HTMLCollection (DOM)
    HTMLCollection: [
        { label: 'length', type: 'property', detail: 'number', info: '集合数量' },
        { label: 'item', type: 'function', detail: '(index: number) => Element | null', info: '获取指定索引的元素' },
        { label: 'namedItem', type: 'function', detail: '(name: string) => Element | null', info: '通过 name/id 获取元素' },
    ],
};
```

---

## 11. `completion/resolvers/signature-parser.js` - 函数签名解析器

```javascript
// completion/resolvers/signature-parser.js

/**
 * 解析函数签名
 * 
 * 从函数对象的源码中提取参数列表。
 * 
 * @param {Function} fn - 函数对象
 * @returns {string} 参数签名字符串，如 "(a: number, b: string) => any"
 */
export function parseFunctionSignature(fn) {
    if (typeof fn !== 'function') return '(...) => unknown';

    try {
        const fnStr = fn.toString().trim();

        // 处理 class 构造函数
        if (fnStr.startsWith('class')) {
            const constructorMatch = fnStr.match(/constructor\s*\(([^)]*)\)/);
            if (constructorMatch) {
                return `new (${constructorMatch[1].trim()}) => instance`;
            }
            return `new (...) => instance`;
        }

        // 处理普通函数: function name(a, b, c) { ... }
        let match = fnStr.match(/function\s*[\w$]*\s*\(([^)]*)\)/);
        if (match) {
            const params = cleanParams(match[1]);
            return `(${params}) => any`;
        }

        // 处理箭头函数: (a, b) => ... 或 a => ...
        match = fnStr.match(/^\(?([^)=]*)\)?\s*=>/);
        if (match) {
            let params = match[1].trim();
            // 单参数箭头函数，没有括号
            if (params && !params.includes(',') && fnStr.startsWith(params)) {
                params = [params];
            } else {
                params = cleanParams(params);
            }
            return `(${params}) => any`;
        }

        // 处理方法定义: method(a, b) { ... }
        match = fnStr.match(/^[\w$]+\s*\(([^)]*)\)/);
        if (match) {
            const params = cleanParams(match[1]);
            return `(${params}) => any`;
        }

        // 处理 getter/setter
        if (fnStr.startsWith('get ')) {
            return `get => any`;
        }
        if (fnStr.startsWith('set ')) {
            match = fnStr.match(/set\s+[\w$]+\s*\(([^)]*)\)/);
            if (match) {
                return `set (${cleanParams(match[1])}) => void`;
            }
        }

        // 处理 async function
        match = fnStr.match(/async\s+function\s*[\w$]*\s*\(([^)]*)\)/);
        if (match) {
            const params = cleanParams(match[1]);
            return `async (${params}) => Promise<any>`;
        }

        // 处理 async 箭头函数
        match = fnStr.match(/async\s*\(?([^)=]*)\)?\s*=>/);
        if (match) {
            let params = match[1].trim();
            if (params && !params.includes(',') && fnStr.includes(`async ${params}`)) {
                params = [params];
            } else {
                params = cleanParams(params);
            }
            return `async (${params}) => Promise<any>`;
        }

        return '(...) => unknown';
    } catch (e) {
        return '(...) => unknown';
    }
}

/**
 * 清理参数列表
 */
function cleanParams(paramsStr) {
    if (!paramsStr || paramsStr.trim() === '') return '';
    
    return paramsStr
        .split(',')
        .map(p => p.trim())
        .filter(p => p !== '')
        .map(p => {
            // 移除默认值
            const eqIndex = p.indexOf('=');
            if (eqIndex !== -1) p = p.substring(0, eqIndex).trim();
            // 移除解构的花括号/方括号（简化）
            p = p.replace(/^\{[^}]*\}/, '{...}');
            p = p.replace(/^\[[^\]]*\]/, '[...]');
            return p;
        })
        .join(', ');
}

/**
 * 获取带返回值推断的函数签名
 * 
 * @param {Function} fn - 函数对象
 * @returns {string | null} 完整签名字符串
 */
export function getFunctionSignature(fn) {
    if (typeof fn !== 'function') return null;

    const paramsSignature = parseFunctionSignature(fn);
    const returnType = inferReturnType(fn);

    // 如果签名已经是 async，包含 Promise
    if (paramsSignature.startsWith('async ')) {
        return paramsSignature.replace('=> any', `=> ${returnType}`);
    }

    return paramsSignature.replace('=> any', `=> ${returnType}`);
}

/**
 * 尝试推断函数的返回值类型
 * 
 * @param {Function} fn - 函数对象
 * @returns {string} 返回值类型字符串
 */
export function inferReturnType(fn) {
    if (typeof fn !== 'function') return 'unknown';

    try {
        const fnStr = fn.toString();
        const isAsync = fnStr.startsWith('async') || /async\s+function/.test(fnStr);

        // 明显的 return 语句模式
        if (fnStr.includes('return Promise')) return isAsync ? 'Promise<any>' : 'Promise<any>';
        if (fnStr.includes('return new Promise')) return 'Promise<T>';
        if (fnStr.includes('return []')) return 'Array<T>';
        if (fnStr.includes('return {}')) return 'object';
        if (fnStr.match(/return\s+["'`]/)) return 'string';
        if (fnStr.match(/return\s+[0-9]/)) return 'number';
        if (fnStr.match(/return\s+true\b|return\s+false\b/)) return 'boolean';
        if (fnStr.includes('return null')) return 'null';
        if (fnStr.includes('return undefined')) return 'undefined';
        if (fnStr.match(/return\s+this\b/)) return 'this';
        if (fnStr.match(/return\s+new\s+\w+/)) {
            const match = fnStr.match(/return\s+new\s+(\w+)/);
            return match ? match[1] : 'object';
        }

        // 尝试从函数体末尾找到 return 语句
        const returnMatch = fnStr.match(/return\s+([^;{\n]+)/);
        if (returnMatch) {
            const returnExpr = returnMatch[1].trim();
            if (returnExpr === 'this') return 'this';
            if (returnExpr.startsWith('[')) return 'Array';
            if (returnExpr.startsWith('{')) return 'object';
            if (returnExpr.startsWith('"') || returnExpr.startsWith("'") || returnExpr.startsWith('`')) return 'string';
            if (/^\d/.test(returnExpr)) return 'number';
        }

        return isAsync ? 'Promise<T>' : 'any';
    } catch (e) {
        return 'any';
    }
}
```

---

## 12. `completion/utils/normalize.js` - 数据规范化

```javascript
// completion/utils/normalize.js

import { Priority } from '../core/priority';

/**
 * 补全项规范化
 * 
 * 确保所有补全项有一致的格式。
 */
export function normalizeCompletionItem(item, defaults = {}) {
    return {
        label: item.label || '',
        type: item.type || 'variable',
        detail: item.detail || '',
        info: item.info || '',
        boost: item.boost ?? 50,
        source: item.source || 'unknown',
        apply: item.apply || item.label,
        priority: item.priority || defaults.priority || Priority.RUNTIME_GENERIC,
        ...item
    };
}

/**
 * 合并补全项（去重，保留优先级最高的）
 */
export function mergeCompletionItems(items) {
    const seen = new Map();
    
    for (const item of items) {
        const existing = seen.get(item.label);
        if (!existing) {
            seen.set(item.label, normalizeCompletionItem(item));
        } else {
            // 保留优先级更高的
            const existingPriority = existing.priority || 0;
            const newPriority = item.priority || 0;
            if (newPriority > existingPriority) {
                seen.set(item.label, normalizeCompletionItem(item));
            } else if (newPriority === existingPriority && (item.boost || 0) > (existing.boost || 0)) {
                seen.set(item.label, normalizeCompletionItem(item));
            }
        }
    }
    
    return Array.from(seen.values());
}

/**
 * 排序补全项
 * 
 * 按 boost 降序，相同 boost 按字母升序
 */
export function sortCompletionItems(items) {
    return items.sort((a, b) => {
        const boostDiff = (b.boost || 0) - (a.boost || 0);
        if (boostDiff !== 0) return boostDiff;
        return a.label.localeCompare(b.label);
    });
}
```

---

## 13. `completion/utils/merge.js` - 补全源合并（改进版）

```javascript
// completion/utils/merge.js

import { Priority } from '../core/priority';
import { globalCompletionCache } from '../core/cache';
import { mergeCompletionItems, sortCompletionItems } from './normalize';

/**
 * 合并补全源
 * 
 * 策略：
 * 1. 按优先级顺序执行源
 * 2. 第一个返回结果的源直接返回（快速路径）
 * 3. 可使用 "累积模式" 合并所有源的结果
 * 
 * @param {Array<Function>} sources - 补全源函数数组
 * @param {Object} options
 * @param {boolean} options.accumulate - 是否累积所有源的结果（默认 false）
 * @param {boolean} options.cache - 是否启用缓存（默认 false）
 * @returns {Function} 合并后的补全源函数
 */
export function mergeCompletionSources(sources, options = {}) {
    const { accumulate = false, cache = false } = options;

    if (accumulate) {
        return createAccumulateMerger(sources, cache);
    }
    return createFirstMatchMerger(sources);
}

/**
 * 创建 "首个匹配" 合并器
 * 按顺序尝试源，第一个返回非空结果的立即返回
 */
function createFirstMatchMerger(sources) {
    return async (context) => {
        for (const source of sources) {
            try {
                const result = await source(context);
                if (result && result.options && result.options.length > 0) {
                    return {
                        ...result,
                        options: sortCompletionItems(
                            result.options.map(item => ({
                                ...item,
                                source: item.source || 'merged'
                            }))
                        )
                    };
                }
            } catch (error) {
                console.warn('补全源执行失败:', error);
            }
        }
        return null;
    };
}

/**
 * 创建 "累积" 合并器
 * 执行所有源，合并结果，去重排序
 */
function createAccumulateMerger(sources, enableCache) {
    return async (context) => {
        const cacheKey = enableCache 
            ? `completion_accumulate_${context.pos}_${context.state.doc.length}`
            : null;

        if (cacheKey) {
            const cached = globalCompletionCache.get(cacheKey);
            if (cached) return cached;
        }

        let allItems = [];
        const seenSources = new Set();

        for (const source of sources) {
            try {
                const result = await source(context);
                if (result && result.options && result.options.length > 0) {
                    for (const item of result.options) {
                        // 记录来源
                        item._source = item.source || 'unknown';
                        item._sourcePriority = result.sourcePriority || item.priority || Priority.RUNTIME_GENERIC;
                    }
                    allItems = allItems.concat(result.options);
                    seenSources.add(result.sourcePriority || Priority.RUNTIME_GENERIC);
                }
            } catch (error) {
                console.warn('补全源执行失败:', error);
            }
        }

        if (allItems.length === 0) return null;

        // 合并去重
        allItems = mergeCompletionItems(allItems);
        // 排序
        allItems = sortCompletionItems(allItems);

        const finalResult = {
            from: allItems[0]._from || context.pos,
            options: allItems,
            validFor: /^\w*$/
        };

        if (cacheKey) {
            globalCompletionCache.set(cacheKey, finalResult, { ttl: 30000 });
        }

        return finalResult;
    };
}

/**
 * 创建优先级排序的合并源
 * 
 * 源按 priority 属性排序后执行
 */
export function mergePrioritizedSources(sourceConfigs) {
    // 按优先级排序
    const sorted = [...sourceConfigs].sort((a, b) => b.priority - a.priority);
    const sources = sorted.map(s => s.source);
    
    return mergeCompletionSources(sources, { accumulate: false });
}
```

---

## 14. `completion/index.js` - 主入口（完整重构版）

```javascript
// completion/index.js

import { detectEnvironment, getWindowScope, createEnvironmentCacheKey } from './core/environment';
import { CompletionSourceManager, Priority } from './core/priority';
import { globalCompletionCache } from './core/cache';
import { createGlobalCompletionSource } from './sources/global-source';
import { createObjectPropertyCompletionSource } from './sources/object-property-source';
import { createWindowFallbackSource } from './sources/window-fallback-source';
import { createChainCompletionSource } from './sources/chain-source';
import { mergeCompletionSources } from './utils/merge';
import { normalizeCompletionItem } from './utils/normalize';

/**
 * 创建完整的 JavaScript 代码补全配置
 * 
 * @param {Object} options - 配置选项
 * @param {Array} options.customCompletions - 用户自定义补全项
 *   [{ label, type, detail, info, path?, boost?, ... }]
 * @param {Object} options.customObjects - 用户自定义对象
 *   { objName: realObject }
 * @param {Object} options.customSignatures - 用户自定义签名
 *   { 'objName.methodName': { type, detail, info } }
 * @param {boolean} options.includeWindow - 是否包含 window 对象扫描（默认 true）
 * @param {boolean} options.includeChain - 是否包含链式调用推断（默认 true）
 * @param {boolean} options.includePrototypes - 是否包含原型链补全（默认 true）
 * @param {Object} options.environment - 预检测的环境（可选，自动检测）
 * @param {boolean} options.debug - 是否启用调试模式（默认 false）
 * @returns {Object} autocompletion 配置对象
 */
export function createJavaScriptCompletions(options = {}) {
    const {
        customCompletions = [],
        customObjects = {},
        customSignatures = {},
        includeWindow = true,
        includeChain = true,
        includePrototypes = true,
        environment: providedEnv,
        debug = false
    } = options;

    // 1. 环境检测
    const environment = providedEnv || detectEnvironment();
    
    if (debug) {
        console.log('[Completion] 环境检测:', {
            type: environment.type,
            features: environment.features
        });
    }

    // 2. 创建源管理器
    const sourceManager = new CompletionSourceManager();

    // 3. 注册补全源（按优先级顺序）

    // 优先级 1: 全局变量补全（最高优先级，处理 Math、console、document 等）
    const globalSource = createGlobalCompletionSource({
        customCompletions,
        customObjects,
        environment
    });
    sourceManager.register({
        name: 'global',
        priority: Priority.PREDEFINED_GLOBAL,
        sourceFn: globalSource,
        requires: []
    });

    // 优先级 2: 对象属性补全（处理 obj.xxx，含原型链）
    const objectPropertySource = createObjectPropertyCompletionSource({
        customObjects,
        customSignatures,
        environment,
        includePrototypes,
        windowFallbackEnabled: includeWindow
    });
    sourceManager.register({
        name: 'object-property',
        priority: Priority.PREDEFINED_BUILTIN,
        sourceFn: objectPropertySource,
        requires: []
    });

    // 优先级 3: 链式调用补全（实验性）
    if (includeChain) {
        const chainSource = createChainCompletionSource();
        sourceManager.register({
            name: 'chain',
            priority: Priority.RUNTIME_PROTOTYPE_CHAIN,
            sourceFn: chainSource,
            requires: ['hasWindow']
        });
    }

    // 优先级 4: window 兜底补全（仅浏览器环境）
    if (includeWindow && environment.hasWindow) {
        const windowScope = getWindowScope();
        if (windowScope) {
            const windowFallbackSource = createWindowFallbackSource({
                windowScope,
                environment,
                knownNames: new Set(Object.keys(customObjects))
            });
            sourceManager.register({
                name: 'window-fallback',
                priority: Priority.RUNTIME_WINDOW_PROPERTY,
                sourceFn: windowFallbackSource,
                requires: ['hasWindow']
            });
        }
    }

    // 4. 获取活跃的源函数列表
    const activeSources = sourceManager.getActiveSources(environment);

    if (debug) {
        console.log('[Completion] 活跃的源:', sourceManager.getDebugInfo()
            .filter(s => {
                const src = sourceManager.sources.find(ss => ss.name === s.name);
                return src && src.enabled;
            })
            .map(s => s.name)
        );
    }

    // 5. 合并源
    const mergedSource = mergeCompletionSources(activeSources, {
        accumulate: false // 使用快速路径：首个匹配即返回
    });

    // 6. 返回 CodeMirror autocompletion 配置
    return {
        activateOnTyping: true,
        defaultKeymap: true,
        override: [mergedSource],
        // 可选：提供手动触发补全的方法
        _debug: debug ? {
            environment,
            sources: sourceManager.getDebugInfo(),
            cache: globalCompletionCache.getStats()
        } : undefined
    };
}

/**
 * 简化版 API：直接返回 autocompletion 配置
 */
export function getAutocompletionConfig(options = {}) {
    return createJavaScriptCompletions(options);
}

// 导出工具函数
export {
    detectEnvironment,
    getWindowScope,
    globalCompletionCache,
    Priority,
    CompletionSourceManager,
    normalizeCompletionItem,
    mergeCompletionSources,
    createGlobalCompletionSource,
    createObjectPropertyCompletionSource,
    createWindowFallbackSource,
    createChainCompletionSource
};

// 导出环境相关
export { EnvironmentType, getGlobalScope } from './core/environment';

// 导出签名解析器
export { parseFunctionSignature, getFunctionSignature, inferReturnType } from './resolvers/signature-parser';
```

---

## 15. `completion/data/globals.js` - 全局变量定义

```javascript
// completion/data/globals.js

/**
 * 全局变量补全数据
 * 
 * 这些是所有环境（或大多数环境）都支持的全局标识符。
 * 根据 requires 字段，在环境检测后自动过滤。
 */
export const globalCompletions = [
    // ==================== 始终可用的内置对象 ====================
    { label: 'Math', type: 'class', detail: 'object', info: '数学运算对象' },
    { label: 'console', type: 'class', detail: 'object', info: '控制台对象' },
    { label: 'JSON', type: 'class', detail: 'object', info: 'JSON 解析和序列化' },
    { label: 'Array', type: 'class', detail: 'constructor', info: '数组构造函数' },
    { label: 'Object', type: 'class', detail: 'constructor', info: '对象构造函数' },
    { label: 'String', type: 'class', detail: 'constructor', info: '字符串构造函数' },
    { label: 'Number', type: 'class', detail: 'constructor', info: '数字构造函数' },
    { label: 'Boolean', type: 'class', detail: 'constructor', info: '布尔构造函数' },
    { label: 'Date', type: 'class', detail: 'constructor', info: '日期构造函数' },
    { label: 'RegExp', type: 'class', detail: 'constructor', info: '正则表达式构造函数' },
    { label: 'Promise', type: 'class', detail: 'constructor', info: 'Promise 构造函数' },
    { label: 'Map', type: 'class', detail: 'constructor', info: 'Map 构造函数' },
    { label: 'Set', type: 'class', detail: 'constructor', info: 'Set 构造函数' },
    { label: 'WeakMap', type: 'class', detail: 'constructor', info: 'WeakMap 构造函数' },
    { label: 'WeakSet', type: 'class', detail: 'constructor', info: 'WeakSet 构造函数' },
    { label: 'Error', type: 'class', detail: 'constructor', info: '错误构造函数' },
    { label: 'TypeError', type: 'class', detail: 'constructor', info: '类型错误构造函数' },
    { label: 'RangeError', type: 'class', detail: 'constructor', info: '范围错误构造函数' },
    { label: 'SyntaxError', type: 'class', detail: 'constructor', info: '语法错误构造函数' },
    { label: 'ReferenceError', type: 'class', detail: 'constructor', info: '引用错误构造函数' },

    // ==================== 全局函数 ====================
    { label: 'setTimeout', type: 'function', detail: '(handler: Function, timeout?: number, ...args: any[]) => number', info: '延迟执行函数' },
    { label: 'setInterval', type: 'function', detail: '(handler: Function, timeout?: number, ...args: any[]) => number', info: '定时执行函数' },
    { label: 'clearTimeout', type: 'function', detail: '(id: number) => void', info: '清除延迟执行' },
    { label: 'clearInterval', type: 'function', detail: '(id: number) => void', info: '清除定时执行' },
    { label: 'fetch', type: 'function', detail: '(input: RequestInfo, init?: RequestInit) => Promise<Response>', info: '发起网络请求' },
    { label: 'parseInt', type: 'function', detail: '(string: string, radix?: number) => number', info: '解析整数' },
    { label: 'parseFloat', type: 'function', detail: '(string: string) => number', info: '解析浮点数' },
    { label: 'isNaN', type: 'function', detail: '(value: any) => boolean', info: '判断是否为 NaN' },
    { label: 'isFinite', type: 'function', detail: '(value: any) => boolean', info: '判断是否为有限数' },
    { label: 'encodeURI', type: 'function', detail: '(uri: string) => string', info: '编码 URI' },
    { label: 'decodeURI', type: 'function', detail: '(encodedURI: string) => string', info: '解码 URI' },
    { label: 'encodeURIComponent', type: 'function', detail: '(component: string) => string', info: '编码 URI 组件' },
    { label: 'decodeURIComponent', type: 'function', detail: '(encodedComponent: string) => string', info: '解码 URI 组件' },
    { label: 'atob', type: 'function', detail: '(encodedData: string) => string', info: '解码 Base64' },
    { label: 'btoa', type: 'function', detail: '(stringToEncode: string) => string', info: '编码 Base64' },

    // ==================== 全局值 ====================
    { label: 'NaN', type: 'constant', detail: 'number', info: 'Not-a-Number' },
    { label: 'Infinity', type: 'constant', detail: 'number', info: '无穷大' },
    { label: 'undefined', type: 'constant', detail: 'undefined', info: '未定义' },
    { label: 'globalThis', type: 'class', detail: 'Window | typeof globalThis', info: '全局对象' },

    // ==================== 浏览器专属（有 requires） ====================
    { label: 'document', type: 'class', detail: 'Document', info: '文档对象', requires: ['hasDocument'] },
    { label: 'localStorage', type: 'class', detail: 'Storage', info: '本地存储对象', requires: ['hasLocalStorage'] },
    { label: 'sessionStorage', type: 'class', detail: 'Storage', info: '会话存储对象', requires: ['hasSessionStorage'] },
    { label: 'location', type: 'class', detail: 'Location', info: '位置对象', requires: ['hasWindow'] },
    { label: 'history', type: 'class', detail: 'History', info: '历史记录对象', requires: ['hasWindow'] },
    { label: 'navigator', type: 'class', detail: 'Navigator', info: '浏览器信息对象', requires: ['hasNavigator'] },
    { label: 'screen', type: 'class', detail: 'Screen', info: '屏幕信息对象', requires: ['hasWindow'] },
    { label: 'window', type: 'class', detail: 'Window', info: '浏览器窗口对象', requires: ['hasWindow'] },
    { label: 'self', type: 'class', detail: 'Window', info: '当前窗口的引用', requires: ['hasWindow'] },
    { label: 'top', type: 'class', detail: 'Window', info: '最顶层窗口的引用', requires: ['hasWindow'] },
    { label: 'parent', type: 'class', detail: 'Window', info: '父窗口的引用', requires: ['hasWindow'] },
    { label: 'alert', type: 'function', detail: '(message?: any) => void', info: '警告弹窗', requires: ['hasWindow'] },
    { label: 'confirm', type: 'function', detail: '(message?: string) => boolean', info: '确认弹窗', requires: ['hasWindow'] },
    { label: 'prompt', type: 'function', detail: '(message?: string, defaultValue?: string) => string | null', info: '输入弹窗', requires: ['hasWindow'] },

    // ==================== 条件可用 ====================
    { label: 'crypto', type: 'class', detail: 'Crypto', info: '加密 API', requires: ['hasCrypto'] },
    { label: 'performance', type: 'class', detail: 'Performance', info: '性能 API', requires: ['hasPerformance'] },
    { label: 'Symbol', type: 'class', detail: 'Symbol', info: '符号类型', requires: ['hasSymbol'] },
    { label: 'BigInt', type: 'class', detail: 'BigInt', info: '大整数', requires: ['hasBigInt'] },
    { label: 'Intl', type: 'class', detail: 'Intl', info: '国际化 API', requires: ['hasIntl'] },
    { label: 'Proxy', type: 'class', detail: 'Proxy', info: '代理对象', requires: ['hasProxy'] },
    { label: 'Reflect', type: 'class', detail: 'Reflect', info: '反射 API', requires: ['hasProxy'] },
    { label: 'WebSocket', type: 'class', detail: 'WebSocket', info: 'WebSocket 连接', requires: ['hasWebSocket'] },
    { label: 'EventSource', type: 'class', detail: 'EventSource', info: 'SSE 客户端', requires: ['hasWindow'] },
    { label: 'Worker', type: 'class', detail: 'Worker', info: 'Web Worker', requires: ['hasWorker'] },
    { label: 'File', type: 'class', detail: 'File', info: '文件对象', requires: ['hasFileAPI'] },
    { label: 'FileReader', type: 'class', detail: 'FileReader', info: '文件读取器', requires: ['hasFileAPI'] },
    { label: 'Blob', type: 'class', detail: 'Blob', info: '二进制大对象', requires: ['hasFileAPI'] },
    { label: 'URL', type: 'class', detail: 'URL', info: 'URL 对象', requires: ['hasWindow'] },
    { label: 'URLSearchParams', type: 'class', detail: 'URLSearchParams', info: 'URL 查询参数', requires: ['hasWindow'] },
    { label: 'FormData', type: 'class', detail: 'FormData', info: '表单数据', requires: ['hasWindow'] },
    { label: 'IntersectionObserver', type: 'class', detail: 'IntersectionObserver', info: '交叉观察器', requires: ['hasIntersectionObserver'] },
    { label: 'MutationObserver', type: 'class', detail: 'MutationObserver', info: '突变观察器', requires: ['hasMutationObserver'] },
    { label: 'ResizeObserver', type: 'class', detail: 'ResizeObserver', info: '尺寸观察器', requires: ['hasResizeObserver'] },
    { label: 'AbortController', type: 'class', detail: 'AbortController', info: '中止控制器', requires: ['hasAbortController'] },
    { label: 'ReadableStream', type: 'class', detail: 'ReadableStream', info: '可读流', requires: ['hasReadableStream'] },
    { label: 'WritableStream', type: 'class', detail: 'WritableStream', info: '可写流', requires: ['hasReadableStream'] },
    { label: 'BroadcastChannel', type: 'class', detail: 'BroadcastChannel', info: '广播通道', requires: ['hasBroadcastChannel'] },
    { label: 'Notification', type: 'class', detail: 'Notification', info: '通知 API', requires: ['hasNotification'] },
    { label: 'Clipboard', type: 'class', detail: 'Clipboard', info: '剪贴板 API', requires: ['hasClipboard'] },
    { label: 'scheduler', type: 'class', detail: 'Scheduler', info: '调度器', requires: ['hasScheduler'] },
    { label: 'queueMicrotask', type: 'function', detail: '(callback: Function) => void', info: '添加微任务' },

    // Node.js 全局
    { label: 'process', type: 'class', detail: 'Process', info: 'Node.js 进程对象', requires: ['type:node'] },
    { label: 'Buffer', type: 'class', detail: 'Buffer', info: 'Node.js Buffer 类', requires: ['type:node'] },
    { label: 'global', type: 'class', detail: 'typeof global', info: 'Node.js 全局对象', requires: ['type:node'] },
    { label: '__dirname', type: 'variable', detail: 'string', info: '当前目录路径', requires: ['type:node'] },
    { label: '__filename', type: 'variable', detail: 'string', info: '当前文件路径', requires: ['type:node'] },
    { label: 'require', type: 'function', detail: '(id: string) => any', info: 'Node.js require 函数', requires: ['type:node'] },
    { label: 'module', type: 'class', detail: 'Module', info: 'Node.js 模块对象', requires: ['type:node'] },
    { label: 'exports', type: 'class', detail: 'object', info: 'Node.js 导出对象', requires: ['type:node'] },
];
```

---

## 总结

至此，整个代码补全系统已经重构完成。核心改进点：

### 架构改进

1. **模块化拆分**：按功能拆分为核心模块（环境、缓存、优先级）、数据模块、源模块、解析器模块和工具模块
2. **环境感知**：根据运行环境动态加载/过滤补全数据
3. **优先级机制**：用户自定义 > 预定义内置 > 运行时解析 > 兜底扫描

### Window 对象处理

- `window.xxx` 自动映射到 `xxx` 的预定义补全数据，**不重复维护**
- 如果所有源都没有结果，window 兜底源会扫描运行时属性
- 已知对象不会在兜底中重复出现

### 新增功能

- **原型链补全**：`[].xxx`、`"".xxx` 等字面量
- **链式调用推断**：`document.querySelector().xxx`
- **智能缓存**：TTL + 依赖 + LRU 淘汰
- **环境检测**：浏览器/Node/Worker/SSR

### 使用方式

```javascript
import { getAutocompletionConfig } from './completion/index';

const completionConfig = getAutocompletionConfig({
    customCompletions: [
        { 
            label: 'myApp', 
            type: 'class', 
            detail: 'Application', 
            info: '自定义应用对象' 
        }
    ],
    customObjects: {
        api: window.myAPI  // 运行时对象
    },
    customSignatures: {
        'api.request': { 
            type: 'function', 
            detail: '(url: string, options?: RequestOptions) => Promise<Response>',
            info: '发送 API 请求'
        }
    }
});

// 在 CodeMirror 中使用
// { extensions: [autocompletion(completionConfig)] }
```