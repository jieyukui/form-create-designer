/**
 * 解析函数的参数签名
 * @param {Function} fn - 函数对象
 * @returns {string} 参数签名字符串
 */
function parseFunctionSignature(fn) {
    if (typeof fn !== 'function') return '()';

    const fnStr = fn.toString();

    // 处理普通函数: function name(a, b) { ... }
    let match = fnStr.match(/function\s*\(([^)]*)\)/);
    if (match) {
        const params = match[1].trim();
        return `(${params})`;
    }

    // 处理箭头函数: (a, b) => ...
    match = fnStr.match(/^\(?([^)=]*)\)?\s*=>/);
    if (match) {
        let params = match[1].trim();
        if (params && !params.includes('(') && params !== '') {
            params = `(${params})`;
        }
        return params || '()';
    }

    // 处理方法定义: method(a, b) { ... }
    match = fnStr.match(/^[\w$]+\s*\(([^)]*)\)/);
    if (match) {
        const params = match[1].trim();
        return `(${params})`;
    }

    return '(...)';
}

/**
 * 尝试推断函数的返回值类型
 * @param {Function} fn - 函数对象
 * @returns {string} 返回值类型
 */
function inferReturnType(fn) {
    if (typeof fn !== 'function') return 'unknown';

    const fnStr = fn.toString();

    // 检查是否是 async 函数
    const isAsync = fnStr.startsWith('async') || /async\s+function/.test(fnStr);

    // 检查常见的返回值模式
    if (fnStr.includes('return Promise')) {
        return isAsync ? 'Promise<any>' : 'Promise<any>';
    }
    if (fnStr.includes('return new Promise')) {
        return 'Promise<T>';
    }
    if (fnStr.includes('return []')) {
        return 'Array<T>';
    }
    if (fnStr.includes('return {}')) {
        return 'object';
    }
    if (fnStr.includes('return ""') || fnStr.includes("return ''")) {
        return 'string';
    }
    if (fnStr.includes('return 0') || fnStr.includes('return 1')) {
        return 'number';
    }
    if (fnStr.includes('return true') || fnStr.includes('return false')) {
        return 'boolean';
    }
    if (fnStr.includes('return null')) {
        return 'null';
    }
    if (fnStr.includes('return undefined')) {
        return 'undefined';
    }

    // 尝试从函数体中找到 return 语句
    const returnMatch = fnStr.match(/return\s+([^;\n]+)/);
    if (returnMatch) {
        const returnExpr = returnMatch[1].trim();
        if (returnExpr === 'this') return 'this';
        if (returnExpr.match(/^new\s+\w+/)) return returnExpr.split(' ')[1];
        if (returnExpr.match(/^\[\]/)) return 'Array';
        if (returnExpr.match(/^\{\}/)) return 'object';
    }

    return isAsync ? 'Promise<T>' : 'any';
}

/**
 * JSDoc 风格的参数描述（预定义常见函数）
 */
