import {getAvailableBuiltinData} from '../data/builtin/index';
import {prototypeCompletions} from '../data/prototypes/index';
import {windowGlobalProps} from '../data/globals';
import {parseFunctionSignature} from '../resolvers/signature-parser';
import {Priority} from '../core/priority';
import {getWindowScope} from '../core/environment';
import {detectLiteralPrototypeType} from '../utils/literal-prototype';
import {parsePropertyAccess} from '../utils/expression-object';
import {shouldBlockCompletionInLiteral} from '../utils/string-context';
import {mergeCompletionItems} from '../utils/normalize';
import {resolveCustomObjectCompletions} from '../utils/custom-object-completions';
import {
    mergePredefinedWithRuntime,
    resolvePropertyAccessTarget,
    resolveRuntimeObjectProperties,
    resolveRuntimeOnlyCompletions
} from '../utils/property-access-resolve';
import {windowChildCompletions} from '../data/builtin/window-children';

/**
 * 创建对象属性补全源
 *
 * 处理 对象名.属性名 的场景，包括：
 * - 内置对象（Math、console、document 等）
 * - 用户自定义对象
 * - 原型链补全（[].、"" 等）
 * - window.xxx 自动映射
 *
 * 优先级：
 * 1. 用户自定义签名 (USER_CUSTOM_SIGNATURE)
 * 2. 用户声明对象树 customObjectCompletions (USER_CUSTOM_OBJECT_COMPLETIONS)
 * 3. 用户自定义运行时对象 customObjects (USER_CUSTOM_OBJECT)
 * 4. 预定义内置对象 (PREDEFINED_BUILTIN)
 * 4. 预定义原型链 (PREDEFINED_PROTOTYPE)
 * 5. window 运行时兜底 (RUNTIME_WINDOW_PROPERTY)
 *
 * @param {Object} options
 */
