import {Priority} from '../core/priority';
import {mergeCompletionItems, normalizeCompletionItem} from './normalize';

/**
 * 将 customObjectCompletions 规范化为补全系统可用的结构。
 *
 * 支持三种写法（可混用）：
 *
 * 1. 扁平 Record（键为点号路径，写法同 Math 数据表）
 *    { myApp: [...], 'myApp.api': [...] }
 *
 * 2. 树形对象（属性名即路径段）
 *    { myApp: { request: { label, type, ... }, api: { user: { get: {...} } } } }
 *
 * 3. 数组 + children（补全项上挂子命名空间）
 *    { myApp: [{ label: 'api', children: { get: {...} } }] }
 *
 * @param {Record<string, *>} customObjectCompletions
 * @param {Record<string, { type?: string, detail?: string, info?: string }>} [customSignatures]
 * @returns {{ topLevel: Record<string, object[]>, nestedPaths: Record<string, object[]>, globalEntries: object[] }}
 */
export function normalizeCustomObjectCompletions(customObjectCompletions = {}, customSignatures = {}) {
    const topLevel = {};
    const nestedPaths = {};

    function isPlainCompletion(node) {
        return node && typeof node === 'object' && !Array.isArray(node) && typeof node.label === 'string';
    }

    function isCompletionArray(node) {
        return Array.isArray(node);
    }

    function isTreeRecord(node) {
        return node && typeof node === 'object' && !Array.isArray(node) && !isPlainCompletion(node);
    }

    function stripChildren(item) {
        const {children, ...rest} = item;
        return rest;
    }

    function targetMap(path) {
        return path.includes('.') ? nestedPaths : topLevel;
    }

    function addCompletions(path, items) {
        if (!path || !items.length) return;
        const map = targetMap(path);
        const normalized = items.map(item =>
            normalizeCompletionItem(item, {priority: Priority.USER_CUSTOM_OBJECT_COMPLETIONS})
        );
        map[path] = mergeCompletionItems([...(map[path] || []), ...normalized]);
    }

    function namespaceEntry(key, child, parentPath) {
        if (isPlainCompletion(child)) {
            return stripChildren({...child, label: child.label || key});
        }
        const path = parentPath ? `${parentPath}.${key}` : key;
        return {
            label: key,
            type: 'class',
            detail: 'object',
            info: `命名空间: ${path}`
        };
    }

    /**
     * @param {string} path - 点号路径，表示「在该路径对象后输入 . 」时的补全列表
     */
    function processNode(path, node) {
        if (isCompletionArray(node)) {
            const directItems = [];
            for (const item of node) {
                if (!isPlainCompletion(item)) continue;
                if (item.children && isTreeRecord(item.children)) {
                    directItems.push(stripChildren(item));
                    processNode(`${path}.${item.label}`, item.children);
                } else {
                    directItems.push(item);
                }
            }
            addCompletions(path, directItems);
            return;
        }

        if (isPlainCompletion(node)) {
            if (node.children && isTreeRecord(node.children)) {
                addCompletions(path, [stripChildren(node)]);
                processNode(`${path}.${node.label}`, node.children);
            } else {
                addCompletions(path, [node]);
            }
            return;
        }

        if (!isTreeRecord(node)) return;

        const directItems = [];
        for (const [key, child] of Object.entries(node)) {
            if (isCompletionArray(child)) {
                processNode(path ? `${path}.${key}` : key, child);
                continue;
            }

            const childPath = path ? `${path}.${key}` : key;

            if (isPlainCompletion(child) && child.children && isTreeRecord(child.children)) {
                directItems.push(namespaceEntry(key, child, path));
                processNode(childPath, child.children);
            } else if (isTreeRecord(child)) {
                directItems.push(namespaceEntry(key, child, path));
                processNode(childPath, child);
            } else if (isPlainCompletion(child)) {
                directItems.push(namespaceEntry(key, child, path));
            }
        }
        addCompletions(path, directItems);
    }

    for (const [key, value] of Object.entries(customObjectCompletions || {})) {
        if (key.includes('.')) {
            if (isCompletionArray(value)) {
                addCompletions(key, value);
            } else {
                processNode(key, value);
            }
            continue;
        }

        if (isCompletionArray(value)) {
            processNode(key, value);
        } else if (isTreeRecord(value) || isPlainCompletion(value)) {
            processNode(key, value);
        }
    }

    for (const [sigPath, sig] of Object.entries(customSignatures || {})) {
        const dot = sigPath.lastIndexOf('.');
        if (dot <= 0) continue;
        const objPath = sigPath.slice(0, dot);
        const label = sigPath.slice(dot + 1);
        const map = targetMap(objPath);
        const existing = map[objPath] || [];
        const idx = existing.findIndex(c => c.label === label);
        const item = normalizeCompletionItem({label, ...sig}, {priority: Priority.USER_CUSTOM_SIGNATURE});
        if (idx >= 0) {
            existing[idx] = {...existing[idx], ...item};
        } else {
            existing.push(item);
        }
        map[objPath] = existing;
    }

    const globalEntries = Object.keys(topLevel).map(name => ({
        label: name,
        type: 'class',
        detail: 'object',
        info: `自定义对象: ${name}`,
        priority: Priority.USER_CUSTOM_OBJECT,
        boost: 100
    }));

    return {topLevel, nestedPaths, globalEntries};
}

/**
 * 按对象路径查找自定义对象属性补全（支持 myApp.api.user 等多段路径）
 */
export function resolveCustomObjectCompletions(objectName, {topLevel = {}, nestedPaths = {}} = {}) {
    if (!objectName) return null;
    if (nestedPaths[objectName]?.length) return nestedPaths[objectName];
    if (topLevel[objectName]?.length) return topLevel[objectName];
    return null;
}

/**
 * 合并环境内置与用户声明的顶层对象补全表
 */
export function mergeBuiltinWithCustomObjects({
    baseBuiltin = {},
    customObjectCompletions = {},
    customSignatures = {}
} = {}) {
    const {topLevel} = normalizeCustomObjectCompletions(customObjectCompletions, customSignatures);
    return {...baseBuiltin, ...topLevel};
}
