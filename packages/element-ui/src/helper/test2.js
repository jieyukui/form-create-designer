import {builtinCompletions, globalCompletions} from '../constants/index';
/**
 * ==================== 1. 函数签名解析工具 ====================
 */

function parseFunctionSignature(fn) {
    if (typeof fn !== 'function') return '(...) => unknown';

    const fnStr = fn.toString();

    let match = fnStr.match(/function\s*\(([^)]*)\)/);
    if (match) {
        const params = match[1].trim();
        return `(${params}) => any`;
    }

    match = fnStr.match(/^\(?([^)=]*)\)?\s*=>/);
    if (match) {
        let params = match[1].trim();
        if (params && !params.includes('(') && params !== '') {
            params = `(${params})`;
        }
        return `${params || '()'} => any`;
    }

    match = fnStr.match(/^[\w$]+\s*\(([^)]*)\)/);
    if (match) {
        const params = match[1].trim();
        return `(${params}) => any`;
    }

    return '(...) => unknown';
}

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

    return isAsync ? 'Promise<T>' : 'any';
}

function getFunctionSignature(fn) {
    if (typeof fn !== 'function') return null;
    const params = parseFunctionSignature(fn);
    const returns = inferReturnType(fn);
    return params.replace('=> any', `=> ${returns}`);
}

/**
 * ==================== 3. 对象属性补全源 ====================
 */

/**
 * 创建对象属性补全源（支持内置对象和自定义对象）
 */
export function createObjectPropertyCompletionSource(customObjects = {}, customSignatures = {}) {
    return (context) => {
        const cursor = context.pos;

        // 获取光标前的文本，检测是否在对象属性访问中
        const line = context.state.sliceDoc(Math.max(0, cursor - 200), cursor);

        // 匹配 对象名.部分属性名
        const match = line.match(/([\w$]+)\.([\w$]*)$/);

        if (!match) return null;

        const [, objectName, partialProp] = match;

        // 1. 优先使用内置对象的预定义补全
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

        // 2. 用户自定义对象
        if (customObjects[objectName]) {
            const obj = customObjects[objectName];
            const completions = [];

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

        return null;
    };
}

/**
 * ==================== 4. 全局变量补全源 ====================
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
 * ==================== 5. 合并补全源（按优先级）====================
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

export function setupJavaScriptCompletions(config = {}) {
    const {
        customCompletions = [],
        customObjects = {},
        customSignatures = {}
    } = config;

    const sources = [];

    // 优先级1: 全局变量补全
    sources.push(createGlobalCompletionSource(customCompletions));

    // 优先级2: 对象属性补全
    sources.push(createObjectPropertyCompletionSource(customObjects, customSignatures));

    return mergeCompletionSources(sources);
}

export function getAutocompletionConfig(config = {}) {
    const source = setupJavaScriptCompletions(config);

    return {
        activateOnTyping: true,
        defaultKeymap: true,
        override: [source]
    };
}