const functionDescriptions = {
    // Math 函数
    'Math.abs': { params: ['x: number'], returns: 'number', description: '返回绝对值' },
    'Math.ceil': { params: ['x: number'], returns: 'number', description: '向上取整' },
    'Math.floor': { params: ['x: number'], returns: 'number', description: '向下取整' },
    'Math.round': { params: ['x: number'], returns: 'number', description: '四舍五入' },
    'Math.max': { params: ['...values: number[]'], returns: 'number', description: '返回最大值' },
    'Math.min': { params: ['...values: number[]'], returns: 'number', description: '返回最小值' },
    'Math.random': { params: [], returns: 'number', description: '返回 0-1 之间的随机数' },
    'Math.sqrt': { params: ['x: number'], returns: 'number', description: '返回平方根' },
    'Math.pow': { params: ['base: number', 'exponent: number'], returns: 'number', description: '返回 base 的 exponent 次幂' },
    'Math.sin': { params: ['x: number'], returns: 'number', description: '返回正弦值' },
    'Math.cos': { params: ['x: number'], returns: 'number', description: '返回余弦值' },
    'Math.tan': { params: ['x: number'], returns: 'number', description: '返回正切值' },
    'Math.log': { params: ['x: number'], returns: 'number', description: '返回自然对数' },
    'Math.exp': { params: ['x: number'], returns: 'number', description: '返回 e 的 x 次幂' },

    // console 函数
    'console.log': { params: ['...args: any[]'], returns: 'void', description: '输出日志信息' },
    'console.error': { params: ['...args: any[]'], returns: 'void', description: '输出错误信息' },
    'console.warn': { params: ['...args: any[]'], returns: 'void', description: '输出警告信息' },
    'console.table': { params: ['data: any', 'columns?: string[]'], returns: 'void', description: '以表格形式显示数据' },

    // 全局函数
    'setTimeout': { params: ['handler: Function', 'timeout?: number', '...args: any[]'], returns: 'number', description: '延迟执行函数' },
    'setInterval': { params: ['handler: Function', 'timeout?: number', '...args: any[]'], returns: 'number', description: '定时执行函数' },
    'clearTimeout': { params: ['id: number'], returns: 'void', description: '清除延迟执行' },
    'clearInterval': { params: ['id: number'], returns: 'void', description: '清除定时执行' },
    'fetch': { params: ['input: RequestInfo', 'init?: RequestInit'], returns: 'Promise<Response>', description: '发起网络请求' },
    'parseInt': { params: ['string: string', 'radix?: number'], returns: 'number', description: '解析整数' },
    'parseFloat': { params: ['string: string'], returns: 'number', description: '解析浮点数' },

    // JSON
    'JSON.parse': { params: ['text: string', 'reviver?: Function'], returns: 'any', description: '解析 JSON 字符串' },
    'JSON.stringify': { params: ['value: any', 'replacer?: Function', 'space?: number'], returns: 'string', description: '序列化为 JSON 字符串' },

    // Array
    'Array.isArray': { params: ['value: any'], returns: 'boolean', description: '判断是否为数组' },
    'Array.from': { params: ['arrayLike: ArrayLike<T>', 'mapFn?: Function', 'thisArg?: any'], returns: 'T[]', description: '从类数组对象创建数组' },

    // 常用数组方法
    'Array.prototype.map': { params: ['callback: (value, index, array) => U', 'thisArg?: any'], returns: 'U[]', description: '映射数组' },
    'Array.prototype.filter': { params: ['callback: (value, index, array) => boolean', 'thisArg?: any'], returns: 'T[]', description: '过滤数组' },
    'Array.prototype.reduce': { params: ['callback: (acc, value, index, array) => any', 'initialValue?: any'], returns: 'any', description: '归约数组' },
    'Array.prototype.forEach': { params: ['callback: (value, index, array) => void', 'thisArg?: any'], returns: 'void', description: '遍历数组' },
    'Array.prototype.find': { params: ['callback: (value, index, array) => boolean', 'thisArg?: any'], returns: 'T | undefined', description: '查找元素' },
    'Array.prototype.findIndex': { params: ['callback: (value, index, array) => boolean', 'thisArg?: any'], returns: 'number', description: '查找元素索引' },
    'Array.prototype.includes': { params: ['searchElement: T', 'fromIndex?: number'], returns: 'boolean', description: '判断是否包含' },
    'Array.prototype.push': { params: ['...items: T[]'], returns: 'number', description: '添加元素到末尾' },
    'Array.prototype.pop': { params: [], returns: 'T | undefined', description: '移除并返回末尾元素' },
    'Array.prototype.shift': { params: [], returns: 'T | undefined', description: '移除并返回开头元素' },
    'Array.prototype.unshift': { params: ['...items: T[]'], returns: 'number', description: '添加元素到开头' },
    'Array.prototype.slice': { params: ['start?: number', 'end?: number'], returns: 'T[]', description: '截取数组' },
    'Array.prototype.splice': { params: ['start: number', 'deleteCount?: number', '...items: T[]'], returns: 'T[]', description: '删除/替换元素' },
    'Array.prototype.sort': { params: ['compareFn?: (a: T, b: T) => number'], returns: 'this', description: '排序数组' },
    'Array.prototype.reverse': { params: [], returns: 'this', description: '反转数组' },
    'Array.prototype.join': { params: ['separator?: string'], returns: 'string', description: '连接为字符串' },
    'Array.prototype.concat': { params: ['...items: (T | ConcatArray<T>)[]'], returns: 'T[]', description: '合并数组' },

    // String 方法
    'String.prototype.replace': { params: ['pattern: string | RegExp', 'replacement: string | Function'], returns: 'string', description: '替换字符串' },
    'String.prototype.match': { params: ['regexp: string | RegExp'], returns: 'RegExpMatchArray | null', description: '匹配正则' },
    'String.prototype.split': { params: ['separator: string | RegExp', 'limit?: number'], returns: 'string[]', description: '分割字符串' },
    'String.prototype.substring': { params: ['start: number', 'end?: number'], returns: 'string', description: '提取子串' },
    'String.prototype.slice': { params: ['start: number', 'end?: number'], returns: 'string', description: '提取子串' },
    'String.prototype.trim': { params: [], returns: 'string', description: '去除首尾空格' },
    'String.prototype.toUpperCase': { params: [], returns: 'string', description: '转换为大写' },
    'String.prototype.toLowerCase': { params: [], returns: 'string', description: '转换为小写' },
    'String.prototype.includes': { params: ['searchString: string', 'position?: number'], returns: 'boolean', description: '判断是否包含' },
    'String.prototype.startsWith': { params: ['searchString: string', 'position?: number'], returns: 'boolean', description: '判断是否以某字符串开头' },
    'String.prototype.endsWith': { params: ['searchString: string', 'length?: number'], returns: 'boolean', description: '判断是否以某字符串结尾' },

    // Promise
    'Promise.resolve': { params: ['value: T'], returns: 'Promise<T>', description: '创建已解决的 Promise' },
    'Promise.reject': { params: ['reason?: any'], returns: 'Promise<never>', description: '创建已拒绝的 Promise' },
    'Promise.all': { params: ['promises: Iterable<Promise<T>>'], returns: 'Promise<T[]>', description: '等待所有 Promise 完成' },
    'Promise.race': { params: ['promises: Iterable<Promise<T>>'], returns: 'Promise<T>', description: '返回最先完成的 Promise' },

    // Vue 3 组合式 API
    'ref': { params: ['value: T'], returns: 'Ref<T>', description: '创建响应式引用' },
    'reactive': { params: ['target: T'], returns: 'T', description: '创建响应式对象' },
    'computed': { params: ['getter: () => T', 'options?: { onTrack?, onTrigger? }'], returns: 'ComputedRef<T>', description: '创建计算属性' },
    'watch': { params: ['source: WatchSource<T> | WatchSource<T>[]', 'callback: (newValue, oldValue) => void', 'options?: WatchOptions'], returns: 'StopHandle', description: '监听数据变化' },
    'watchEffect': { params: ['effect: (onInvalidate) => void', 'options?: WatchEffectOptions'], returns: 'StopHandle', description: '立即执行并监听依赖' },
    'onMounted': { params: ['callback: () => void'], returns: 'void', description: '组件挂载后执行' },
    'onUnmounted': { params: ['callback: () => void'], returns: 'void', description: '组件卸载前执行' },
    'nextTick': { params: ['callback?: () => void'], returns: 'Promise<void>', description: '等待下次 DOM 更新' },

    // 类型判断
    'typeof': { params: ['operand: any'], returns: 'string', description: '返回操作数的类型' },
    'instanceof': { params: ['object: any', 'constructor: Function'], returns: 'boolean', description: '检查是否为指定构造函数的实例' }
};