export function createObjectPropertyCompletionSource(options = {}) {
    const {
        customObjects = {},
        customSignatures = {},
        customObjectRegistry = {topLevel: {}, nestedPaths: {}, globalEntries: [], windowMembers: new Set()},
        environment,
        includePrototypes = true,
        windowFallbackEnabled = true
    } = options;

    const {topLevel, nestedPaths, globalEntries, windowMembers} = customObjectRegistry;

    // 获取当前环境可用的内置数据，并合并用户声明的顶层对象表
    const builtinCompletions = {
        ...(environment ? getAvailableBuiltinData(environment) : {}),
        ...topLevel
    };

    return (context) => {
        const cursor = context.pos;

        if (shouldBlockCompletionInLiteral(context.state.doc, cursor)) {
            return null;
        }

        // 优先使用上下文分析器提供的信息
        const ctx = context._completionContext;

        let objectName, partialProp;
        // 回退到正则匹配（但做更多检查）, 获取光标前的文本（最多取 500 字符）
        const line = context.state.sliceDoc(Math.max(0, cursor - 500), cursor);

        const lineParsed = parsePropertyAccess(line);
        if (lineParsed) {
            objectName = lineParsed.objectName;
            partialProp = lineParsed.partialProp;
        } else if (ctx && ctx.objectName !== null) {
            objectName = ctx.objectName;
            partialProp = ctx.partialProp;
        } else {
            return null;
        }

        const {
            targetName,
            isWindowRoot: isWindowAccess,
            accessPath
        } = resolvePropertyAccessTarget(objectName);

        const displayPath = accessPath || targetName;
        let completions = [];
        let sourcePriority = Priority.PREDEFINED_BUILTIN;

        // ==================== 1–3. 用户自定义（合并：customObjects < customObjectCompletions < customSignatures） ====================
        const userCustomCompletions = resolveUserCustomPropertyCompletions(targetName, {
            customObjects,
            customSignatures,
            topLevel,
            nestedPaths
        });
        if (userCustomCompletions.length) {
            completions = userCustomCompletions;
            sourcePriority = userCustomCompletions.some(c => c.priority === Priority.USER_CUSTOM_SIGNATURE)
                ? Priority.USER_CUSTOM_SIGNATURE
                : userCustomCompletions.some(c => c.source === 'custom-object-completions')
                    ? Priority.USER_CUSTOM_OBJECT_COMPLETIONS
                    : Priority.USER_CUSTOM_OBJECT;
        }

        // ==================== 3. 处理 window 对象访问 ====================
        if (completions.length === 0 && isWindowAccess) {
            completions = buildWindowCompletions({
                predefinedBuiltins: environment ? getAvailableBuiltinData(environment) : {},
                globalEntries,
                windowMembers,
                includeRuntime: windowFallbackEnabled,
                partialProp
            });
            sourcePriority = Priority.PREDEFINED_BUILTIN;
        }

        // ==================== 4. 预定义内置对象 ====================
        else if (completions.length === 0 && builtinCompletions[targetName]) {
            completions = applyCustomSignatures(
                [...builtinCompletions[targetName]],
                targetName,
                customSignatures
            ).map(c => ({
                ...c,
                boost: 80,
                source: 'builtin'
            }));
            sourcePriority = Priority.PREDEFINED_BUILTIN;
        }

        // ==================== 5. 原型链补全 ====================
        else if (completions.length === 0) {
            // 检查字面量原型链
            const literalProto = includePrototypes !== false
                ? detectLiteralPrototypeType(line, objectName)
                : null;
            if (literalProto && prototypeCompletions[literalProto.type]) {
                completions = [...prototypeCompletions[literalProto.type]].map(c => ({
                    ...c,
                    boost: 70,
                    source: 'prototype-literal'
                }));
                sourcePriority = Priority.PREDEFINED_PROTOTYPE;
            } else if (prototypeCompletions[targetName]) {
                // 直接使用构造函数名访问原型，如 Array.
                completions = [...prototypeCompletions[targetName]].map(c => ({
                    ...c,
                    boost: 70,
                    source: 'prototype'
                }));
                sourcePriority = Priority.PREDEFINED_PROTOTYPE;
            }
        }

        // ==================== 6. 预定义 + 运行时合并（含原型链，navigator / navigation 等） ====================
        if (
            windowFallbackEnabled
            && targetName
            && targetName !== '__WINDOW_OBJECT__'
            && !customObjects[targetName]
        ) {
            const hadPredefined = completions.length > 0;
            completions = mergePredefinedWithRuntime(completions, targetName, partialProp, {
                enabled: true,
                displayPath
            });

            if (completions.length === 0) {
                completions = resolveRuntimeOnlyCompletions(targetName, partialProp, displayPath).map(c => ({
                    ...c,
                    boost: c.boost || 30,
                    source: 'object-runtime-only'
                }));
            }

            if (!hadPredefined && completions.length > 0) {
                sourcePriority = Priority.RUNTIME_WINDOW_PROPERTY;
            }
        }

        // ==================== 7. 过滤 ====================
        if (partialProp) {
            completions = completions.filter(c =>
                c.label.toLowerCase().startsWith(partialProp.toLowerCase())
            );
        }

        // ==================== 8. 兜底：如果是 window 根访问且结果为空，使用运行时解析 ====================
        if (completions.length === 0 && isWindowAccess && windowFallbackEnabled) {
            const runtimeCompletions = resolveWindowRuntimeProperties(
                partialProp,
                builtinCompletions,
                customObjects
            );
            if (runtimeCompletions.length > 0) {
                completions = runtimeCompletions.map(c => ({
                    ...c,
                    boost: 30,
                    source: 'window-runtime'
                }));
                sourcePriority = Priority.RUNTIME_WINDOW_PROPERTY;
            }
        }

        if (completions.length === 0) return null;

        return {
            from: cursor - partialProp.length,
            options: completions,
            validFor: /^\w*$/,
            sourcePriority
        };
    };
}

/**
 * 合并 customObjects、customObjectCompletions，最后应用 customSignatures 覆盖
 */
