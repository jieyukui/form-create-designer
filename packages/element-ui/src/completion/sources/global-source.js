import {globalCompletions} from '../data/globals';
import {Priority} from '../core/priority';

/**
 * 创建全局变量补全源
 *
 * 处理直接使用的全局变量/函数，如：
 * - Math
 * - console
 * - fetch
 * - parseInt
 * - document
 * - localStorage
 *
 * 同时也作为 window.xxx 的数据源（通过 alias 机制）
 *
 * @param {Object} options
 * @param {Array} options.customCompletions - 用户自定义全局补全
 * @param {Object} options.customObjects - 用户自定义对象
 * @param {Object} options.environment - 环境检测结果
 * @returns {Function} 补全源函数
 */
export function createGlobalCompletionSource(options = {}) {
    const {
        customCompletions = [],
        customObjects = {},
        environment
    } = options;

    // 构建完整的全局补全列表
    let allGlobals = [...globalCompletions];

    // 添加用户自定义的全局补全（没有 path 的）
    for (const comp of customCompletions) {
        if (!comp.path && !allGlobals.some(g => g.label === comp.label)) {
            allGlobals.push({
                label: comp.label,
                type: comp.type || 'variable',
                detail: comp.detail || '',
                info: comp.info || '',
                priority: Priority.USER_CUSTOM_GLOBAL,
                boost: 100 // 给自定义项更高的 boost
            });
        }
    }

    // 添加用户自定义对象作为全局变量
    for (const name of Object.keys(customObjects)) {
        if (!allGlobals.some(g => g.label === name)) {
            allGlobals.push({
                label: name,
                type: 'class',
                detail: 'object',
                info: `用户自定义对象: ${name}`,
                priority: Priority.USER_CUSTOM_OBJECT,
                boost: 95
            });
        }
    }

    // 根据环境过滤掉不可用的全局变量
    if (environment) {
        allGlobals = allGlobals.filter(g => {
            // 检查 requires
            if (g.requires) {
                return g.requires.every(req => environment[req] === true);
            }
            return true;
        });
    }

    // 去重（按 label，保留优先级最高的）
    const seen = new Map();
    for (const g of allGlobals) {
        const existing = seen.get(g.label);
        if (!existing || (g.priority || 0) > (existing.priority || 0)) {
            seen.set(g.label, g);
        }
    }
    allGlobals = Array.from(seen.values());

    // 排序：boost 高的在前，同 boost 按字母排序
    allGlobals.sort((a, b) => {
        const boostDiff = (b.boost || 50) - (a.boost || 50);
        if (boostDiff !== 0) return boostDiff;
        return a.label.localeCompare(b.label);
    });

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
 * 检查是否在声明语句的变量名位置
 * 例如：const |Math  - 可以补全
 *       const Math|   - 已在变量名末尾
 *       const Math.|  - 这是属性访问，由对象属性源处理
 */
export function findWordAtCursorBeforeDot(line, cursorInLine) {
    // 获取光标前的文本
    const textBeforeCursor = line.substring(0, cursorInLine);

    // 检查是否有点号在光标前
    const lastDot = textBeforeCursor.lastIndexOf('.');
    if (lastDot !== -1) {
        // 有点号，应该由对象属性源处理
        // 但检查点是否是注释或其他
        const afterDot = textBeforeCursor.substring(lastDot);
        if (/^\.\w*$/.test(afterDot)) {
            return null; // 这是属性访问
        }
    }

    // 没有点号，是独立的标识符
    const wordMatch = textBeforeCursor.match(/([\w$]+)$/);
    return wordMatch ? wordMatch[1] : '';
}