/**
 * 获取函数的完整信息（参数签名 + 返回值 + 描述）
 * @param {string} fullPath - 完整的函数路径，如 "Math.abs"
 * @param {Function} fn - 函数对象
 * @returns {Object} { signature, returnType, description }
 */
function getFunctionFullInfo(fullPath, fn) {
    // 优先使用预定义的信息
    if (functionDescriptions[fullPath]) {
        const info = functionDescriptions[fullPath];
        return {
            signature: `(${info.params.join(', ')}) => ${info.returns}`,
            returnType: info.returns,
            description: info.description,
            params: info.params
        };
    }

    // 动态解析函数信息
    if (typeof fn === 'function') {
        const signature = parseFunctionSignature(fn);
        const returnType = inferReturnType(fn);

        return {
            signature: `${signature} => ${returnType}`,
            returnType: returnType,
            description: '',
            params: []
        };
    }

    return {
        signature: '(...) => unknown',
        returnType: 'unknown',
        description: '',
        params: []
    };
}

/**
 * 获取对象的属性补全项（增强版，支持函数签名）
 */
function getObjectPropertiesWithSignatures(obj, objName) {
    if (!obj || typeof obj !== 'object') return [];

    const props = [];
    const seen = new Set();

    try {
        // 获取对象自身的属性
        const propNames = Object.getOwnPropertyNames(obj);

        for (const prop of propNames) {
            if (seen.has(prop)) continue;
            if (prop.startsWith('_') || prop === 'constructor' || prop === '__proto__') continue;
            seen.add(prop);

            try {
                const value = obj[prop];
                const fullPath = `${objName}.${prop}`;

                if (typeof value === 'function') {
                    const info = getFunctionFullInfo(fullPath, value);
                    props.push({
                        label: prop,
                        type: 'function',
                        detail: info.signature,
                        info: info.description || `${objName}.${prop} 方法`,
                        boost: 10
                    });
                } else if (value && typeof value === 'object') {
                    const propCount = Object.keys(value).length;
                    props.push({
                        label: prop,
                        type: 'class',
                        detail: `{${propCount}}`,
                        info: `${objName}.${prop} - 对象，包含 ${propCount} 个属性`,
                        boost: 5
                    });
                } else {
                    props.push({
                        label: prop,
                        type: typeof value === 'number' ? 'constant' : 'variable',
                        detail: String(value),
                        info: `${objName}.${prop} = ${String(value).substring(0, 50)}`,
                        boost: 3
                    });
                }
            } catch (e) {
                // 忽略无法访问的属性
            }
        }

        // 也获取原型链上的属性
        let proto = Object.getPrototypeOf(obj);
        while (proto && proto !== Object.prototype) {
            const protoProps = Object.getOwnPropertyNames(proto);
            for (const prop of protoProps) {
                if (seen.has(prop)) continue;
                if (prop.startsWith('_') || prop === 'constructor') continue;
                seen.add(prop);

                try {
                    const value = proto[prop];
                    const fullPath = `${objName}.prototype.${prop}`;

                    if (typeof value === 'function') {
                        const info = getFunctionFullInfo(fullPath, value);
                        props.push({
                            label: prop,
                            type: 'function',
                            detail: info.signature,
                            info: info.description || `${objName}.${prop} 方法`,
                            boost: 8
                        });
                    }
                } catch (e) {}
            }
            proto = Object.getPrototypeOf(proto);
        }
    } catch (e) {
        console.warn(`获取 ${objName} 属性失败:`, e);
    }

    return props.sort((a, b) => a.label.localeCompare(b.label));
}

