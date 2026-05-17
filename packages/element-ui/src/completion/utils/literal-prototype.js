/**
 * 从点号左侧表达式或整行文本推断字面量对应的原型补全类型
 *
 * @param {string} line - 光标前的一段文本（通常为本行或最近 500 字符）
 * @param {string} [objectName] - 上下文分析得到的点号左侧字符串
 * @returns {{ type: string, label: string } | null}
 */
export function detectLiteralPrototypeType(line, objectName = '') {
    const normalizedLine = line || '';
    const obj = (objectName || '').trim();

    // 行尾模式（objectName 可能为整段赋值表达式，如 const arr = []）
    if (/\[\s*\]\s*\.\s*[\w$]*$/.test(normalizedLine)) {
        return {type: 'Array', label: 'Array.prototype'};
    }
    if (/(['"])[\s\S]*?\1\s*\.\s*[\w$]*$/.test(normalizedLine)) {
        return {type: 'String', label: 'String.prototype'};
    }
    if (/\b(\d+(?:\.\d+)?)\s*\.\s*[\w$]*$/.test(normalizedLine)) {
        return {type: 'Number', label: 'Number.prototype'};
    }
    if (/\/[^/\n\\]*(?:\\.[^/\n\\]*)*\/[gimsuy]*\s*\.\s*[\w$]*$/.test(normalizedLine)) {
        return {type: 'RegExp', label: 'RegExp.prototype'};
    }
    if (/\btrue\s*\.\s*[\w$]*$/.test(normalizedLine)) {
        return {type: 'Boolean', label: 'Boolean.prototype'};
    }
    if (/\bfalse\s*\.\s*[\w$]*$/.test(normalizedLine)) {
        return {type: 'Boolean', label: 'Boolean.prototype'};
    }

    // objectName 精确匹配
    if (/^\[\s*\]$/.test(obj) || /^\[[\s\S]*\]$/.test(obj)) {
        return {type: 'Array', label: 'Array.prototype'};
    }
    if (/^(['"])[\s\S]*\1$/.test(obj)) {
        return {type: 'String', label: 'String.prototype'};
    }
    if (/^\d+(?:\.\d+)?$/.test(obj)) {
        return {type: 'Number', label: 'Number.prototype'};
    }
    if (obj === ']' && /\[\s*\]\s*\.$/.test(normalizedLine)) {
        return {type: 'Array', label: 'Array.prototype'};
    }

    return null;
}

/**
 * 提取点号左侧的「直接」对象表达式（而非整条赋值语句）
 *
 * @param {string} expr - 点号之前的文本
 * @returns {string}
 */
export function extractImmediateObjectExpression(expr) {
    const trimmed = (expr || '').trimEnd();
    if (!trimmed) return '';

    const arrayLit = trimmed.match(/(\[[\s\S]*\])$/);
    if (arrayLit) return arrayLit[1];

    const strLit = trimmed.match(/((['"])(?:\\.|(?!\2)[^\\])*\2)$/);
    if (strLit) return strLit[1];

    const regexLit = trimmed.match(/(\/[^/\n\\]*(?:\\.[^/\n\\]*)*\/[gimsuy]*)$/);
    if (regexLit) return regexLit[1];

    const numLit = trimmed.match(/(\d+\.\d+|\d+\.|\.\d+|\d+)$/);
    if (numLit) return numLit[1];

    const parenLit = trimmed.match(/(\([^()]*\))$/);
    if (parenLit && !/^\(\s*$/.test(parenLit[1])) {
        return parenLit[1];
    }

    const memberChain = trimmed.match(/([\w$]+(?:\[[^\]]*\]|\([^)]*\)|\.[\w$]+)*)$/);
    if (memberChain) return memberChain[1];

    return trimmed;
}

/**
 * 光标前文本是否处于属性访问（点号）位置
 * @param {string} docBefore - 光标前的文档片段
 * @returns {boolean}
 */
export function isPropertyAccessPosition(docBefore) {
    const normalized = docBefore.replace(/`+$/, '');
    return /\.[\w$]*$/.test(normalized);
}