function resolveUserCustomPropertyCompletions(targetName, {
    customObjects = {},
    customSignatures = {},
    topLevel = {},
    nestedPaths = {}
} = {}) {
    let items = [];

    if (customObjects[targetName]) {
        items = mergeCompletionItems([
            ...items,
            ...buildCustomObjectCompletions(targetName, customObjects[targetName]).map(c => ({
                ...c,
                priority: Priority.USER_CUSTOM_OBJECT,
                boost: 80,
                source: 'custom-object'
            }))
        ]);
    }

    const customObjectItems = resolveCustomObjectCompletions(targetName, {topLevel, nestedPaths});
    if (customObjectItems?.length) {
        items = mergeCompletionItems([
            ...items,
            ...customObjectItems.map(c => ({
                ...c,
                boost: Math.max(c.boost || 0, 90),
                source: c.source || 'custom-object-completions'
            }))
        ]);
    }

    if (!items.length) {
        return items;
    }

    return applyCustomSignatures(items, targetName, customSignatures);
}

/**
 * 构建用户自定义对象的补全项（签名由 resolveUserCustomPropertyCompletions 统一覆盖）
 */
function buildCustomObjectCompletions(objectName, obj) {
    const completions = [];

    for (const key of Object.keys(obj)) {
        if (key.startsWith('_')) continue;

        const value = obj[key];
        const keyPath = `${objectName}.${key}`;

        if (typeof value === 'function') {
            const signature = parseFunctionSignature(value);
            completions.push({
                label: key,
                type: 'function',
                detail: signature || 'function',
                info: `${keyPath} 方法`,
            });
        } else {
            const valueStr = typeof value === 'object' && value !== null
                ? `{${Object.keys(value).length}}`
                : String(value);
            completions.push({
                label: key,
                type: typeof value === 'object' && value !== null ? 'class' : 'variable',
                detail: typeof value,
                info: `${keyPath} = ${valueStr}`,
            });
        }
    }

    return completions;
}

/**
 * 构建 window 对象的补全（融合内置 + 显式声明的 window 子成员）
 */
function buildWindowCompletions({
    predefinedBuiltins = {},
    globalEntries = [],
    windowMembers = new Set(),
    includeRuntime = true,
    partialProp = ''
} = {}) {
    const allCompletions = [];
    const seen = new Set();
    const globalByLabel = new Map(globalEntries.map(entry => [entry.label, entry]));

    const pushEntry = (entry, boost, source) => {
        if (seen.has(entry.label)) return;
        seen.add(entry.label);
        allCompletions.push({...entry, boost, source});
    };

    for (const name of Object.keys(predefinedBuiltins)) {
        pushEntry({
            label: name,
            type: 'class',
            detail: 'object',
            info: `${name} 内置对象`
        }, 80, 'window-builtin');
    }

    for (const prop of windowGlobalProps) {
        pushEntry(prop, 75, 'window-global');
    }

    for (const prop of windowChildCompletions) {
        pushEntry(prop, 78, 'window-child');
    }

    for (const name of windowMembers) {
        const entry = globalByLabel.get(name);
        pushEntry(entry ? {
            label: entry.label,
            type: entry.type || 'class',
            detail: entry.detail || 'object',
            info: entry.info || `用户自定义对象: ${name}`,
            priority: entry.priority || Priority.USER_CUSTOM_OBJECT_COMPLETIONS
        } : {
            label: name,
            type: 'class',
            detail: 'object',
            info: `用户自定义对象: ${name}`,
            priority: Priority.USER_CUSTOM_OBJECT_COMPLETIONS
        }, 95, 'window-custom-object');
    }

    if (includeRuntime) {
        const win = getWindowScope();
        if (win) {
            const runtimeItems = resolveRuntimeObjectProperties(win, partialProp, {pathLabel: 'window'});
            for (const item of runtimeItems) {
                if (seen.has(item.label)) continue;
                pushEntry(item, item.boost || 25, item.source || 'window-runtime');
            }
        }
    }

    return allCompletions;
}

/**
 * 应用自定义签名覆盖
 */
function applyCustomSignatures(completions, objectName, customSignatures) {
    return completions.map(comp => {
        const key = `${objectName}.${comp.label}`;
        const sig = customSignatures[key];
        if (!sig) return comp;
        return {
            ...comp,
            type: sig.type ?? comp.type,
            detail: sig.detail ?? comp.detail,
            info: sig.info ?? comp.info,
            priority: Priority.USER_CUSTOM_SIGNATURE,
            boost: 100,
            source: 'custom-signature'
        };
    });
}