// 内置对象的属性（预定义，用于浏览器环境不可访问时）
const builtinObjectsProperties = {
    Math: () => [
        { label: 'abs', type: 'function', detail: '(x: number) => number', info: '返回绝对值', boost: 10 },
        { label: 'ceil', type: 'function', detail: '(x: number) => number', info: '向上取整', boost: 10 },
        { label: 'floor', type: 'function', detail: '(x: number) => number', info: '向下取整', boost: 10 },
        { label: 'round', type: 'function', detail: '(x: number) => number', info: '四舍五入', boost: 10 },
        { label: 'max', type: 'function', detail: '(...values: number[]) => number', info: '返回最大值', boost: 10 },
        { label: 'min', type: 'function', detail: '(...values: number[]) => number', info: '返回最小值', boost: 10 },
        { label: 'random', type: 'function', detail: '() => number', info: '返回 0-1 之间的随机数', boost: 10 },
        { label: 'sqrt', type: 'function', detail: '(x: number) => number', info: '返回平方根', boost: 10 },
        { label: 'pow', type: 'function', detail: '(base: number, exponent: number) => number', info: '返回 base 的 exponent 次幂', boost: 10 },
        { label: 'sin', type: 'function', detail: '(x: number) => number', info: '返回正弦值', boost: 10 },
        { label: 'cos', type: 'function', detail: '(x: number) => number', info: '返回余弦值', boost: 10 },
        { label: 'tan', type: 'function', detail: '(x: number) => number', info: '返回正切值', boost: 10 },
        { label: 'log', type: 'function', detail: '(x: number) => number', info: '返回自然对数', boost: 10 },
        { label: 'exp', type: 'function', detail: '(x: number) => number', info: '返回 e 的 x 次幂', boost: 10 },
        { label: 'PI', type: 'constant', detail: '3.141592653589793', info: '圆周率 π', boost: 10 },
        { label: 'E', type: 'constant', detail: '2.718281828459045', info: '自然对数的底数 e', boost: 10 }
    ],
    console: () => [
        { label: 'log', type: 'function', detail: '(...args: any[]) => void', info: '输出日志信息', boost: 10 },
        { label: 'error', type: 'function', detail: '(...args: any[]) => void', info: '输出错误信息', boost: 10 },
        { label: 'warn', type: 'function', detail: '(...args: any[]) => void', info: '输出警告信息', boost: 10 },
        { label: 'info', type: 'function', detail: '(...args: any[]) => void', info: '输出信息', boost: 10 },
        { label: 'table', type: 'function', detail: '(data: any, columns?: string[]) => void', info: '以表格形式显示数据', boost: 10 },
        { label: 'time', type: 'function', detail: '(label?: string) => void', info: '启动计时器', boost: 10 },
        { label: 'timeEnd', type: 'function', detail: '(label?: string) => void', info: '停止计时器', boost: 10 },
        { label: 'clear', type: 'function', detail: '() => void', info: '清空控制台', boost: 10 }
    ],
    JSON: () => [
        { label: 'parse', type: 'function', detail: '(text: string, reviver?: Function) => any', info: '解析 JSON 字符串', boost: 10 },
        { label: 'stringify', type: 'function', detail: '(value: any, replacer?: Function, space?: number) => string', info: '序列化为 JSON 字符串', boost: 10 }
    ]
};

