/**
 * 解析函数签名
 *
 * 从函数对象的源码中提取参数列表。
 *
 * @param {Function} fn - 函数对象
 * @returns {string} 参数签名字符串，如 "(a: number, b: string) => any"
 */
export function parseFunctionSignature(fn) {
    if (typeof fn !== 'function') return '(...) => unknown';

    try {
        const fnStr = fn.toString().trim();

        // 处理 class 构造函数
        if (fnStr.startsWith('class')) {
            const constructorMatch = fnStr.match(/constructor\s*\(([^)]*)\)/);
            if (constructorMatch) {
                return `new (${constructorMatch[1].trim()}) => instance`;
            }
            return 'new (...) => instance';
        }

        // 处理普通函数: function name(a, b, c) { ... }
        let match = fnStr.match(/function\s*[\w$]*\s*\(([^)]*)\)/);
        if (match) {
            const params = cleanParams(match[1]);
            return `(${params}) => any`;
        }

        // 处理箭头函数: (a, b) => ... 或 a => ...
        match = fnStr.match(/^\(?([^)=]*)\)?\s*=>/);
        if (match) {
            let params = match[1].trim();
            // 单参数箭头函数，没有括号
            if (params && !params.includes(',') && fnStr.startsWith(params)) {
                params = [params];
            } else {
                params = cleanParams(params);
            }
            return `(${params}) => any`;
        }

        // 处理方法定义: method(a, b) { ... }
        match = fnStr.match(/^[\w$]+\s*\(([^)]*)\)/);
        if (match) {
            const params = cleanParams(match[1]);
            return `(${params}) => any`;
        }

        // 处理 getter/setter
        if (fnStr.startsWith('get ')) {
            return 'get => any';
        }
        if (fnStr.startsWith('set ')) {
            match = fnStr.match(/set\s+[\w$]+\s*\(([^)]*)\)/);
            if (match) {
                return `set (${cleanParams(match[1])}) => void`;
            }
        }

        // 处理 async function
        match = fnStr.match(/async\s+function\s*[\w$]*\s*\(([^)]*)\)/);
        if (match) {
            const params = cleanParams(match[1]);
            return `async (${params}) => Promise<any>`;
        }

        // 处理 async 箭头函数
        match = fnStr.match(/async\s*\(?([^)=]*)\)?\s*=>/);
        if (match) {
            let params = match[1].trim();
            if (params && !params.includes(',') && fnStr.includes(`async ${params}`)) {
                params = [params];
            } else {
                params = cleanParams(params);
            }
            return `async (${params}) => Promise<any>`;
        }

        return '(...) => unknown';
    } catch (e) {
        return '(...) => unknown';
    }
}

/**
 * 清理参数列表
 */
function cleanParams(paramsStr) {
    if (!paramsStr || paramsStr.trim() === '') return '';

    return paramsStr
        .split(',')
        .map(p => p.trim())
        .filter(p => p !== '')
        .map(p => {
            // 移除默认值
            const eqIndex = p.indexOf('=');
            if (eqIndex !== -1) p = p.substring(0, eqIndex).trim();
            // 移除解构的花括号/方括号（简化）
            p = p.replace(/^\{[^}]*\}/, '{...}');
            p = p.replace(/^\[[^\]]*\]/, '[...]');
            return p;
        })
        .join(', ');
}

/**
 * 获取带返回值推断的函数签名
 *
 * @param {Function} fn - 函数对象
 * @returns {string | null} 完整签名字符串
 */
export function getFunctionSignature(fn) {
    if (typeof fn !== 'function') return null;

    const paramsSignature = parseFunctionSignature(fn);
    const returnType = inferReturnType(fn);

    // 如果签名已经是 async，包含 Promise
    if (paramsSignature.startsWith('async ')) {
        return paramsSignature.replace('=> any', `=> ${returnType}`);
    }

    return paramsSignature.replace('=> any', `=> ${returnType}`);
}

/**
 * 尝试推断函数的返回值类型
 *
 * @param {Function} fn - 函数对象
 * @returns {string} 返回值类型字符串
 */
export function inferReturnType(fn) {
    if (typeof fn !== 'function') return 'unknown';

    try {
        const fnStr = fn.toString();
        const isAsync = fnStr.startsWith('async') || /async\s+function/.test(fnStr);

        // 明显的 return 语句模式
        if (fnStr.includes('return Promise')) return isAsync ? 'Promise<any>' : 'Promise<any>';
        if (fnStr.includes('return new Promise')) return 'Promise<T>';
        if (fnStr.includes('return []')) return 'Array<T>';
        if (fnStr.includes('return {}')) return 'object';
        if (fnStr.match(/return\s+["'`]/)) return 'string';
        if (fnStr.match(/return\s+[0-9]/)) return 'number';
        if (fnStr.match(/return\s+true\b|return\s+false\b/)) return 'boolean';
        if (fnStr.includes('return null')) return 'null';
        if (fnStr.includes('return undefined')) return 'undefined';
        if (fnStr.match(/return\s+this\b/)) return 'this';
        if (fnStr.match(/return\s+new\s+\w+/)) {
            const match = fnStr.match(/return\s+new\s+(\w+)/);
            return match ? match[1] : 'object';
        }

        // 尝试从函数体末尾找到 return 语句
        const returnMatch = fnStr.match(/return\s+([^;{\n]+)/);
        if (returnMatch) {
            const returnExpr = returnMatch[1].trim();
            if (returnExpr === 'this') return 'this';
            if (returnExpr.startsWith('[')) return 'Array';
            if (returnExpr.startsWith('{')) return 'object';
            if (returnExpr.startsWith('"') || returnExpr.startsWith('\'') || returnExpr.startsWith('`')) return 'string';
            if (/^\d/.test(returnExpr)) return 'number';
        }

        return isAsync ? 'Promise<T>' : 'any';
    } catch (e) {
        return 'any';
    }
}