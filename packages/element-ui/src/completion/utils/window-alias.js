/**
 * 减少「顶层全局」与 `window` 上同名成员的重复展示（数据维护向工具）。
 * CodeMirror 当前实现为「多路 source 顺序优先」，本工具用于若将来合并列表时的去重。
 */

export function completionLabelKey(item) {
    if (!item || typeof item !== 'object') {
        return '';
    }
    return item.label != null ? String(item.label) : '';
}

/**
 * 从 `window` 侧补全列表中移除与 `primary` 列表标签重复的项。
 * @param {Array<object>} primary 通常为用户或静态全局列表
 * @param {Array<object>} fromWindow `scopeCompletionSource(window)` 等产出的列表
 */
export function removeDuplicateWindowMirrors(primary, fromWindow) {
    if (!Array.isArray(primary) || !Array.isArray(fromWindow)) {
        return fromWindow || [];
    }
    const taken = new Set(primary.map(completionLabelKey).filter(Boolean));
    return fromWindow.filter((item) => {
        const key = completionLabelKey(item);
        return key && !taken.has(key);
    });
}