/**
 * 获取对象属性（支持预定义和动态获取）
 */
function getObjectCompletionsWithSignatures(objectName, realObject = null) {
    // 优先使用预定义
    if (builtinObjectsProperties[objectName]) {
        return builtinObjectsProperties[objectName]();
    }

    // 动态获取
    if (realObject && typeof realObject === 'object') {
        return getObjectPropertiesWithSignatures(realObject, objectName);
    }

    return [];
}

/**
 * 创建对象属性补全源（支持函数签名）
 */
function createObjectPropertyCompletionWithSignatures(context) {
    const cursor = context.pos;

    // 查找光标前的节点，判断是否在对象属性访问中
    let before = context.state.sliceDoc(Math.max(0, cursor - 200), cursor);
    let match = before.match(/([\w$.]+)\.(\w*)$/);

    if (match) {
        let [, objectPath, partialProp] = match;

        // 获取对象名（最后一部分）
        const objectName = objectPath.split('.').pop();

        // 尝试获取真实对象
        let realObject = null;
        try {
            // 动态解析对象路径
            if (typeof window !== 'undefined') {
                let current = window;
                const parts = objectPath.split('.');
                for (const part of parts) {
                    if (current && part in current) {
                        current = current[part];
                    } else {
                        current = null;
                        break;
                    }
                }
                realObject = current;
            }
        } catch (e) {
            // 忽略错误
        }

        // 获取对象的补全项
        let completions = getObjectCompletionsWithSignatures(objectName, realObject);

        // 如果有部分输入，进行过滤
        if (partialProp) {
            completions = completions.filter(c =>
                c.label.toLowerCase().startsWith(partialProp.toLowerCase())
            );
        }

        if (completions.length > 0) {
            return {
                from: cursor - partialProp.length,
                options: completions,
                validFor: /^\w*$/
            };
        }
    }

    return null;
}

