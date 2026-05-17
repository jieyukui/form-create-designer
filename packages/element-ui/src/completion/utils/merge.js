import {Priority} from '../core/priority';
import {globalCompletionCache} from '../core/cache';
import {mergeCompletionItems, sortCompletionItems} from './normalize';

/**
 * 合并补全源
 *
 * 策略：
 * 1. 按优先级顺序执行源
 * 2. 第一个返回结果的源直接返回（快速路径）
 * 3. 可使用 "累积模式" 合并所有源的结果
 *
 * @param {Array<Function>} sources - 补全源函数数组
 * @param {Object} options
 * @param {boolean} options.accumulate - 是否累积所有源的结果（默认 false）
 * @param {boolean} options.cache - 是否启用缓存（默认 false）
 * @returns {Function} 合并后的补全源函数
 */
export function mergeCompletionSources(sources, options = {}) {
    const {accumulate = false, cache = false} = options;

    if (accumulate) {
        return createAccumulateMerger(sources, cache);
    }
    return createFirstMatchMerger(sources);
}

/**
 * 创建 "首个匹配" 合并器
 * 按顺序尝试源，第一个返回非空结果的立即返回
 */
function createFirstMatchMerger(sources) {
    return async (context) => {
        for (const source of sources) {
            try {
                const result = await source(context);
                if (result && result.options && result.options.length > 0) {
                    return {
                        ...result,
                        options: sortCompletionItems(
                            result.options.map(item => ({
                                ...item,
                                source: item.source || 'merged'
                            }))
                        )
                    };
                }
            } catch (error) {
                console.warn('补全源执行失败:', error);
            }
        }
        return null;
    };
}

/**
 * 创建 "累积" 合并器
 * 执行所有源，合并结果，去重排序
 */
function createAccumulateMerger(sources, enableCache) {
    return async (context) => {
        const cacheKey = enableCache
            ? `completion_accumulate_${context.pos}_${context.state.doc.length}`
            : null;

        if (cacheKey) {
            const cached = globalCompletionCache.get(cacheKey);
            if (cached) return cached;
        }

        let allItems = [];
        const seenSources = new Set();

        for (const source of sources) {
            try {
                const result = await source(context);
                if (result && result.options && result.options.length > 0) {
                    for (const item of result.options) {
                        // 记录来源
                        item._source = item.source || 'unknown';
                        item._sourcePriority = result.sourcePriority || item.priority || Priority.RUNTIME_GENERIC;
                    }
                    allItems = allItems.concat(result.options);
                    seenSources.add(result.sourcePriority || Priority.RUNTIME_GENERIC);
                }
            } catch (error) {
                console.warn('补全源执行失败:', error);
            }
        }

        if (allItems.length === 0) return null;

        // 合并去重
        allItems = mergeCompletionItems(allItems);
        // 排序
        allItems = sortCompletionItems(allItems);

        const finalResult = {
            from: allItems[0]._from || context.pos,
            options: allItems,
            validFor: /^\w*$/
        };

        if (cacheKey) {
            globalCompletionCache.set(cacheKey, finalResult, {ttl: 30000});
        }

        return finalResult;
    };
}

/**
 * 创建优先级排序的合并源
 *
 * 源按 priority 属性排序后执行
 */
export function mergePrioritizedSources(sourceConfigs) {
    // 按优先级排序
    const sorted = [...sourceConfigs].sort((a, b) => b.priority - a.priority);
    const sources = sorted.map(s => s.source);

    return mergeCompletionSources(sources, {accumulate: false});
}