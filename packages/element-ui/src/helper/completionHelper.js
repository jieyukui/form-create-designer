import {builtinCompletions} from '../constants/index';
import {scopeCompletionSource} from '@codemirror/lang-javascript';
import {shouldOfferBuiltinTable} from '../completion/core/builtin-guard';

export {mergeCompletionSources} from '../completion/utils/merge';
export {createGlobalCompletionSource} from '../completion/sources/global-source';
export {createObjectPropertyCompletionSource} from '../completion/sources/object-property-source';

import {detectEnvironment, getWindowScope} from '../completion/core/environment';
import {filterBuiltinCompletionsByEnvironment} from '../completion/data/builtin/env-filter';
import {buildMergedBuiltinMap} from '../completion/data/builtin';
import {createGlobalCompletionSource as cmCreateGlobalCompletionSource} from '../completion/sources/global-source';
import {createObjectPropertyCompletionSource as cmCreateObjectPropertyCompletionSource} from '../completion/sources/object-property-source';
import {createWindowFallbackSource} from '../completion/sources/window-fallback-source';
import {createChainCompletionSource} from '../completion/sources/chain-source';
import {createContextAwareSource} from '../completion/sources/context-aware-source';
import {mergeCompletionSources as cmMergeCompletionSources} from '../completion/utils/merge';

/**
 * 创建完整的 JavaScript 补全配置（支持函数签名和返回值）
 * @param options
 */
export function setupJavaScriptCompletions(options = {}) {
    const {customCompletions = [], includeWindow = true, useContextAnalyzer = true} = options;
    const env = detectEnvironment();
    const baseFiltered = filterBuiltinCompletionsByEnvironment(env, builtinCompletions);
    const baseEntries = Object.fromEntries(
        Object.entries(baseFiltered).filter(([name]) => shouldOfferBuiltinTable(name))
    );
    const mergedBuiltin = buildMergedBuiltinMap({
        environment: env,
        baseBuiltin: baseEntries,
        customBuiltin: options.customBuiltinCompletions || {}
    });
    const knownNames = new Set(Object.keys(mergedBuiltin));
    const optFull = {
        ...options,
        environment: env,
        builtinCompletions: mergedBuiltin
    };

    const wrap = (fn, mode) => (useContextAnalyzer ? createContextAwareSource(fn, {mode}) : fn);

    const sources = [
        wrap(cmCreateGlobalCompletionSource(optFull), 'global'),
        wrap(cmCreateObjectPropertyCompletionSource(optFull), 'property'),
        wrap(createChainCompletionSource(), 'property'),
        wrap(createWindowFallbackSource({knownNames, environment: env}), 'global')
    ];

    const win = getWindowScope();
    if (includeWindow && win) {
        sources.push(wrap(scopeCompletionSource(win), 'global'));
    }

    return cmMergeCompletionSources(sources);
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