/**
 * 创建全局变量补全源（支持函数签名）
 */
function createGlobalCompletionWithSignatures(scope, options = {}) {
    const { customCompletions = [] } = options;

    // 全局补全项
    const globalCompletions = [];

    // 添加预定义的内置对象
    const builtinNames = [
        'Math',
        'console',
        'JSON',
        'Array',
        'Object',
        'String',
        'Number',
        'Boolean',
        'Date',
        'RegExp',
        'Promise',
        'Map',
        'Set',
        'document',
        'localStorage',
        'sessionStorage',
        'location'
    ];

    for (const name of builtinNames) {
        let realObject = null;
        try {
            if (scope && name in scope) realObject = scope[name];
            else if (typeof Math !== 'undefined' && name === 'Math') realObject = Math;
            else if (typeof JSON !== 'undefined' && name === 'JSON') realObject = JSON;
            else if (typeof console !== 'undefined' && name === 'console') realObject = console;
        } catch (e) {}

        if (realObject) {
            const info = getFunctionFullInfo(name, realObject);
            globalCompletions.push({
                label: name,
                type: 'class',
                detail: info.signature || 'object',
                info: `${name} 内置对象`,
                boost: 100
            });
        } else {
            globalCompletions.push({
                label: name,
                type: 'class',
                detail: 'object',
                info: `${name} 内置对象`,
                boost: 100
            });
        }
    }

    // 添加自定义补全项
    for (const comp of customCompletions) {
        if (!globalCompletions.some(g => g.label === comp.label)) {
            globalCompletions.push({ ...comp, boost: 200 });
        }
    }

    return (context) => {
        const before = context.matchBefore(/\w*/);
        if (!before || (before.from === before.to && !context.explicit)) return null;

        const word = before.text;
        const matched = globalCompletions.filter(c =>
            c.label.toLowerCase().startsWith(word.toLowerCase())
        );

        matched.sort((a, b) => (b.boost || 0) - (a.boost || 0));

        if (matched.length === 0) return null;

        return {
            from: before.from,
            options: matched.map(c => ({
                label: c.label,
                type: c.type,
                detail: c.detail,
                info: c.info
            })),
            validFor: /^\w*$/
        };
    };
}

/**
 * 创建完整的 JavaScript 补全配置（支持函数签名和返回值）
 */
export function setupJavaScriptCompletions(options = {}) {
    const {
        scope = typeof window !== 'undefined' ? window : null,
        customCompletions = []
    } = options;

    const sources = [];

    // 1. 全局变量补全源
    sources.push(createGlobalCompletionWithSignatures(scope, { customCompletions }));

    // 2. 对象属性补全源（支持函数签名）
    sources.push(createObjectPropertyCompletionWithSignatures);

    return sources;
}

/**
 * 简化的配置：直接返回 autocompletion 的配置对象
 */
export function getAutocompletionConfig(options = {}) {
    const sources = setupJavaScriptCompletions(options);

    return {
        activateOnTyping: true,
        defaultKeymap: true,
        override: sources
    };
}