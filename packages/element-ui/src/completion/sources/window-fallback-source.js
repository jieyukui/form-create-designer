import {getWindowScope} from '../core/environment';
import {parseFunctionSignature} from '../resolvers/signature-parser';
import {Priority} from '../core/priority';
import {globalCompletionCache} from '../core/cache';

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
                            } catch (e) {
                            }

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