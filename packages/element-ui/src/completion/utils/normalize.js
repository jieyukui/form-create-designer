import {Priority} from '../core/priority';

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