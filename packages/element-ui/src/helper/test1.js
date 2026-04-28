/**
 * ==================== 1. 函数签名解析工具 ====================
 */

/**
 * 解析函数的参数签名
 * @param {Function} fn - 函数对象
 * @returns {string} 参数签名字符串
 */
function parseFunctionSignature(fn) {
    if (typeof fn !== 'function') return '(...) => unknown';

    const fnStr = fn.toString();

    // 处理普通函数: function name(a, b) { ... }
    let match = fnStr.match(/function\s*\(([^)]*)\)/);
    if (match) {
        const params = match[1].trim();
        return `(${params}) => any`;
    }

    // 处理箭头函数: (a, b) => ...
    match = fnStr.match(/^\(?([^)=]*)\)?\s*=>/);
    if (match) {
        let params = match[1].trim();
        if (params && !params.includes('(') && params !== '') {
            params = `(${params})`;
        }
        return `${params || '()'} => any`;
    }

    // 处理方法定义: method(a, b) { ... }
    match = fnStr.match(/^[\w$]+\s*\(([^)]*)\)/);
    if (match) {
        const params = match[1].trim();
        return `(${params}) => any`;
    }

    return '(...) => unknown';
}

/**
 * 尝试推断函数的返回值类型
 */
function inferReturnType(fn) {
    if (typeof fn !== 'function') return 'unknown';

    const fnStr = fn.toString();
    const isAsync = fnStr.startsWith('async') || /async\s+function/.test(fnStr);

    // 常见返回值模式
    if (fnStr.includes('return Promise')) return isAsync ? 'Promise<any>' : 'Promise<any>';
    if (fnStr.includes('return new Promise')) return 'Promise<T>';
    if (fnStr.includes('return []')) return 'Array<T>';
    if (fnStr.includes('return {}')) return 'object';
    if (fnStr.includes('return ""') || fnStr.includes("return ''")) return 'string';
    if (fnStr.match(/return\s+[0-9]+/)) return 'number';
    if (fnStr.includes('return true') || fnStr.includes('return false')) return 'boolean';
    if (fnStr.includes('return null')) return 'null';

    return isAsync ? 'Promise<T>' : 'any';
}

/**
 * 获取函数的完整签名
 */
function getFunctionSignature(fn) {
    if (typeof fn !== 'function') return null;
    const params = parseFunctionSignature(fn);
    const returns = inferReturnType(fn);
    return params.replace('=> any', `=> ${returns}`);
}

/**
 * ==================== 2. 用户自定义补全源（最高优先级）====================
 */

/**
 * 创建用户自定义补全源
 * @param {Array} customCompletions - 用户自定义的补全项
 * @returns {Function} 补全源函数
 */
export function createCustomCompletionSource(customCompletions) {
    return (context) => {
        const before = context.matchBefore(/\w*\.?\w*/);
        if (!before || (before.from === before.to && !context.explicit)) return null;

        const text = before.text;
        const parts = text.split('.');
        const currentPart = parts[parts.length - 1] || '';

        // 支持对象属性访问: obj.prop
        if (parts.length > 1) {
            const objPath = parts.slice(0, -1).join('.');
            const matched = customCompletions.filter(comp => {
                if (!comp.path) return false;
                return comp.path === objPath && comp.label.toLowerCase().startsWith(currentPart.toLowerCase());
            });

            if (matched.length > 0) {
                return {
                    from: before.from,
                    options: matched.map(comp => ({
                        label: comp.label,
                        type: comp.type || 'variable',
                        detail: comp.detail || '',
                        info: comp.info || '',
                        boost: 1000
                    })),
                    validFor: /^\w*$/
                };
            }
        }

        // 全局补全
        const matched = customCompletions.filter(comp =>
            !comp.path && comp.label.toLowerCase().startsWith(currentPart.toLowerCase())
        );

        if (matched.length > 0) {
            return {
                from: before.from,
                options: matched.map(comp => ({
                    label: comp.label,
                    type: comp.type || 'variable',
                    detail: comp.detail || '',
                    info: comp.info || '',
                    boost: 1000
                })),
                validFor: /^\w*$/
            };
        }

        return null;
    };
}

/**
 * ==================== 3. 智能对象属性补全源（分析真实对象）====================
 */

/**
 * 从真实对象动态获取属性（带函数签名）
 */
