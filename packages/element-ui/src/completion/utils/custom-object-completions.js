import {Priority} from '../core/priority';
import {mergeCompletionItems, normalizeCompletionItem} from './normalize';

const META_KEYS = new Set(['label', 'type', 'detail', 'info', 'boost', 'apply', 'priority']);
const STRUCTURE_KEYS = new Set(['meta', 'members', 'children']);

/**
 * 将 customObjectCompletions 规范化为补全系统可用的结构。
 *
 * 节点结构（避免 type/detail/info 与用户属性名冲突）：
 * - 命名空间：{ meta: { type, detail, info, ... }, members: { ... } }
 * - 叶子属性：{ type, detail, info } 简写，或 { meta: { ... } }（属性名与 meta 字段冲突时）
 *
 * @example
 * customObjectCompletions: {
 *   myApp: {
 *     meta: { type: 'class', detail: 'Application', info: '自定义应用', onWindow: false },
 *     members: {
 *       version: { type: 'property', detail: 'string', info: '版本' },
 *       api: {
 *         meta: { type: 'class', detail: 'API', info: 'API 模块' },
 *         members: {
 *           type: { meta: { type: 'property', detail: 'string', info: '用户类型字段' } },
 *           get: { type: 'function', detail: '(id) => User', info: '获取用户' }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export function normalizeCustomObjectCompletions(customObjectCompletions = {}, customSignatures = {}) {
    const topLevel = {};
    const nestedPaths = {};
    const rootGlobals = new Map();
    const windowMembers = new Set();

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

    function readMeta(node, key) {
        const source = node?.meta && typeof node.meta === 'object' ? node.meta : node;
        const meta = {};
        if (source && typeof source === 'object') {
            for (const k of META_KEYS) {
                if (source[k] != null && source[k] !== '') {
                    meta[k] = source[k];
                }
            }
        }
        if (!meta.label) {
            meta.label = key;
        }
        return meta;
    }

    /** 根节点 meta.onWindow === true 时，才加入 window. 子成员补全 */
    function readOnWindow(node) {
        if (!node || typeof node !== 'object') return false;
        const source = node.meta && typeof node.meta === 'object' ? node.meta : node;
        return source.onWindow === true;
    }

    function registerRootGlobal(rootKey, meta, rootNode) {
        rootGlobals.set(rootKey, toGlobalEntry(rootKey, meta));
        if (readOnWindow(rootNode)) {
            windowMembers.add(rootKey);
        }
    }

    function getMembers(node) {
        if (!node || typeof node !== 'object') return null;
        const bag = node.members ?? node.children;
        if (bag && typeof bag === 'object' && !Array.isArray(bag)) {
            return bag;
        }
        return null;
    }

    function toPropertyItem(meta, key) {
        return normalizeCompletionItem({
            type: 'variable',
            detail: '',
            info: '',
            ...meta,
            label: meta.label || key
        }, {priority: Priority.USER_CUSTOM_OBJECT_COMPLETIONS});
    }

    function toGlobalEntry(rootKey, meta) {
        return {
            label: rootKey,
            type: meta.type || 'class',
            detail: meta.detail || 'object',
            info: meta.info || `自定义对象: ${rootKey}`,
            priority: Priority.USER_CUSTOM_OBJECT_COMPLETIONS,
            boost: 95
        };
    }

    /**
     * @returns {{ kind: 'leaf'|'namespace'|'array', meta?: object, members?: object, items?: array } | null}
     */
    function parseObjectNode(node, key) {
        if (Array.isArray(node)) {
            return {kind: 'array', items: node};
        }
        if (!node || typeof node !== 'object') {
            return null;
        }

        const members = getMembers(node);
        if (members) {
            return {kind: 'namespace', meta: readMeta(node, key), members};
        }

        if (typeof node.label === 'string' && node.children && typeof node.children === 'object' && !Array.isArray(node.children)) {
            return {
                kind: 'namespace',
                meta: readMeta(node, node.label),
                members: node.children
            };
        }

        if (node.meta && typeof node.meta === 'object') {
            return {kind: 'leaf', meta: readMeta(node, key)};
        }

        const keys = Object.keys(node).filter(k => !STRUCTURE_KEYS.has(k));
        if (keys.length > 0 && keys.every(k => META_KEYS.has(k))) {
            return {kind: 'leaf', meta: readMeta(node, key)};
        }

        if (keys.length > 0) {
            const implicitMembers = {};
            for (const k of keys) {
                implicitMembers[k] = node[k];
            }
            return {kind: 'namespace', meta: {label: key}, members: implicitMembers};
        }

        return {kind: 'leaf', meta: {label: key}};
    }

    function processNamespace(path, parsed) {
        const items = [];
        for (const [memberKey, memberNode] of Object.entries(parsed.members)) {
            const childParsed = parseObjectNode(memberNode, memberKey);
            if (!childParsed) continue;

            const childPath = path ? `${path}.${memberKey}` : memberKey;

            if (childParsed.kind === 'namespace') {
                items.push(toPropertyItem(childParsed.meta, memberKey));
                processNamespace(childPath, childParsed);
            } else if (childParsed.kind === 'leaf') {
                items.push(toPropertyItem(childParsed.meta, memberKey));
            } else if (childParsed.kind === 'array') {
                processValueAtPath(childPath, memberNode);
            }
        }
        addCompletions(path, items);
    }

    function processArrayAtPath(path, items) {
        const directItems = [];
        for (const item of items) {
            if (!item || typeof item !== 'object') continue;
            const label = item.label;
            if (!label) continue;

            const itemParsed = parseObjectNode(item, label);
            if (itemParsed?.kind === 'namespace') {
                directItems.push(toPropertyItem(itemParsed.meta, label));
                processNamespace(path ? `${path}.${label}` : label, itemParsed);
            } else if (itemParsed?.kind === 'leaf') {
                directItems.push(toPropertyItem(itemParsed.meta, label));
            }
        }
        addCompletions(path, directItems);
    }

    function processValueAtPath(path, node) {
        const segmentKey = path.includes('.') ? path.slice(path.lastIndexOf('.') + 1) : path;
        const parsed = parseObjectNode(node, segmentKey);

        if (!parsed) return;

        if (parsed.kind === 'array') {
            processArrayAtPath(path, parsed.items);
            return;
        }

        if (parsed.kind === 'namespace') {
            processNamespace(path, parsed);
            return;
        }

        if (parsed.kind === 'leaf') {
            addCompletions(path, [toPropertyItem(parsed.meta, segmentKey)]);
        }
    }

    function processRoot(rootKey, rootValue) {
        const parsed = parseObjectNode(rootValue, rootKey);
        if (!parsed) return;

        if (parsed.kind === 'namespace') {
            registerRootGlobal(rootKey, parsed.meta, rootValue);
            processNamespace(rootKey, parsed);
            return;
        }

        if (parsed.kind === 'leaf') {
            // 仅 meta、无 members：只注册全局补全，不把根对象名写入其子属性列表
            registerRootGlobal(rootKey, parsed.meta, rootValue);
            return;
        }

        if (parsed.kind === 'array') {
            registerRootGlobal(rootKey, {}, rootValue);
            processArrayAtPath(rootKey, parsed.items);
        }
    }

    for (const [key, value] of Object.entries(customObjectCompletions || {})) {
        if (key.includes('.')) {
            processValueAtPath(key, value);
            continue;
        }
        processRoot(key, value);
    }

    /** 嵌套路径签名：obj.prop 或 a.b.c */
    for (const [sigPath, sig] of Object.entries(customSignatures || {})) {
        if (!sigPath.includes('.')) continue;
        const dot = sigPath.lastIndexOf('.');
        if (dot <= 0) continue;
        const objPath = sigPath.slice(0, dot);
        const label = sigPath.slice(dot + 1);
        const map = targetMap(objPath);
        const existing = map[objPath] || [];
        const idx = existing.findIndex(c => c.label === label);
        const item = normalizeCompletionItem({label, ...sig}, {priority: Priority.USER_CUSTOM_SIGNATURE});
        if (idx >= 0) {
            existing[idx] = mergeCompletionItems([existing[idx], item])[0];
        } else {
            existing.push(item);
        }
        map[objPath] = existing;
    }

    const globalEntries = [];
    const seen = new Set();

    for (const [name, entry] of rootGlobals) {
        globalEntries.push(entry);
        seen.add(name);
    }

    for (const name of Object.keys(topLevel)) {
        if (seen.has(name)) continue;
        globalEntries.push(toGlobalEntry(name, {}));
    }

    /** 根级签名（无点号，如 tableTool）：覆盖 customObjectCompletions 的 meta */
    for (const [sigPath, sig] of Object.entries(customSignatures || {})) {
        if (sigPath.includes('.')) continue;
        const patch = normalizeCompletionItem(
            {label: sigPath, ...sig, boost: 100},
            {priority: Priority.USER_CUSTOM_SIGNATURE}
        );
        const idx = globalEntries.findIndex(e => e.label === sigPath);
        if (idx >= 0) {
            globalEntries[idx] = mergeCompletionItems([globalEntries[idx], patch])[0];
        } else {
            globalEntries.push(patch);
        }
        if (rootGlobals.has(sigPath)) {
            rootGlobals.set(sigPath, mergeCompletionItems([rootGlobals.get(sigPath), patch])[0]);
        }
    }

    return {topLevel, nestedPaths, globalEntries, windowMembers};
}

export function resolveCustomObjectCompletions(objectName, {topLevel = {}, nestedPaths = {}} = {}) {
    if (!objectName) return null;
    if (nestedPaths[objectName]?.length) return nestedPaths[objectName];
    if (topLevel[objectName]?.length) return topLevel[objectName];
    return null;
}

export function mergeBuiltinWithCustomObjects({
    baseBuiltin = {},
    customObjectCompletions = {},
    customSignatures = {}
} = {}) {
    const {topLevel} = normalizeCustomObjectCompletions(customObjectCompletions, customSignatures);
    return {...baseBuiltin, ...topLevel};
}
