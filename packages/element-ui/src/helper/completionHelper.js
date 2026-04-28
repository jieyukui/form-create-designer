import {scopeCompletionSource} from '@codemirror/lang-javascript';
import {defaultJavaScriptCompletions} from '../constants';

/**
 * 获取函数的参数签名
 * @param {Function} fn - 函数对象
 * @returns {string} 参数签名字符串，如 "(a, b)"
 */
function getFunctionSignature(fn) {
    if (typeof fn !== 'function') return '';
    const fnStr = fn.toString();
    const match = fnStr.match(/\([^)]*\)/);
    if (match) return match[0];

    // 箭头函数处理
    const arrowMatch = fnStr.match(/^[^(]*\(?([^)]*)\)?\s*=>/);
    if (arrowMatch) {
        const params = arrowMatch[1] || '';
        return params ? `(${params.trim()})` : '()';
    }
    return '(...)';
}

/**
 * 获取值的类型描述
 * @param {any} value - 任意值
 * @returns {string} 类型描述
 */
function getValueType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return 'function';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
}

/**
 * 获取属性的详细信息
 * @param {string} propName - 属性名
 * @param {any} propValue - 属性值
 * @param {Object} customInfoMap - 自定义信息映射
 * @returns {Object} { info, detail }
 */
function getPropertyInfo(propName, propValue, customInfoMap = {}) {
    // 优先使用自定义信息
    if (customInfoMap[propName]) {
        return customInfoMap[propName];
    }

    const type = getValueType(propValue);
    let info = '';
    let detail = '';

    switch (type) {
    case 'function':
        const signature = getFunctionSignature(propValue);
        detail = signature;
        info = `方法${signature}`;
        break;
    case 'object':
        const propCount = propValue ? Object.keys(propValue).length : 0;
        detail = `{${propCount}}`;
        info = `对象，包含 ${propCount} 个属性`;
        break;
    case 'array':
        const len = propValue ? propValue.length : 0;
        detail = `[${len}]`;
        info = `数组，长度 ${len}`;
        break;
    case 'string':
        detail = `"${String(propValue).substring(0, 30)}${String(propValue).length > 30 ? '...' : ''}"`;
        info = `字符串值: ${detail}`;
        break;
    case 'number':
        detail = String(propValue);
        info = `数字: ${detail}`;
        break;
    case 'boolean':
        detail = String(propValue);
        info = `布尔值: ${detail}`;
        break;
    default:
        detail = type;
        info = `类型: ${type}`;
    }

    return {info, detail};
}

/**
 * 为 scopeCompletionSource 的结果添加 info 字段
 * @param {Object} scope - 作用域对象，如 window
 * @param {Object} options - 配置选项
 * @param {Object} options.customInfoMap - 自定义信息映射 { propName: { info: '...', detail: '...' } }
 * @param {Array} options.includeProps - 要包含的属性名列表（白名单），不设置则包含所有可枚举属性
 * @param {Array} options.excludeProps - 要排除的属性名列表（黑名单）
 * @param {number} options.maxProps - 最大属性数量限制，默认 500
 * @returns {Function} 增强后的补全源函数
 */
export function createEnhancedScopeCompletion(scope, options = {}) {
    const {
        customInfoMap = {},
        includeProps = null,
        excludeProps = ['then', 'catch', 'finally', 'constructor', '__proto__', 'toString', 'valueOf'],
        maxProps = 500
    } = options;

    // 获取原始的 scopeCompletionSource
    const originalSource = scopeCompletionSource(scope);

    return (context) => {
        const result = originalSource(context);
        if (!result) return null;

        // 过滤和增强补全项
        let enhancedOptions = result.options;

        // 应用白/黑名单过滤
        if (includeProps && Array.isArray(includeProps)) {
            enhancedOptions = enhancedOptions.filter(opt => includeProps.includes(opt.label));
        } else if (excludeProps && Array.isArray(excludeProps)) {
            enhancedOptions = enhancedOptions.filter(opt => !excludeProps.includes(opt.label));
        }

        // 限制数量
        if (enhancedOptions.length > maxProps) {
            enhancedOptions = enhancedOptions.slice(0, maxProps);
        }

        // 为每个选项添加增强信息
        enhancedOptions = enhancedOptions.map(option => {
            const propValue = scope[option.label];
            const {info, detail} = getPropertyInfo(option.label, propValue, customInfoMap);

            return {
                ...option,
                info: customInfoMap[option.label]?.info || info,
                detail: customInfoMap[option.label]?.detail || detail || option.detail
            };
        });

        return {
            ...result,
            options: enhancedOptions
        };
    };
}

