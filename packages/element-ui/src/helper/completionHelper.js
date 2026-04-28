import {builtinCompletions, globalCompletions} from '../constants/index';
import {scopeCompletionSource} from '@codemirror/lang-javascript';

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
 * 获取函数签名
 * @param fn
 * @returns {string|null}
 */
function getFunctionSignature(fn) {
    if (typeof fn !== 'function') return null;
    const params = parseFunctionSignature(fn);
    const returns = inferReturnType(fn);
    return params.replace('=> any', `=> ${returns}`);
}

/**
 * 尝试推断函数的返回值类型
 * @param {Function} fn - 函数对象
 * @returns {string} 返回值类型
 */
function inferReturnType(fn) {
    if (typeof fn !== 'function') return 'unknown';

    const fnStr = fn.toString();
    const isAsync = fnStr.startsWith('async') || /async\s+function/.test(fnStr);

    if (fnStr.includes('return Promise')) return isAsync ? 'Promise<any>' : 'Promise<any>';
    if (fnStr.includes('return new Promise')) return 'Promise<T>';
    if (fnStr.includes('return []')) return 'Array<T>';
    if (fnStr.includes('return {}')) return 'object';
    if (fnStr.includes('return ""') || fnStr.includes('return \'\'')) return 'string';
    if (fnStr.match(/return\s+[0-9]+/)) return 'number';
    if (fnStr.includes('return true') || fnStr.includes('return false')) return 'boolean';
    if (fnStr.includes('return null')) return 'null';
    if (fnStr.includes('return undefined')) return 'undefined';

    // 尝试从函数体中找到 return 语句
    const returnMatch = fnStr.match(/return\s+([^;\n]+)/);
    if (returnMatch) {
        const returnExpr = returnMatch[1].trim();
        if (returnExpr === 'this') return 'this';
        if (returnExpr.match(/^new\s+\w+/)) return returnExpr.split(' ')[1];
        if (returnExpr.match(/^\[\]/)) return 'Array';
        if (returnExpr.match(/^\{\}/)) return 'object';
    }

    return isAsync ? 'Promise<T>' : 'any';
}

/**
 * 创建对象属性补全源（支持内置对象和自定义对象）
 * @param options
 */
export function createObjectPropertyCompletionSource(options = {}) {
    const {
        customBuiltinCompletions = {},
        customObjects = {},
        customSignatures = {}
    } = options;
    return (context) => {
        const cursor = context.pos;

        // 获取光标前的文本，检测是否在对象属性访问中
        const line = context.state.sliceDoc(Math.max(0, cursor - 200), cursor);

        // 匹配 对象名.部分属性名
        const match = line.match(/([\w$]+)\.([\w$]*)$/);

        if (!match) return null;

        const [, objectName, partialProp] = match;

        // 1. 使用用户自定义内置对象的预定义补全
        if (customBuiltinCompletions[objectName]) {
            let completions = [...customBuiltinCompletions[objectName]];

            // 应用自定义签名覆盖
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

            // 过滤
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

        // 2. 用户自定义对象
        if (customObjects[objectName]) {
            const obj = customObjects[objectName];
            let completions = [];

            // 扫描对象的属性
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                const keyName = `${objectName}.${key}`;

                // 检查是否有自定义签名
                if (customSignatures[keyName]) {
                    completions.push({
                        label: key,
                        type: customSignatures[keyName].type || 'variable',
                        detail: customSignatures[keyName].detail || '',
                        info: customSignatures[keyName].info || ''
                    });
                } else if (typeof value === 'function') {
                    const signature = getFunctionSignature(value);
                    completions.push({
                        label: key,
                        type: 'function',
                        detail: signature || 'function',
                        info: `${objectName}.${key} 方法`
                    });
                } else {
                    completions.push({
                        label: key,
                        type: typeof value === 'object' ? 'class' : 'variable',
                        detail: typeof value,
                        info: `${objectName}.${key} = ${JSON.stringify(value)}`
                    });
                }
            }

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

        // 3. 使用内置对象的预定义补全
        if (builtinCompletions[objectName]) {
            let completions = [...builtinCompletions[objectName]];

            // 应用自定义签名覆盖
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

            // 过滤
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
 * 创建全局变量补全源（支持函数签名）
 * @param customCompletions
 */
export function createGlobalCompletionSource(customCompletions = []) {
    // 合并内置全局和自定义全局
    const allGlobals = [...globalCompletions];

    // 添加自定义全局补全
    for (const comp of customCompletions) {
        if (!comp.path && !allGlobals.some(g => g.label === comp.label)) {
            allGlobals.push(comp);
        }
    }

    return (context) => {
        const before = context.matchBefore(/\w*/);
        if (!before || (before.from === before.to && !context.explicit)) return null;

        const word = before.text;
        const matched = allGlobals.filter(c =>
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
 * 合并补全源（按优先级）
 * @param sources
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
 * 创建完整的 JavaScript 补全配置（支持函数签名和返回值）
 * @param options
 */
export function setupJavaScriptCompletions(options = {}) {
    const {
        customCompletions = [],
        includeWindow = true,
    } = options;
    const windowScope = typeof window !== 'undefined' ? window : null
    const sources = [];

    // // 优先级1: 全局变量补全
    // sources.push(createGlobalCompletionSource(customCompletions));
    //
    // // 优先级2: 对象属性补全
    // sources.push(createObjectPropertyCompletionSource(options));

    // 优先级3: window 全局变量补全（兜底）
    if (includeWindow && windowScope) {
        // 关键！自动补全所有浏览器全局 API
        sources.push(scopeCompletionSource(windowScope));
    }

    // 返回合并后的补全源（按优先级顺序，第一个匹配到的返回）
    return mergeCompletionSources(sources);
}

/**
 * 简化的配置：直接返回 autocompletion 的配置对象
 * @param {Object} options - 选项对象
 * @param {Array} options.customCompletions - 用户自定义补全项 [{ label, type, detail, info, path? }]
 * @param {Object} options.customBuiltinCompletions 自定义对象属性补全（输入 对象名. 时弹出的补全）
 * @param {Object} options.customObjects - 用户自定义的对象 { objName: realObject }
 * @param {Object} options.customSignatures - 用户自定义的函数签名 { 'obj.method': { detail, info } }
 * @param {boolean} options.includeWindow - 是否包含 window 对象，默认 true
 */
export function getAutocompletionConfig(options = {}) {
    const source = setupJavaScriptCompletions(options);

    return {
        activateOnTyping: true,
        defaultKeymap: true,
        override: [source]
    };
}