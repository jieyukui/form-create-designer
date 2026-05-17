/**
 * 浏览器根对象：仅在运行时真实存在时再使用静态内置补全表，避免 Node/Worker 等环境误提示。
 */

const BROWSER_ROOT_NAMES = new Set([
    'window',
    'document',
    'navigator',
    'screen',
    'history',
    'location',
    'localStorage',
    'sessionStorage'
]);

export function isBrowserRootObjectName(name) {
    return BROWSER_ROOT_NAMES.has(name);
}

export function isGlobalBindingDefined(name) {
    try {
        if (typeof globalThis === 'undefined') {
            return false;
        }
        return typeof globalThis[name] !== 'undefined';
    } catch {
        return false;
    }
}

/**
 * @param {string} objectName `obj.` 中的 obj
 * @returns {boolean} 是否应继续使用静态 builtin 表
 */
export function shouldOfferBuiltinTable(objectName) {
    if (!objectName) {
        return false;
    }
    if (!isBrowserRootObjectName(objectName)) {
        return true;
    }
    return isGlobalBindingDefined(objectName);
}
