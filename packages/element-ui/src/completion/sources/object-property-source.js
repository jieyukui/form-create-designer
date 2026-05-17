import {getAvailableBuiltinData} from '../data/builtin/index';
import {prototypeCompletions} from '../data/prototypes/index';
import {windowGlobalProps} from '../data/globals';
import {parseFunctionSignature} from '../resolvers/signature-parser';
import {Priority} from '../core/priority';
import {getWindowScope} from '../core/environment';
import {detectLiteralPrototypeType} from '../utils/literal-prototype';
import {parsePropertyAccess} from '../utils/expression-object';
import {shouldBlockCompletionInLiteral} from '../utils/string-context';

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
 * 1. 用户自定义对象 (USER_CUSTOM_OBJECT)
 * 2. 用户自定义签名 (USER_CUSTOM_SIGNATURE)
 * 3. 预定义内置对象 (PREDEFINED_BUILTIN)
 * 4. 预定义原型链 (PREDEFINED_PROTOTYPE)
 * 5. window 运行时兜底 (RUNTIME_WINDOW_PROPERTY)
 *
 * @param {Object} options
 */
export function createObjectPropertyCompletionSource(options = {}) {
    const {
        customObjects = {},
        customSignatures = {},
        environment,
        includePrototypes = true,
        windowFallbackEnabled = true
    } = options;

    // 获取当前环境可用的内置数据
    const builtinCompletions = environment
        ? getAvailableBuiltinData(environment)
        : {};

    /**
     * 解析对象名：处理 window.xxx 自动映射
     *
     * 如果用户写了 window.Math.xxx，直接映射到 Math 的补全数据
     * 如果用户写了 window.customObj.xxx，映射到用户自定义对象
     */
    function resolveObjectName(objectName) {
        // window.xxx 映射：去掉 window 前缀
        // 同时也处理 self、globalThis、top、parent、frames
        const windowAliases = ['window', 'self', 'globalThis', 'top', 'parent', 'frames'];
        if (windowAliases.includes(objectName)) {
            return {
                originalName: objectName,
                targetName: '__WINDOW_OBJECT__', // 特殊标记
                isWindowAccess: true
            };
        }
        return {
            originalName: objectName,
            targetName: objectName,
            isWindowAccess: false
        };
    }

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

        const {targetName, isWindowAccess} = resolveObjectName(objectName);

        let completions = [];
        let sourcePriority = Priority.PREDEFINED_BUILTIN;

        // ==================== 1. 用户自定义对象（最高优先级） ====================
        if (customObjects[targetName]) {
            const obj = customObjects[targetName];
            const customCompletions = buildCustomObjectCompletions(
                targetName, obj, customSignatures
            );
            completions = customCompletions.map(c => ({
                ...c,
                boost: 100,
                source: 'custom-object'
            }));
            sourcePriority = Priority.USER_CUSTOM_OBJECT;
        }

        // ==================== 2. 处理 window 对象访问 ====================
        else if (isWindowAccess) {
            // window.xxx：融合所有 window 可用的补全
            completions = buildWindowCompletions(
                builtinCompletions,
                customObjects,
                customSignatures,
                windowFallbackEnabled
            );
            sourcePriority = Priority.PREDEFINED_BUILTIN;
        }

        // ==================== 3. 预定义内置对象 ====================
        else if (builtinCompletions[targetName]) {
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

        // ==================== 4. 原型链补全 ====================
        else {
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

        // ==================== 5. 过滤 ====================
        if (partialProp) {
            completions = completions.filter(c =>
                c.label.toLowerCase().startsWith(partialProp.toLowerCase())
            );
        }

        // ==================== 6. 兜底：如果是 window 访问且结果为空，使用运行时解析 ====================
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
 * 构建用户自定义对象的补全项
 */
function buildCustomObjectCompletions(objectName, obj, customSignatures) {
    const completions = [];

    for (const key of Object.keys(obj)) {
        if (key.startsWith('_')) continue;

        const value = obj[key];
        const keyPath = `${objectName}.${key}`;

        // 检查自定义签名
        if (customSignatures[keyPath]) {
            completions.push({
                label: key,
                type: customSignatures[keyPath].type || 'variable',
                detail: customSignatures[keyPath].detail || '',
                info: customSignatures[keyPath].info || keyPath,
            });
        } else if (typeof value === 'function') {
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
 * 构建 window 对象的补全（融合内置 + 自定义）
 */
function buildWindowCompletions(builtinCompletions, customObjects, customSignatures, includeRuntime) {
    const allCompletions = [];
    const seen = new Set();

    // 添加内置对象补全（作为 window 的属性）
    for (const [name, completions] of Object.entries(builtinCompletions)) {
        if (seen.has(name)) continue;
        seen.add(name);

        allCompletions.push({
            label: name,
            type: 'class',
            detail: 'object',
            info: `${name} 内置对象`,
            boost: 80,
            source: 'window-builtin'
        });
    }

    for (const prop of windowGlobalProps) {
        if (seen.has(prop.label)) continue;
        seen.add(prop.label);
        allCompletions.push({...prop, boost: 75, source: 'window-global'});
    }

    // 添加自定义对象
    for (const name of Object.keys(customObjects)) {
        if (seen.has(name)) continue;
        seen.add(name);
        allCompletions.push({
            label: name,
            type: 'class',
            detail: 'object',
            info: `用户自定义对象: ${name}`,
            boost: 100,
            source: 'window-custom'
        });
    }

    return allCompletions;
}

/**
 * 应用自定义签名覆盖
 */
function applyCustomSignatures(completions, objectName, customSignatures) {
    return completions.map(comp => {
        const key = `${objectName}.${comp.label}`;
        if (customSignatures[key]) {
            return {
                ...comp,
                detail: customSignatures[key].detail || comp.detail,
                info: customSignatures[key].info || comp.info,
                source: 'custom-signature'
            };
        }
        return comp;
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