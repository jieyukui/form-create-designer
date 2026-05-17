/**
 * 关键字补全后是否追加尾部空格
 *
 * 需要空格：声明/控制流关键字，便于继续输入下一 token
 * 禁止空格：常随后接 . 、; 、: 等符号的关键字/字面量
 */
const KEYWORDS_WITHOUT_TRAILING_SPACE = new Set([
    'this',
    'super',
    'default',
    'break',
    'continue',
    'debugger',
    'true',
    'false',
    'null',
]);

/**
 * @param {string} label
 * @param {boolean|undefined} explicit - 项上的 trailingSpace 显式配置
 * @returns {boolean}
 */
export function shouldKeywordHaveTrailingSpace(label, explicit) {
    if (explicit === true) return true;
    if (explicit === false) return false;
    return !KEYWORDS_WITHOUT_TRAILING_SPACE.has(label);
}

/**
 * 为关键字补全项生成 apply 插入文本
 *
 * @param {Object} item
 * @returns {Object}
 */
export function decorateKeywordCompletion(item) {
    if (item.type !== 'keyword') {
        return item;
    }

    const addSpace = shouldKeywordHaveTrailingSpace(item.label, item.trailingSpace);
    const insertText = addSpace ? `${item.label} ` : item.label;

    return {
        ...item,
        apply: item.apply || insertText,
    };
}

/**
 * 批量处理补全列表中的关键字项
 * @param {Array} items
 * @returns {Array}
 */
export function decorateKeywordCompletions(items) {
    return items.map(item => decorateKeywordCompletion(item));
}