function getDynamicObjectProperties(obj, objName) {
    if (!obj || typeof obj !== 'object') return [];

    const props = [];
    const seen = new Set();

    try {
        // 获取自身属性
        const propNames = Object.getOwnPropertyNames(obj);

        for (const prop of propNames) {
            if (seen.has(prop)) continue;
            if (prop.startsWith('_') || prop === 'constructor' || prop === '__proto__') continue;
            seen.add(prop);

            try {
                const value = obj[prop];

                if (typeof value === 'function') {
                    const signature = getFunctionSignature(value);
                    props.push({
                        label: prop,
                        type: 'function',
                        detail: signature || 'function',
                        info: `${objName}.${prop} 方法`,
                        boost: 50
                    });
                } else if (value && typeof value === 'object') {
                    const propCount = Object.keys(value).length;
                    props.push({
                        label: prop,
                        type: 'class',
                        detail: `{${propCount}}`,
                        info: `${objName}.${prop} - 包含 ${propCount} 个属性`,
                        boost: 30
                    });
                } else {
                    props.push({
                        label: prop,
                        type: typeof value === 'number' ? 'constant' : 'variable',
                        detail: String(value),
                        info: `${objName}.${prop} = ${String(value).substring(0, 50)}`,
                        boost: 20
                    });
                }
            } catch (e) {}
        }

        // 获取原型链属性
        let proto = Object.getPrototypeOf(obj);
        while (proto && proto !== Object.prototype) {
            const protoProps = Object.getOwnPropertyNames(proto);
            for (const prop of protoProps) {
                if (seen.has(prop)) continue;
                if (prop.startsWith('_') || prop === 'constructor') continue;
                seen.add(prop);

                try {
                    const value = proto[prop];
                    if (typeof value === 'function') {
                        const signature = getFunctionSignature(value);
                        props.push({
                            label: prop,
                            type: 'function',
                            detail: signature || 'function',
                            info: `${objName}.${prop} 方法（继承）`,
                            boost: 40
                        });
                    }
                } catch (e) {}
            }
            proto = Object.getPrototypeOf(proto);
        }
    } catch (e) {
        console.warn(`获取 ${objName} 属性失败:`, e);
    }

    return props.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * 创建智能对象属性补全源
 * 支持：用户自定义对象、window 对象、动态解析的全局对象
 * @param {Object} options - 配置选项
 * @returns {Function} 补全源函数
 */
export function createSmartObjectCompletionSource(options = {}) {
    const {
        customObjects = {},      // 用户自定义的对象 { objName: realObject }
        customSignatures = {}     // 用户自定义的函数签名 { 'obj.method': { params, returns, description } }
    } = options;

    return (context) => {
        const cursor = context.pos;

        // 查找光标前的对象属性访问
        let before = context.state.sliceDoc(Math.max(0, cursor - 200), cursor);
        let match = before.match(/([\w$.]+)\.(\w*)$/);

        if (!match) return null;

        let [, objectPath, partialProp] = match;
        const objectName = objectPath.split('.').pop();

        // ========== 优先级1: 检查用户自定义的对象 ==========
        if (customObjects[objectName]) {
            const realObj = customObjects[objectName];
            let completions = getDynamicObjectProperties(realObj, objectName);

            // 应用用户自定义签名覆盖
            completions = completions.map(comp => {
                const key = `${objectName}.${comp.label}`;
                if (customSignatures[key]) {
                    return {
                        ...comp,
                        detail: customSignatures[key].detail || comp.detail,
                        info: customSignatures[key].info || comp.info
                    };
                }
                return comp;
            });

            if (partialProp) {
                completions = completions.filter(c =>
                    c.label.toLowerCase().startsWith(partialProp.toLowerCase())
                );
            }

            if (completions.length > 0) {
                return {
                    from: cursor - partialProp.length,
                    options: completions,
                    validFor: /^\w*$/
                };
            }
        }

        // ========== 优先级2: 尝试从 window 获取真实对象 ==========
        let realObject = null;
        try {
            if (typeof window !== 'undefined' && window[objectName]) {
                realObject = window[objectName];
            } else if (typeof globalThis !== 'undefined' && globalThis[objectName]) {
                realObject = globalThis[objectName];
            }
        } catch (e) {}

        if (realObject) {
            let completions = getDynamicObjectProperties(realObject, objectName);

            // 应用用户自定义签名覆盖
            completions = completions.map(comp => {
                const key = `${objectName}.${comp.label}`;
                if (customSignatures[key]) {
                    return {
                        ...comp,
                        detail: customSignatures[key].detail || comp.detail,
                        info: customSignatures[key].info || comp.info
                    };
                }
                return comp;
            });

            if (partialProp) {
                completions = completions.filter(c =>
                    c.label.toLowerCase().startsWith(partialProp.toLowerCase())
                );
            }

            if (completions.length > 0) {
                return {
                    from: cursor - partialProp.length,
                    options: completions,
                    validFor: /^\w*$/
                };
            }
        }

        return null;
    };
}

/**
 * ==================== 4. window 全局变量补全源 ====================
 */

/**
 * 创建 window 全局变量补全源
 */
export function createWindowCompletionSource(scope = typeof window !== 'undefined' ? window : null) {
    if (!scope) return () => null;

    // 缓存全局补全项，避免重复扫描
    let cachedCompletions = null;

    function getWindowCompletions() {
        if (cachedCompletions) return cachedCompletions;

        const completions = [];
        const seen = new Set();

        try {
            const propNames = Object.getOwnPropertyNames(scope);

            for (const prop of propNames) {
                if (seen.has(prop)) continue;
                if (prop.startsWith('_')) continue;
                if (['window', 'globalThis', 'self', 'top', 'parent'].includes(prop)) continue;
                seen.add(prop);

                try {
                    const value = scope[prop];

                    if (typeof value === 'function') {
                        const signature = getFunctionSignature(value);
                        completions.push({
                            label: prop,
                            type: 'function',
                            detail: signature || 'function',
                            info: `全局函数 ${prop}`,
                            boost: 100
                        });
                    } else if (value && typeof value === 'object') {
                        const propCount = Object.keys(value).length;
                        completions.push({
                            label: prop,
                            type: 'class',
                            detail: `{${propCount}}`,
                            info: `全局对象 ${prop}`,
                            boost: 80
                        });
                    } else {
                        completions.push({
                            label: prop,
                            type: 'variable',
                            detail: String(value),
                            info: `全局变量 ${prop}`,
                            boost: 60
                        });
                    }
                } catch (e) {}
            }
        } catch (e) {
            console.warn('获取 window 属性失败:', e);
        }

        // 添加常见内置对象（兜底）
        const builtins = ['Math', 'console', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet'];
        for (const name of builtins) {
            if (!seen.has(name)) {
                completions.push({
                    label: name,
                    type: 'class',
                    detail: 'object',
                    info: `${name} 内置对象`,
                    boost: 90
                });
            }
        }

        completions.sort((a, b) => a.label.localeCompare(b.label));
        cachedCompletions = completions;
        return completions;
    }

    return (context) => {
        const before = context.matchBefore(/\w*/);
        if (!before || (before.from === before.to && !context.explicit)) return null;

        const word = before.text;
        const completions = getWindowCompletions();
        const matched = completions.filter(c =>
            c.label.toLowerCase().startsWith(word.toLowerCase())
        );

        if (matched.length === 0) return null;

        return {
            from: before.from,
            options: matched,
            validFor: /^\w*$/
        };
    };
}

/**
 * ==================== 5. 合并补全源（优先级控制）====================
 */

/**
 * 合并多个补全源，按优先级返回第一个有结果的
 * @param {Array} sources - 补全源数组（按优先级从高到低排列）
 * @returns {Function} 合并后的补全源
 */
export function mergeCompletionSources(sources) {
    return async (context) => {
        for (const source of sources) {
            try {
                const result = await source(context);
                if (result && result.options && result.options.length > 0) {
                    return result;
                }
            } catch (error) {
                console.warn('补全源执行失败:', error);
            }
        }
        return null;
    };
}

/**
 * ==================== 6. 主配置函数 ====================
 */

/**
 * 创建完整的 JavaScript 补全配置
 * @param {Object} config - 配置对象
 * @param {Array} config.customCompletions - 用户自定义补全项 [{ label, type, detail, info, path? }]
 * @param {Object} config.customObjects - 用户自定义的对象 { objName: realObject }
 * @param {Object} config.customSignatures - 用户自定义的函数签名 { 'obj.method': { detail, info } }
 * @param {boolean} config.includeWindow - 是否包含 window 对象，默认 true
 * @param {Object} config.windowScope - window 作用域，默认 window
 * @returns {Array} 补全源数组
 */
export function setupJavaScriptCompletions(config = {}) {
    const {
        customCompletions = [],
        customObjects = {},
        customSignatures = {},
        includeWindow = true,
        windowScope = typeof window !== 'undefined' ? window : null
    } = config;

    const sources = [];

    // 优先级1: 用户自定义补全项（最高优先级）
    if (customCompletions.length > 0) {
        sources.push(createCustomCompletionSource(customCompletions));
    }

    // 优先级2: 智能对象属性补全（支持自定义对象 + window 属性）
    if (Object.keys(customObjects).length > 0 || Object.keys(customSignatures).length > 0) {
        sources.push(createSmartObjectCompletionSource({
            customObjects,
            customSignatures
        }));
    }

    // 优先级3: 智能对象属性补全（仅 window 属性）
    if (includeWindow && windowScope) {
        sources.push(createSmartObjectCompletionSource({
            customObjects: {},
            customSignatures
        }));
    }

    // 优先级4: window 全局变量补全（兜底）
    if (includeWindow && windowScope) {
        sources.push(createWindowCompletionSource(windowScope));
    }

    // 返回合并后的补全源（按优先级顺序，第一个匹配到的返回）
    return mergeCompletionSources(sources);
}

/**
 * 简化的配置：直接返回 autocompletion 的配置对象
 */
export function getAutocompletionConfig(config = {}) {
    const source = setupJavaScriptCompletions(config);

    return {
        activateOnTyping: true,
        defaultKeymap: true,
        override: [source]
    };
}