/**
 * 创建自定义补全源（带 info 提示）
 * @param {Array} completions - 补全项数组
 * @param {Array} completions[].label - 显示的文本
 * @param {string} completions[].type - 类型: keyword, variable, function, class, constant, property
 * @param {string} completions[].info - 详细说明（HTML 支持）
 * @param {string} completions[].detail - 右侧详情
 * @param {Function} completions[].apply - 插入时的处理函数
 * @returns {Function} 补全源函数
 */
export function createCustomCompletionSource(completions) {
    return (context) => {
        // 获取光标前的文本
        let before = context.matchBefore(/\w*\.?\w*/);
        if (!before || (before.from === before.to && !context.explicit)) return null;

        // 支持点操作符路径匹配
        const text = before.text;
        const parts = text.split('.');
        const currentPart = parts[parts.length - 1] || '';

        // 处理对象属性补全
        if (parts.length > 1) {
            const objPath = parts.slice(0, -1).join('.');
            // 可以根据 objPath 动态过滤出对象下的属性
            const filtered = completions.filter(comp =>
                comp.label.startsWith(objPath + '.') &&
                comp.label.split('.')[parts.length - 1].startsWith(currentPart)
            );

            if (filtered.length > 0) {
                return {
                    from: before.from,
                    options: filtered.map(comp => ({
                        ...comp,
                        label: comp.label.split('.').pop()
                    })),
                    validFor: /^\w*$/
                };
            }
        }

        // 普通补全
        const matched = completions.filter(comp =>
            comp.label.toLowerCase().startsWith(currentPart.toLowerCase())
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
 * 合并多个补全源
 * @param {Array} sources - 补全源函数数组
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
 * 创建完整的 JavaScript 补全配置
 * @param {Object} config - 配置对象
 * @param {Object} config.scope - 作用域对象，如 window
 * @param {Array} config.customCompletions - 自定义补全项
 * @param {Object} config.customInfoMap - 自定义信息映射
 * @param {Array} config.includeProps - 要包含的属性白名单
 * @param {Array} config.excludeProps - 要排除的属性黑名单
 * @returns {Object} { override, sources }
 */
export function createJavaScriptCompletionConfig(config = {}) {
    const {
        scope = null,
        customCompletions = [],
        customInfoMap = {},
        includeProps = null,
        excludeProps = ['then', 'catch', 'finally', 'constructor', '__proto__']
    } = config;

    const sources = [];

    // 添加自定义补全源
    if (customCompletions.length > 0) {
        sources.push(createCustomCompletionSource(customCompletions));
    }

    // 添加作用域补全源
    if (scope) {
        sources.push(createEnhancedScopeCompletion(scope, {
            customInfoMap,
            includeProps,
            excludeProps
        }));
    }

    // 返回配置
    return {
        override: sources,
        sources: sources,
        // 便捷的 autocompletion 配置
        autocompletionOptions: {
            activateOnTyping: true,
            defaultKeymap: true,
            override: sources.length > 0 ? sources : undefined
        }
    };
}

// ==================== 使用示例 ====================

/**
 * 快速创建完整的 JavaScript 补全配置（推荐使用）
 * @param {Object} options - 配置选项
 * @param {Object} options.scope - 作用域对象，如 window
 * @param {Array} options.extraCompletions - 额外的自定义补全项
 * @param {Object} options.customInfoMap - 自定义信息映射
 * @returns {Object} autocompletion 的配置对象
 */
export function setupJavaScriptAutocompletion(options = {}) {
    const {
        scope = typeof window !== 'undefined' ? window : null,
        extraCompletions = [],
        customInfoMap = {}
    } = options;

    // 合并所有自定义补全项
    const allCustomCompletions = [
        ...defaultJavaScriptCompletions,
        ...extraCompletions
    ];

    // 创建补全配置
    const config = createJavaScriptCompletionConfig({
        scope,
        customCompletions: allCustomCompletions,
        customInfoMap,
        excludeProps: ['then', 'catch', 'finally', 'constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf']
    });

    return {
        activateOnTyping: true,
        defaultKeymap: true,
        override: config.override
    };
}