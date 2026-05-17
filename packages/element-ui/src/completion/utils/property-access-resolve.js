import {getGlobalScope, getWindowScope} from '../core/environment';
import {parseFunctionSignature} from '../resolvers/signature-parser';

/** window / self / globalThis 等根引用 */
export const WINDOW_ROOT_NAMES = new Set([
    'window', 'self', 'globalThis', 'top', 'parent', 'frames'
]);

const RUNTIME_SCAN_MAX_PROTO_DEPTH = 4;

/**
 * 解析属性访问左侧对象名（支持 window.navigator → navigator）
 */
export function resolvePropertyAccessTarget(objectName) {
    const raw = (objectName || '').trim();
    if (!raw) {
        return {targetName: '', isWindowRoot: false, isWindowQualified: false, accessPath: ''};
    }

    if (WINDOW_ROOT_NAMES.has(raw)) {
        return {
            targetName: '__WINDOW_OBJECT__',
            isWindowRoot: true,
            isWindowQualified: false,
            accessPath: raw
        };
    }

    const segments = raw.split('.');
    if (segments.length > 1 && WINDOW_ROOT_NAMES.has(segments[0])) {
        const rest = segments.slice(1).join('.');
        return {
            targetName: rest,
            isWindowRoot: false,
            isWindowQualified: true,
            windowAlias: segments[0],
            accessPath: raw
        };
    }

    return {
        targetName: raw,
        isWindowRoot: false,
        isWindowQualified: false,
        accessPath: raw
    };
}

/**
 * 按点号路径从作用域取值
 */
export function getValueAtPath(scope, path) {
    if (!scope || !path) return undefined;
    const parts = path.split('.');
    let current = scope;
    for (const part of parts) {
        if (current == null) return undefined;
        try {
            current = current[part];
        } catch (e) {
            return undefined;
        }
    }
    return current;
}

/**
 * 收集对象自有属性 + 原型链上的可枚举/命名属性（用于 Navigation、Navigator 等）
 */
export function collectRuntimePropertyNames(obj, maxDepth = RUNTIME_SCAN_MAX_PROTO_DEPTH) {
    const names = new Set();
    if (obj == null) return names;

    let cur = obj;
    let depth = 0;

    while (cur && depth < maxDepth) {
        if (cur === Object.prototype) break;

        try {
            for (const name of Object.getOwnPropertyNames(cur)) {
                names.add(name);
            }
        } catch (e) { /* ignore */ }

        try {
            const proto = Object.getPrototypeOf(cur);
            if (!proto || proto === Object.prototype) break;
            cur = proto;
        } catch (e) {
            break;
        }
        depth++;
    }

    return names;
}

/**
 * 获取补全目标在运行时的对象引用（window 优先，支持 navigation 等仅挂在 window 的 API）
 */
export function getRuntimeRootForPath(targetPath) {
    if (!targetPath || targetPath === '__WINDOW_OBJECT__') return undefined;

    const win = getWindowScope();
    const global = getGlobalScope();
    const scopes = [];

    if (win) scopes.push(win);
    if (global && global !== win) scopes.push(global);

    for (const scope of scopes) {
        const value = getValueAtPath(scope, targetPath);
        if (value !== undefined) return value;
    }

    return undefined;
}

/**
 * 扫描对象属性生成补全（含原型链上的方法，如 navigation.back）
 */
export function resolveRuntimeObjectProperties(objectValue, partialProp = '', options = {}) {
    const {pathLabel = '', maxItems = 150} = options;
    const completions = [];
    if (objectValue == null) return completions;

    const prefix = pathLabel ? `${pathLabel}.` : '';
    const propNames = collectRuntimePropertyNames(objectValue);

    for (const prop of propNames) {
        if (prop.startsWith('_')) continue;
        if (/^on[A-Z]/.test(prop)) continue;

        if (partialProp && !prop.toLowerCase().startsWith(partialProp.toLowerCase())) {
            continue;
        }

        try {
            const value = objectValue[prop];
            const typeofValue = typeof value;

            if (typeofValue === 'function') {
                const signature = parseFunctionSignature(value);
                completions.push({
                    label: prop,
                    type: 'function',
                    detail: signature || 'function',
                    info: `${prefix}${prop} (运行时)`,
                    boost: 28,
                    source: 'object-runtime'
                });
            } else if (value && typeofValue === 'object') {
                let typeName = 'object';
                try {
                    if (value.constructor?.name) typeName = value.constructor.name;
                } catch (e) { /* ignore */ }

                completions.push({
                    label: prop,
                    type: 'class',
                    detail: typeName !== 'Object' ? typeName : 'object',
                    info: `${prefix}${prop} (${typeName}, 运行时)`,
                    boost: 26,
                    source: 'object-runtime'
                });
            } else if (typeofValue === 'symbol') {
                completions.push({
                    label: prop,
                    type: 'constant',
                    detail: 'symbol',
                    info: `${prefix}${prop} (Symbol, 运行时)`,
                    boost: 24,
                    source: 'object-runtime'
                });
            } else if (typeofValue !== 'undefined') {
                const displayValue = typeofValue === 'string'
                    ? JSON.stringify(value).slice(0, 30)
                    : String(value);
                completions.push({
                    label: prop,
                    type: 'variable',
                    detail: typeofValue,
                    info: `${prefix}${prop} = ${displayValue} (运行时)`,
                    boost: 22,
                    source: 'object-runtime'
                });
            }
        } catch (e) {
            completions.push({
                label: prop,
                type: 'variable',
                detail: '<protected>',
                info: `${prefix}${prop} (无法访问)`,
                boost: 12,
                source: 'object-runtime'
            });
        }

        if (completions.length >= maxItems) break;
    }

    completions.sort((a, b) => (b.boost || 0) - (a.boost || 0));
    return completions;
}

/**
 * 仅运行时扫描（无预定义表时使用）
 */
export function resolveRuntimeOnlyCompletions(targetPath, partialProp = '', displayPath = targetPath) {
    const runtimeObject = getRuntimeRootForPath(targetPath);
    if (runtimeObject === undefined) return [];
    return resolveRuntimeObjectProperties(runtimeObject, partialProp, {
        pathLabel: displayPath || targetPath
    });
}

/**
 * 合并预定义补全与运行时扫描（同名保留预定义项）
 */
export function mergePredefinedWithRuntime(predefined = [], targetPath, partialProp = '', options = {}) {
    const {
        enabled = true,
        displayPath = targetPath
    } = options;

    if (!enabled || !targetPath || targetPath === '__WINDOW_OBJECT__') {
        return predefined;
    }

    const runtimeObject = getRuntimeRootForPath(targetPath);
    if (runtimeObject === undefined) return predefined;

    const runtimeItems = resolveRuntimeObjectProperties(runtimeObject, partialProp, {
        pathLabel: displayPath || targetPath
    });

    if (!runtimeItems.length) return predefined;

    const map = new Map();
    for (const item of runtimeItems) {
        map.set(item.label, item);
    }
    for (const item of predefined) {
        map.set(item.label, item);
    }
    return Array.from(map.values()).sort((a, b) => (b.boost || 0) - (a.boost || 0));
}