/**
 * 运行时解析 window 属性（兜底方案）
 *
 * 当预定义数据和自定义对象都无法提供补全时，
 * 扫描 window 的实际属性作为最后的兜底。
 */
function resolveWindowRuntimeProperties(partialProp, builtinCompletions, customObjects) {
    const completions = [];
    const win = getWindowScope();
    if (!win) return completions;

    // 收集已处理的名称（避免重复）
    const seen = new Set();
    for (const name of Object.keys(builtinCompletions)) seen.add(name);
    for (const name of Object.keys(customObjects)) seen.add(name);

    // window 自身引用（避免循环）
    const WINDOW_SELF_REFS = new Set([
        'window', 'self', 'top', 'parent', 'frames', 'globalThis'
    ]);

    try {
        // 获取 window 自身的属性（不包括原型链）
        const propNames = Object.getOwnPropertyNames(win);

        for (const prop of propNames) {
            // 跳过已处理的名称
            if (seen.has(prop)) continue;
            // 跳过私有属性
            if (prop.startsWith('_')) continue;
            // 跳过 window 自身引用
            if (WINDOW_SELF_REFS.has(prop)) continue;
            // 跳过事件处理器（以 on 开头且后跟大写字母的）
            if (/^on[A-Z]/.test(prop)) continue;
            // 跳过全大写的常量（通常是浏览器内部属性）
            if (prop === prop.toUpperCase() && prop.length > 3) continue;

            // 过滤：必须匹配部分属性名
            if (partialProp && !prop.toLowerCase().startsWith(partialProp.toLowerCase())) {
                continue;
            }

            seen.add(prop);

            try {
                const value = win[prop];
                const typeofValue = typeof value;

                if (typeofValue === 'function') {
                    const signature = parseFunctionSignature(value);
                    completions.push({
                        label: prop,
                        type: 'function',
                        detail: signature || 'function',
                        info: `window.${prop} (运行时解析)`,
                        boost: 25,
                        source: 'window-runtime'
                    });
                } else if (value && typeofValue === 'object') {
                    // 尝试获取更精确的类型名
                    let typeName = 'object';
                    try {
                        if (value.constructor && value.constructor.name) {
                            typeName = value.constructor.name;
                        }
                    } catch (e) {}

                    let propCount = 0;
                    try {
                        propCount = Object.keys(value).length;
                    } catch (e) {}

                    completions.push({
                        label: prop,
                        type: 'class',
                        detail: typeName !== 'Object' ? typeName : (propCount > 0 ? `{${propCount}}` : 'object'),
                        info: propCount > 0
                            ? `window.${prop} (${typeName}, ${propCount} 个属性)`
                            : `window.${prop} (${typeName})`,
                        boost: 22,
                        source: 'window-runtime'
                    });
                } else if (typeofValue === 'symbol') {
                    completions.push({
                        label: prop,
                        type: 'constant',
                        detail: 'symbol',
                        info: `window.${prop} (Symbol)`,
                        boost: 20,
                        source: 'window-runtime'
                    });
                } else {
                    // 基本类型值
                    const displayValue = typeofValue === 'string'
                        ? JSON.stringify(value).slice(0, 30)
                        : String(value);
                    completions.push({
                        label: prop,
                        type: 'variable',
                        detail: typeofValue,
                        info: `window.${prop} = ${displayValue}`,
                        boost: 18,
                        source: 'window-runtime'
                    });
                }
            } catch (e) {
                // 某些属性可能因安全策略无法访问（如 cross-origin）
                completions.push({
                    label: prop,
                    type: 'variable',
                    detail: '<protected>',
                    info: `window.${prop} (无法访问)`,
                    boost: 10,
                    source: 'window-runtime'
                });
            }
        }
    } catch (e) {
        // 整个 window 扫描失败（极端情况）
        if (typeof console !== 'undefined' && console.debug) {
            console.debug('[Completion] window 属性扫描失败:', e.message);
        }
    }

    // 按 boost 排序
    completions.sort((a, b) => (b.boost || 0) - (a.boost || 0));

    return completions;
}