import {detectEnvironment, getWindowScope} from './core/environment';
import {CompletionSourceManager, Priority} from './core/priority';
import {globalCompletionCache} from './core/cache';
import {createGlobalCompletionSource} from './sources/global-source';
import {createObjectPropertyCompletionSource} from './sources/object-property-source';
import {createWindowFallbackSource} from './sources/window-fallback-source';
import {createChainCompletionSource} from './sources/chain-source';
import {mergeCompletionSources} from './utils/merge';
import {normalizeCompletionItem} from './utils/normalize';
import {normalizeCustomObjectCompletions} from './utils/custom-object-completions';
import {
    createContextAwareGlobalSource,
    createContextAwarePropertySource,
    createContextAwareWindowFallbackSource
} from './sources/context-aware-source';

/**
 * 创建完整的 JavaScript 代码补全配置
 *
 * @param {Object} options - 配置选项
 * @param {Array} options.customCompletions - 用户自定义补全项
 *   [{ label, type, detail, info, path?, boost?, ... }]
 * @param {Object} options.customObjects - 用户自定义对象
 *   { objName: realObject }
 * @param {Object} options.customSignatures - 用户自定义签名
 *   { 'objName.methodName': { type, detail, info } }
 * @param {Object} options.customObjectCompletions - 对象树 { meta, members }，避免与用户属性名冲突
 * @param {boolean} options.includeWindow - 是否包含 window 对象扫描（默认 true）
 * @param {boolean} options.includeChain - 是否包含链式调用推断（默认 true）
 * @param {boolean} options.includePrototypes - 是否包含原型链补全（默认 true）
 * @param {Object} options.environment - 预检测的环境（可选，自动检测）
 * @param {boolean} options.debug - 是否启用调试模式（默认 false）
 * @returns {Object} autocompletion 配置对象
 */
export function createJavaScriptCompletions(options = {}) {
    const {
        customCompletions = [],
        customObjects = {},
        customSignatures = {},
        customObjectCompletions = {},
        includeWindow = true,
        includeChain = true,
        includePrototypes = true,
        environment: providedEnv,
        debug = false
    } = options;

    // 1. 环境检测
    const environment = providedEnv || detectEnvironment();

    if (debug) {
        console.log('[Completion] 环境检测:', {
            type: environment.type,
            features: environment.features
        });
    }

    const customObjectRegistry = normalizeCustomObjectCompletions(
        customObjectCompletions,
        customSignatures
    );

    // 2. 创建源管理器
    const sourceManager = new CompletionSourceManager();

    // 3. 注册补全源（按 priority 降序执行：属性访问优先于全局补全）
    const rawObjectPropertySource = createObjectPropertyCompletionSource({
        customObjects,
        customSignatures,
        customObjectRegistry,
        environment,
        includePrototypes,
        windowFallbackEnabled: includeWindow
    });
    const objectPropertySource = createContextAwarePropertySource(rawObjectPropertySource, {
        debug
    });
    sourceManager.register({
        name: 'object-property',
        priority: Priority.PREDEFINED_BUILTIN,
        sourceFn: objectPropertySource,
        requires: []
    });

    const rawGlobalSource = createGlobalCompletionSource({
        customCompletions,
        customObjects,
        customObjectGlobals: customObjectRegistry.globalEntries,
        environment
    });
    const globalSource = createContextAwareGlobalSource(rawGlobalSource, {
        debug
    });
    sourceManager.register({
        name: 'global',
        priority: Priority.PREDEFINED_GLOBAL,
        sourceFn: globalSource,
        requires: []
    });

    // 优先级 4: 链式调用补全（实验性）
    if (includeChain) {
        const chainSource = createChainCompletionSource();
        sourceManager.register({
            name: 'chain',
            priority: Priority.RUNTIME_PROTOTYPE_CHAIN,
            sourceFn: chainSource,
            requires: ['hasWindow']
        });
    }

    // 优先级 5: window 兜底补全（仅浏览器环境）
    if (includeWindow && environment.hasWindow) {
        const windowScope = getWindowScope();
        if (windowScope) {
            const rawWindowFallbackSource = createWindowFallbackSource({
                windowScope,
                environment,
                knownNames: new Set([
                    ...Object.keys(customObjects),
                    ...Object.keys(customObjectRegistry.topLevel)
                ])
            });
            const windowFallbackSource = createContextAwareWindowFallbackSource(
                rawWindowFallbackSource,
                {debug}
            );
            sourceManager.register({
                name: 'window-fallback',
                priority: Priority.RUNTIME_WINDOW_PROPERTY,
                sourceFn: windowFallbackSource,
                requires: ['hasWindow']
            });
        }
    }

    // 4. 获取活跃的源函数列表
    const activeSources = sourceManager.getActiveSources(environment);

    if (debug) {
        console.log('[Completion] 活跃的源:', sourceManager.getDebugInfo()
            .filter(s => {
                const src = sourceManager.sources.find(ss => ss.name === s.name);
                return src && src.enabled;
            })
            .map(s => s.name)
        );
    }

    // 5. 合并源
    const mergedSource = mergeCompletionSources(activeSources, {
        accumulate: false // 使用快速路径：首个匹配即返回
    });

    // 6. 返回 CodeMirror autocompletion 配置
    return {
        activateOnTyping: true,
        defaultKeymap: true,
        override: [mergedSource],
        // 可选：提供手动触发补全的方法
        _debug: debug ? {
            environment,
            sources: sourceManager.getDebugInfo(),
            cache: globalCompletionCache.getStats()
        } : undefined
    };
}

/**
 * 简化版 API：直接返回 autocompletion 配置
 */
export function getAutocompletionConfig(options = {}) {
    return createJavaScriptCompletions(options);
}

// 导出工具函数
export {
    detectEnvironment,
    getWindowScope,
    globalCompletionCache,
    Priority,
    CompletionSourceManager,
    normalizeCompletionItem,
    mergeCompletionSources,
    createGlobalCompletionSource,
    createObjectPropertyCompletionSource,
    createWindowFallbackSource,
    createChainCompletionSource
};

// 导出环境相关
export {EnvironmentType, getGlobalScope} from './core/environment';

// 导出签名解析器
export {parseFunctionSignature, getFunctionSignature, inferReturnType} from './resolvers/signature-parser';

export {analyzeCompletionContext, ContextType} from './core/context-analyzer';
export {detectLiteralPrototypeType, extractImmediateObjectExpression} from './utils/literal-prototype';
export {parsePropertyAccess} from './utils/expression-object';
export {getQuoteContextAt, QuoteContext, shouldBlockCompletionInLiteral} from './utils/string-context';
export {decorateKeywordCompletion, decorateKeywordCompletions, shouldKeywordHaveTrailingSpace} from './utils/keyword-apply';
export {
    normalizeCustomObjectCompletions,
    resolveCustomObjectCompletions,
    mergeBuiltinWithCustomObjects
} from './utils/custom-object-completions';
export {keywordCompletions} from './data/globals';