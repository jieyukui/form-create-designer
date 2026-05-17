好的，开始逐一实现所有文件。我会按照从底层到上层的顺序来写。

---

## 1. `completion/core/environment.js` - 环境检测

```javascript
// completion/core/environment.js

/**
 * 环境类型枚举
 */
export const EnvironmentType = {
    BROWSER: 'browser',
    NODE: 'node',
    WORKER: 'worker',
    SERVICE_WORKER: 'service_worker',
    SSR: 'ssr',          // 服务端渲染
    UNKNOWN: 'unknown'
};

/**
 * 检测当前运行环境
 * @returns {{
 *   type: string,
 *   isBrowser: boolean,
 *   isNode: boolean,
 *   isWorker: boolean,
 *   isServiceWorker: boolean,
 *   isSSR: boolean,
 *   hasDOM: boolean,
 *   hasWindow: boolean,
 *   hasDocument: boolean,
 *   hasLocalStorage: boolean,
 *   hasSessionStorage: boolean,
 *   hasNavigator: boolean,
 *   hasFetch: boolean,
 *   hasWebSocket: boolean,
 *   hasIndexedDB: boolean,
 *   hasCrypto: boolean,
 *   hasWorker: boolean,
 *   hasPerformance: boolean,
 *   hasMutationObserver: boolean,
 *   hasIntersectionObserver: boolean,
 *   hasResizeObserver: boolean,
 *   hasClipboard: boolean,
 *   hasNotification: boolean,
 *   hasGeolocation: boolean,
 *   hasBluetooth: boolean,
 *   hasUSB: boolean,
 *   hasFileAPI: boolean,
 *   hasReadableStream: boolean,
 *   hasAbortController: boolean,
 *   hasCustomElements: boolean,
 *   hasPaymentRequest: boolean,
 *   hasXRSystem: boolean,
 *   hasWakeLock: boolean,
 *   hasKeyboard: boolean,
 *   hasScheduler: boolean,
 *   hasBroadcastChannel: boolean,
 *   hasCache: boolean,
 *   hasIntl: boolean,
 *   hasBigInt: boolean,
 *   hasProxy: boolean,
 *   hasSymbol: boolean,
 *   features: string[]
 * }}
 */
export function detectEnvironment() {
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    const isWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    const isServiceWorker = typeof ServiceWorkerGlobalScope !== 'undefined' && self instanceof ServiceWorkerGlobalScope;
    const isSSR = typeof window !== 'undefined' && typeof document !== 'undefined' && 
                  typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

    let type = EnvironmentType.UNKNOWN;
    if (isServiceWorker) type = EnvironmentType.SERVICE_WORKER;
    else if (isWorker) type = EnvironmentType.WORKER;
    else if (isSSR) type = EnvironmentType.SSR;
    else if (isBrowser) type = EnvironmentType.BROWSER;
    else if (isNode) type = EnvironmentType.NODE;

    // 检测各种 API 的可用性
    const features = detectFeatures();

    return {
        type,
        isBrowser,
        isNode,
        isWorker,
        isServiceWorker,
        isSSR,
        ...features
    };
}

/**
 * 检测各种浏览器 API 的可用性
 */
function detectFeatures() {
    const features = [];

    const hasWindow = typeof window !== 'undefined';
    const hasDocument = typeof document !== 'undefined';
    const hasNavigator = typeof navigator !== 'undefined';

    const hasLocalStorage = safeCheck(() => typeof localStorage !== 'undefined');
    const hasSessionStorage = safeCheck(() => typeof sessionStorage !== 'undefined');
    const hasFetch = safeCheck(() => typeof fetch === 'function');
    const hasWebSocket = safeCheck(() => typeof WebSocket !== 'undefined');
    const hasIndexedDB = safeCheck(() => typeof indexedDB !== 'undefined');
    const hasCrypto = safeCheck(() => typeof crypto !== 'undefined');
    const hasWorker = safeCheck(() => typeof Worker !== 'undefined');
    const hasPerformance = safeCheck(() => typeof performance !== 'undefined');
    const hasMutationObserver = safeCheck(() => typeof MutationObserver !== 'undefined');
    const hasIntersectionObserver = safeCheck(() => typeof IntersectionObserver !== 'undefined');
    const hasResizeObserver = safeCheck(() => typeof ResizeObserver !== 'undefined');
    const hasClipboard = safeCheck(() => typeof Clipboard !== 'undefined' || (hasNavigator && typeof navigator.clipboard !== 'undefined'));
    const hasNotification = safeCheck(() => typeof Notification !== 'undefined');
    const hasGeolocation = safeCheck(() => hasNavigator && typeof navigator.geolocation !== 'undefined');
    const hasBluetooth = safeCheck(() => hasNavigator && typeof navigator.bluetooth !== 'undefined');
    const hasUSB = safeCheck(() => hasNavigator && typeof navigator.usb !== 'undefined');
    const hasFileAPI = safeCheck(() => typeof File !== 'undefined' && typeof FileReader !== 'undefined');
    const hasReadableStream = safeCheck(() => typeof ReadableStream !== 'undefined');
    const hasAbortController = safeCheck(() => typeof AbortController !== 'undefined');
    const hasCustomElements = safeCheck(() => typeof customElements !== 'undefined');
    const hasPaymentRequest = safeCheck(() => typeof PaymentRequest !== 'undefined');
    const hasXRSystem = safeCheck(() => hasNavigator && typeof navigator.xr !== 'undefined');
    const hasWakeLock = safeCheck(() => hasNavigator && typeof navigator.wakeLock !== 'undefined');
    const hasKeyboard = safeCheck(() => hasNavigator && typeof navigator.keyboard !== 'undefined');
    const hasScheduler = safeCheck(() => typeof scheduler !== 'undefined');
    const hasBroadcastChannel = safeCheck(() => typeof BroadcastChannel !== 'undefined');
    const hasCache = safeCheck(() => typeof caches !== 'undefined');
    const hasIntl = safeCheck(() => typeof Intl !== 'undefined');
    const hasBigInt = safeCheck(() => typeof BigInt !== 'undefined');
    const hasProxy = safeCheck(() => typeof Proxy !== 'undefined');
    const hasSymbol = safeCheck(() => typeof Symbol !== 'undefined');

    // 收集可用特性
    if (hasLocalStorage) features.push('localStorage');
    if (hasSessionStorage) features.push('sessionStorage');
    if (hasFetch) features.push('fetch');
    if (hasWebSocket) features.push('WebSocket');
    if (hasIndexedDB) features.push('indexedDB');
    if (hasCrypto) features.push('crypto');
    if (hasWorker) features.push('Worker');
    if (hasPerformance) features.push('performance');
    if (hasMutationObserver) features.push('MutationObserver');
    if (hasIntersectionObserver) features.push('IntersectionObserver');
    if (hasResizeObserver) features.push('ResizeObserver');
    if (hasClipboard) features.push('clipboard');
    if (hasNotification) features.push('Notification');
    if (hasGeolocation) features.push('geolocation');
    if (hasBluetooth) features.push('bluetooth');
    if (hasUSB) features.push('USB');
    if (hasFileAPI) features.push('FileAPI');
    if (hasReadableStream) features.push('ReadableStream');
    if (hasAbortController) features.push('AbortController');
    if (hasCustomElements) features.push('customElements');
    if (hasBroadcastChannel) features.push('BroadcastChannel');
    if (hasCache) features.push('caches');

    return {
        hasWindow,
        hasDocument,
        hasLocalStorage,
        hasSessionStorage,
        hasNavigator,
        hasFetch,
        hasWebSocket,
        hasIndexedDB,
        hasCrypto,
        hasWorker,
        hasPerformance,
        hasMutationObserver,
        hasIntersectionObserver,
        hasResizeObserver,
        hasClipboard,
        hasNotification,
        hasGeolocation,
        hasBluetooth,
        hasUSB,
        hasFileAPI,
        hasReadableStream,
        hasAbortController,
        hasCustomElements,
        hasPaymentRequest,
        hasXRSystem,
        hasWakeLock,
        hasKeyboard,
        hasScheduler,
        hasBroadcastChannel,
        hasCache,
        hasIntl,
        hasBigInt,
        hasProxy,
        hasSymbol,
        features
    };
}

/**
 * 安全地检查表达式
 */
function safeCheck(fn) {
    try {
        return !!fn();
    } catch (e) {
        return false;
    }
}

/**
 * 获取安全的全局作用域引用
 * @returns {object | null}
 */
export function getGlobalScope() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    if (typeof self !== 'undefined') return self;
    return null;
}

/**
 * 获取 window 作用域（仅在浏览器环境）
 * @returns {object | null}
 */
export function getWindowScope() {
    try {
        if (typeof window !== 'undefined') return window;
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * 创建环境相关的缓存键
 */
export function createEnvironmentCacheKey() {
    const env = detectEnvironment();
    return `${env.type}_${env.features.sort().join('_')}`;
}
```

---

## 2. `completion/core/cache.js` - 缓存策略

```javascript
// completion/core/cache.js

/**
 * 缓存项
 * @typedef {Object} CacheEntry
 * @property {*} value - 缓存的值
 * @property {number} timestamp - 创建时间戳
 * @property {number} ttl - 过期时间（毫秒）
 * @property {string[]} dependencies - 依赖项列表
 */

/**
 * 智能缓存管理器
 * 支持：
 * - TTL 过期机制
 * - 依赖追踪
 * - LRU 淘汰策略
 * - 手动失效
 * - 环境变化感知
 */
export class CompletionCache {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 500;
        this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5分钟
        this.cache = new Map();
        this.dependencyMap = new Map(); // dep -> Set<keys>
        this.accessOrder = []; // LRU 顺序
        this.environmentVersion = 0;
    }

    /**
     * 获取缓存
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // 检查 TTL
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return null;
        }

        // 更新 LRU
        this._touch(key);
        return entry.value;
    }

    /**
     * 设置缓存
     */
    set(key, value, options = {}) {
        const ttl = options.ttl || this.defaultTTL;
        const dependencies = options.dependencies || [];

        // LRU 淘汰
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this._evictLRU();
        }

        const entry = {
            value,
            timestamp: Date.now(),
            ttl,
            dependencies
        };

        this.cache.set(key, entry);
        this._touch(key);

        // 建立依赖关系
        for (const dep of dependencies) {
            if (!this.dependencyMap.has(dep)) {
                this.dependencyMap.set(dep, new Set());
            }
            this.dependencyMap.get(dep).add(key);
        }
    }

    /**
     * 删除缓存
     */
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry) return;

        // 清理依赖关系
        for (const dep of entry.dependencies) {
            const set = this.dependencyMap.get(dep);
            if (set) {
                set.delete(key);
                if (set.size === 0) {
                    this.dependencyMap.delete(dep);
                }
            }
        }

        this.cache.delete(key);
        this._removeFromOrder(key);
    }

    /**
     * 按依赖失效
     */
    invalidateByDependency(dep) {
        const dependentKeys = this.dependencyMap.get(dep);
        if (dependentKeys) {
            for (const key of dependentKeys) {
                this.delete(key);
            }
        }
        this.dependencyMap.delete(dep);
    }

    /**
     * 标记环境版本变化（如运行时新增了对象）
     */
    incrementEnvironmentVersion() {
        this.environmentVersion++;
        
        // 失效依赖环境版本的缓存
        this.invalidateByDependency('environment');
    }

    /**
     * 清空所有缓存
     */
    clear() {
        this.cache.clear();
        this.dependencyMap.clear();
        this.accessOrder = [];
    }

    /**
     * 检查缓存是否存在且有效
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * 获取缓存统计
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            environmentVersion: this.environmentVersion,
            activeDependencies: this.dependencyMap.size
        };
    }

    /**
     * 使用缓存包装函数调用
     * @param {string} key - 缓存键
     * @param {Function} fn - 获取数据的函数
     * @param {Object} options - 缓存选项
     */
    memoize(key, fn, options = {}) {
        const cached = this.get(key);
        if (cached !== null) return cached;

        const result = fn();
        this.set(key, result, options);
        return result;
    }

    // 私有方法
    _touch(key) {
        this._removeFromOrder(key);
        this.accessOrder.push(key);
    }

    _removeFromOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index !== -1) {
            this.accessOrder.splice(index, 1);
        }
    }

    _evictLRU() {
        const lruKey = this.accessOrder.shift();
        if (lruKey) {
            this.delete(lruKey);
        }
    }
}

/**
 * 创建全局缓存实例
 */
export const globalCompletionCache = new CompletionCache();
```

---

## 3. `completion/core/priority.js` - 优先级管理

```javascript
// completion/core/priority.js

/**
 * 补全优先级常量
 */
export const Priority = {
    // 用户自定义（最高优先级）
    USER_CUSTOM_OBJECT: 1000,
    USER_CUSTOM_GLOBAL: 999,
    USER_CUSTOM_SIGNATURE: 998,

    // 预定义内置（中优先级）
    PREDEFINED_BUILTIN: 500,
    PREDEFINED_PROTOTYPE: 490,
    PREDEFINED_GLOBAL: 480,

    // 作用域感知
    LOCAL_VARIABLE: 700,        // 局部变量（由其他系统提供）
    LOCAL_FUNCTION: 690,

    // 运行时解析（低优先级 - 兜底）
    RUNTIME_WINDOW_PROPERTY: 200,
    RUNTIME_PROTOTYPE_CHAIN: 190,
    RUNTIME_GENERIC: 100,

    // 最低优先级
    FALLBACK: 50
};

/**
 * 补全源配置
 * @typedef {Object} SourceConfig
 * @property {string} name - 源名称
 * @property {number} priority - 优先级
 * @property {Function} sourceFn - 补全源函数
 * @property {boolean} enabled - 是否启用
 * @property {string[]} requires - 依赖的环境特性
 */

/**
 * 补全源管理器
 * 管理多个补全源，按优先级排序，支持动态启用/禁用
 */
export class CompletionSourceManager {
    constructor() {
        this.sources = [];
    }

    /**
     * 注册补全源
     * @param {SourceConfig} config
     */
    register(config) {
        // 移除已存在的同名源
        this.unregister(config.name);

        this.sources.push({
            ...config,
            enabled: config.enabled !== false
        });

        // 按优先级降序排序
        this.sources.sort((a, b) => b.priority - a.priority);
    }

    /**
     * 注销补全源
     */
    unregister(name) {
        const index = this.sources.findIndex(s => s.name === name);
        if (index !== -1) {
            this.sources.splice(index, 1);
        }
    }

    /**
     * 启用/禁用补全源
     */
    setEnabled(name, enabled) {
        const source = this.sources.find(s => s.name === name);
        if (source) {
            source.enabled = enabled;
        }
    }

    /**
     * 根据环境特性过滤启用的源
     * @param {Object} environment - 环境检测结果
     */
    filterByEnvironment(environment) {
        return this.sources.filter(source => {
            if (!source.enabled) return false;
            if (!source.requires || source.requires.length === 0) return true;

            return source.requires.every(req => {
                // 检查环境特性
                if (req.startsWith('has')) {
                    return environment[req] === true;
                }
                if (req.startsWith('!has')) {
                    return environment[req.substring(1)] === false;
                }
                // 检查类型匹配
                if (req.startsWith('type:')) {
                    return environment.type === req.substring(5);
                }
                if (req.startsWith('!type:')) {
                    return environment.type !== req.substring(6);
                }
                return true;
            });
        });
    }

    /**
     * 获取排序后的生效补全源函数列表
     * @param {Object} environment - 环境检测结果
     */
    getActiveSources(environment) {
        return this.filterByEnvironment(environment)
            .map(source => source.sourceFn);
    }

    /**
     * 获取所有注册的源信息（用于调试）
     */
    getDebugInfo() {
        return this.sources.map(s => ({
            name: s.name,
            priority: s.priority,
            enabled: s.enabled,
            requires: s.requires
        }));
    }
}
```

---

## 4. `completion/data/builtin/math.js`

```javascript
// completion/data/builtin/math.js

export const mathCompletions = [
    // 方法
    { label: 'abs', type: 'function', detail: '(x: number) => number', info: '返回绝对值' },
    { label: 'ceil', type: 'function', detail: '(x: number) => number', info: '向上取整' },
    { label: 'floor', type: 'function', detail: '(x: number) => number', info: '向下取整' },
    { label: 'round', type: 'function', detail: '(x: number) => number', info: '四舍五入' },
    { label: 'max', type: 'function', detail: '(...values: number[]) => number', info: '返回最大值' },
    { label: 'min', type: 'function', detail: '(...values: number[]) => number', info: '返回最小值' },
    { label: 'random', type: 'function', detail: '() => number', info: '返回 0-1 之间的随机数' },
    { label: 'sqrt', type: 'function', detail: '(x: number) => number', info: '返回平方根' },
    { label: 'pow', type: 'function', detail: '(base: number, exponent: number) => number', info: '返回 base 的 exponent 次幂' },
    { label: 'sin', type: 'function', detail: '(x: number) => number', info: '返回正弦值' },
    { label: 'cos', type: 'function', detail: '(x: number) => number', info: '返回余弦值' },
    { label: 'tan', type: 'function', detail: '(x: number) => number', info: '返回正切值' },
    { label: 'asin', type: 'function', detail: '(x: number) => number', info: '返回反正弦值' },
    { label: 'acos', type: 'function', detail: '(x: number) => number', info: '返回反余弦值' },
    { label: 'atan', type: 'function', detail: '(x: number) => number', info: '返回反正切值' },
    { label: 'atan2', type: 'function', detail: '(y: number, x: number) => number', info: '返回从 x 轴到点 (x,y) 的角度' },
    { label: 'exp', type: 'function', detail: '(x: number) => number', info: '返回 e 的 x 次幂' },
    { label: 'log', type: 'function', detail: '(x: number) => number', info: '返回自然对数' },
    { label: 'log10', type: 'function', detail: '(x: number) => number', info: '返回以 10 为底的对数' },
    { label: 'cbrt', type: 'function', detail: '(x: number) => number', info: '返回立方根' },
    { label: 'hypot', type: 'function', detail: '(...values: number[]) => number', info: '返回平方和的平方根' },
    { label: 'trunc', type: 'function', detail: '(x: number) => number', info: '返回整数部分' },
    { label: 'sign', type: 'function', detail: '(x: number) => number', info: '返回符号函数' },
    { label: 'clz32', type: 'function', detail: '(x: number) => number', info: '返回 32 位整数前导零的数量' },
    { label: 'imul', type: 'function', detail: '(a: number, b: number) => number', info: '返回 32 位整数乘法结果' },
    { label: 'fround', type: 'function', detail: '(x: number) => number', info: '返回最接近的 32 位浮点数' },

    // 常量
    { label: 'PI', type: 'constant', detail: '3.141592653589793', info: '圆周率 π' },
    { label: 'E', type: 'constant', detail: '2.718281828459045', info: '自然对数的底数 e' },
    { label: 'LN2', type: 'constant', detail: '0.6931471805599453', info: '2 的自然对数' },
    { label: 'LN10', type: 'constant', detail: '2.302585092994046', info: '10 的自然对数' },
    { label: 'LOG2E', type: 'constant', detail: '1.4426950408889634', info: '以 2 为底 e 的对数' },
    { label: 'LOG10E', type: 'constant', detail: '0.4342944819032518', info: '以 10 为底 e 的对数' },
    { label: 'SQRT1_2', type: 'constant', detail: '0.7071067811865476', info: '1/2 的平方根' },
    { label: 'SQRT2', type: 'constant', detail: '1.4142135623730951', info: '2 的平方根' }
];
```

---

由于代码量很大，我继续快速实现剩余的关键文件。为节省篇幅，我会将相似结构的数据文件合并展示，重点展示核心逻辑文件。

---

## 5. `completion/data/builtin/index.js` - 数据汇总与环境感知

```javascript
// completion/data/builtin/index.js

import { mathCompletions } from './math';

/**
 * 内置对象补全数据
 * 
 * 每个对象定义包含：
 * - completions: 补全项数组
 * - requires: 环境依赖特性（可选，默认总是可用）
 * - globalAlias: 全局变量名（同时也是 window 的属性名）
 */
export const builtinDataRegistry = {
    Math: {
        completions: mathCompletions,
        requires: [], // Math 在所有 JS 环境都可用
    },
    console: {
        completions: [
            { label: 'log', type: 'function', detail: '(...args: any[]) => void', info: '输出日志信息' },
            { label: 'error', type: 'function', detail: '(...args: any[]) => void', info: '输出错误信息' },
            { label: 'warn', type: 'function', detail: '(...args: any[]) => void', info: '输出警告信息' },
            { label: 'info', type: 'function', detail: '(...args: any[]) => void', info: '输出信息' },
            { label: 'debug', type: 'function', detail: '(...args: any[]) => void', info: '输出调试信息' },
            { label: 'table', type: 'function', detail: '(data: any, columns?: string[]) => void', info: '以表格形式显示数据' },
            { label: 'time', type: 'function', detail: '(label?: string) => void', info: '启动计时器' },
            { label: 'timeEnd', type: 'function', detail: '(label?: string) => void', info: '停止计时器' },
            { label: 'timeLog', type: 'function', detail: '(label?: string, ...args: any[]) => void', info: '输出中间计时' },
            { label: 'group', type: 'function', detail: '(label?: string) => void', info: '创建分组' },
            { label: 'groupEnd', type: 'function', detail: '() => void', info: '结束分组' },
            { label: 'groupCollapsed', type: 'function', detail: '(label?: string) => void', info: '创建折叠分组' },
            { label: 'clear', type: 'function', detail: '() => void', info: '清空控制台' },
            { label: 'count', type: 'function', detail: '(label?: string) => void', info: '计数器' },
            { label: 'countReset', type: 'function', detail: '(label?: string) => void', info: '重置计数器' },
            { label: 'dir', type: 'function', detail: '(item: any) => void', info: '显示对象属性' },
            { label: 'dirxml', type: 'function', detail: '(item: any) => void', info: '显示 XML/HTML 元素' },
            { label: 'trace', type: 'function', detail: '() => void', info: '输出堆栈跟踪' },
            { label: 'assert', type: 'function', detail: '(condition: boolean, ...args: any[]) => void', info: '条件断言' },
        ],
        requires: [], // console 在所有现代环境都可用
    },
    JSON: {
        completions: [
            { label: 'parse', type: 'function', detail: '(text: string, reviver?: Function) => any', info: '解析 JSON 字符串' },
            { label: 'stringify', type: 'function', detail: '(value: any, replacer?: Function, space?: number) => string', info: '序列化为 JSON 字符串' },
        ],
        requires: [],
    },
    Array: {
        completions: [
            { label: 'isArray', type: 'function', detail: '(value: any) => boolean', info: '判断是否为数组' },
            { label: 'from', type: 'function', detail: '(arrayLike: ArrayLike<T>, mapFn?: Function, thisArg?: any) => T[]', info: '从类数组对象创建数组' },
            { label: 'of', type: 'function', detail: '(...items: T[]) => T[]', info: '从参数创建数组' },
        ],
        requires: [],
    },
    Object: {
        completions: [
            { label: 'keys', type: 'function', detail: '(obj: object) => string[]', info: '返回对象自身的可枚举属性名' },
            { label: 'values', type: 'function', detail: '(obj: object) => any[]', info: '返回对象自身的可枚举属性值' },
            { label: 'entries', type: 'function', detail: '(obj: object) => [string, any][]', info: '返回键值对数组' },
            { label: 'assign', type: 'function', detail: '(target: T, ...sources: any[]) => T', info: '合并对象' },
            { label: 'create', type: 'function', detail: '(proto: object | null, properties?: PropertyDescriptorMap) => object', info: '创建新对象' },
            { label: 'defineProperty', type: 'function', detail: '(obj: object, prop: string, descriptor: PropertyDescriptor) => object', info: '定义属性' },
            { label: 'defineProperties', type: 'function', detail: '(obj: object, props: PropertyDescriptorMap) => object', info: '定义多个属性' },
            { label: 'freeze', type: 'function', detail: '(obj: T) => T', info: '冻结对象' },
            { label: 'seal', type: 'function', detail: '(obj: T) => T', info: '密封对象' },
            { label: 'preventExtensions', type: 'function', detail: '(obj: T) => T', info: '阻止扩展' },
            { label: 'isFrozen', type: 'function', detail: '(obj: object) => boolean', info: '检查是否冻结' },
            { label: 'isSealed', type: 'function', detail: '(obj: object) => boolean', info: '检查是否密封' },
            { label: 'isExtensible', type: 'function', detail: '(obj: object) => boolean', info: '检查是否可扩展' },
            { label: 'getOwnPropertyDescriptor', type: 'function', detail: '(obj: object, prop: string) => PropertyDescriptor | undefined', info: '获取属性描述符' },
            { label: 'getOwnPropertyDescriptors', type: 'function', detail: '(obj: object) => PropertyDescriptorMap', info: '获取所有属性描述符' },
            { label: 'getOwnPropertyNames', type: 'function', detail: '(obj: object) => string[]', info: '获取自身属性名（含不可枚举）' },
            { label: 'getOwnPropertySymbols', type: 'function', detail: '(obj: object) => symbol[]', info: '获取自身 Symbol 属性' },
            { label: 'getPrototypeOf', type: 'function', detail: '(obj: object) => object | null', info: '获取原型对象' },
            { label: 'setPrototypeOf', type: 'function', detail: '(obj: object, proto: object | null) => object', info: '设置原型对象' },
            { label: 'is', type: 'function', detail: '(value1: any, value2: any) => boolean', info: '判断两个值是否相同' },
        ],
        requires: [],
    },
    String: {
        completions: [
            { label: 'fromCharCode', type: 'function', detail: '(...codes: number[]) => string', info: '从 Unicode 编码创建字符串' },
            { label: 'fromCodePoint', type: 'function', detail: '(...codePoints: number[]) => string', info: '从码点创建字符串' },
            { label: 'raw', type: 'function', detail: '(template: TemplateStringsArray, ...substitutions: any[]) => string', info: '获取原始字符串' },
        ],
        requires: [],
    },
    Number: {
        completions: [
            { label: 'isFinite', type: 'function', detail: '(value: any) => boolean', info: '判断是否为有限数' },
            { label: 'isInteger', type: 'function', detail: '(value: any) => boolean', info: '判断是否为整数' },
            { label: 'isNaN', type: 'function', detail: '(value: any) => boolean', info: '判断是否为 NaN' },
            { label: 'isSafeInteger', type: 'function', detail: '(value: any) => boolean', info: '判断是否为安全整数' },
            { label: 'parseFloat', type: 'function', detail: '(value: string) => number', info: '解析浮点数' },
            { label: 'parseInt', type: 'function', detail: '(value: string, radix?: number) => number', info: '解析整数' },
            { label: 'EPSILON', type: 'constant', detail: '2.220446049250313e-16', info: '最小精度值' },
            { label: 'MAX_VALUE', type: 'constant', detail: '1.7976931348623157e+308', info: '最大数值' },
            { label: 'MIN_VALUE', type: 'constant', detail: '5e-324', info: '最小正数值' },
            { label: 'MAX_SAFE_INTEGER', type: 'constant', detail: '9007199254740991', info: '最大安全整数' },
            { label: 'MIN_SAFE_INTEGER', type: 'constant', detail: '-9007199254740991', info: '最小安全整数' },
            { label: 'NaN', type: 'constant', detail: 'NaN', info: '非数值' },
            { label: 'NEGATIVE_INFINITY', type: 'constant', detail: '-Infinity', info: '负无穷大' },
            { label: 'POSITIVE_INFINITY', type: 'constant', detail: 'Infinity', info: '正无穷大' },
        ],
        requires: [],
    },
    Boolean: {
        completions: [],
        requires: [],
    },
    Date: {
        completions: [
            { label: 'now', type: 'function', detail: '() => number', info: '返回当前时间戳' },
            { label: 'parse', type: 'function', detail: '(dateString: string) => number', info: '解析日期字符串' },
            { label: 'UTC', type: 'function', detail: '(year: number, month: number, ...args: number[]) => number', info: '返回 UTC 时间戳' },
        ],
        requires: [],
    },
    RegExp: {
        completions: [
            { label: 'lastIndex', type: 'property', detail: 'number', info: '下次匹配的起始索引' },
        ],
        requires: [],
    },
    Promise: {
        completions: [
            { label: 'resolve', type: 'function', detail: '<T>(value: T) => Promise<T>', info: '创建已解决的 Promise' },
            { label: 'reject', type: 'function', detail: '<T = never>(reason?: any) => Promise<T>', info: '创建已拒绝的 Promise' },
            { label: 'all', type: 'function', detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T[]>', info: '等待所有 Promise 完成' },
            { label: 'race', type: 'function', detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T>', info: '返回最先完成的 Promise' },
            { label: 'allSettled', type: 'function', detail: '<T>(promises: Iterable<Promise<T>>) => Promise<PromiseSettledResult<T>[]>', info: '等待所有 Promise 完成（无论成功或失败）' },
            { label: 'any', type: 'function', detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T>', info: '返回第一个成功的 Promise' },
            { label: 'withResolvers', type: 'function', detail: '() => { promise: Promise<T>, resolve: Function, reject: Function }', info: '创建带控制器的 Promise' },
        ],
        requires: [],
    },
    Map: {
        completions: [],
        requires: [],
    },
    Set: {
        completions: [],
        requires: [],
    },
    WeakMap: {
        completions: [],
        requires: [],
    },
    WeakSet: {
        completions: [],
        requires: [],
    },
    Symbol: {
        completions: [
            { label: 'iterator', type: 'constant', detail: 'symbol', info: '默认迭代器符号' },
            { label: 'asyncIterator', type: 'constant', detail: 'symbol', info: '异步迭代器符号' },
            { label: 'species', type: 'constant', detail: 'symbol', info: '物种构造函数符号' },
            { label: 'toStringTag', type: 'constant', detail: 'symbol', info: '对象类型标签符号' },
            { label: 'hasInstance', type: 'constant', detail: 'symbol', info: 'instanceof 符号' },
            { label: 'isConcatSpreadable', type: 'constant', detail: 'symbol', info: '展开符号' },
            { label: 'unscopables', type: 'constant', detail: 'symbol', info: 'with 排除符号' },
            { label: 'match', type: 'constant', detail: 'symbol', info: '正则匹配符号' },
            { label: 'matchAll', type: 'constant', detail: 'symbol', info: '正则全部匹配符号' },
            { label: 'replace', type: 'constant', detail: 'symbol', info: '正则替换符号' },
            { label: 'search', type: 'constant', detail: 'symbol', info: '正则搜索符号' },
            { label: 'split', type: 'constant', detail: 'symbol', info: '正则分割符号' },
            { label: 'toPrimitive', type: 'constant', detail: 'symbol', info: '转换为原始值符号' },
            { label: 'for', type: 'function', detail: '(key: string) => symbol', info: '获取全局符号' },
            { label: 'keyFor', type: 'function', detail: '(sym: symbol) => string | undefined', info: '获取全局符号的键' },
        ],
        requires: ['hasSymbol'],
    },
    BigInt: {
        completions: [
            { label: 'asIntN', type: 'function', detail: '(bits: number, bigint: bigint) => bigint', info: '截断为指定位数' },
            { label: 'asUintN', type: 'function', detail: '(bits: number, bigint: bigint) => bigint', info: '截断为无符号指定位数' },
        ],
        requires: ['hasBigInt'],
    },
    Intl: {
        completions: [
            { label: 'Collator', type: 'class', detail: 'Intl.Collator', info: '语言字符串比较' },
            { label: 'DateTimeFormat', type: 'class', detail: 'Intl.DateTimeFormat', info: '日期时间格式化' },
            { label: 'NumberFormat', type: 'class', detail: 'Intl.NumberFormat', info: '数字格式化' },
            { label: 'PluralRules', type: 'class', detail: 'Intl.PluralRules', info: '复数规则' },
            { label: 'RelativeTimeFormat', type: 'class', detail: 'Intl.RelativeTimeFormat', info: '相对时间格式化' },
            { label: 'ListFormat', type: 'class', detail: 'Intl.ListFormat', info: '列表格式化' },
            { label: 'Segmenter', type: 'class', detail: 'Intl.Segmenter', info: '文本分段' },
            { label: 'DisplayNames', type: 'class', detail: 'Intl.DisplayNames', info: '显示名称' },
            { label: 'Locale', type: 'class', detail: 'Intl.Locale', info: '语言环境' },
            { label: 'getCanonicalLocales', type: 'function', detail: '(locales: string | string[]) => string[]', info: '获取规范语言环境' },
        ],
        requires: ['hasIntl'],
    },
    Proxy: {
        completions: [],
        requires: ['hasProxy'],
    },
    Reflect: {
        completions: [
            { label: 'apply', type: 'function', detail: '(target: Function, thisArg: any, args: any[]) => any', info: '调用函数' },
            { label: 'construct', type: 'function', detail: '(target: Function, args: any[], newTarget?: Function) => any', info: '调用构造函数' },
            { label: 'defineProperty', type: 'function', detail: '(target: object, key: string, attributes: object) => boolean', info: '定义属性' },
            { label: 'deleteProperty', type: 'function', detail: '(target: object, key: string) => boolean', info: '删除属性' },
            { label: 'get', type: 'function', detail: '(target: object, key: string, receiver?: any) => any', info: '获取属性值' },
            { label: 'getOwnPropertyDescriptor', type: 'function', detail: '(target: object, key: string) => PropertyDescriptor | undefined', info: '获取属性描述符' },
            { label: 'getPrototypeOf', type: 'function', detail: '(target: object) => object | null', info: '获取原型' },
            { label: 'has', type: 'function', detail: '(target: object, key: string) => boolean', info: '检查属性' },
            { label: 'isExtensible', type: 'function', detail: '(target: object) => boolean', info: '检查可扩展性' },
            { label: 'ownKeys', type: 'function', detail: '(target: object) => Array<string | symbol>', info: '获取所有自身键' },
            { label: 'preventExtensions', type: 'function', detail: '(target: object) => boolean', info: '阻止扩展' },
            { label: 'set', type: 'function', detail: '(target: object, key: string, value: any, receiver?: any) => boolean', info: '设置属性值' },
            { label: 'setPrototypeOf', type: 'function', detail: '(target: object, proto: object | null) => boolean', info: '设置原型' },
        ],
        requires: ['hasProxy'],
    },

    // ==================== DOM/浏览器相关 ====================
    document: {
        completions: [
            // 查询方法
            { label: 'getElementById', type: 'function', detail: '(id: string) => HTMLElement | null', info: '通过 ID 获取元素' },
            { label: 'getElementsByClassName', type: 'function', detail: '(classNames: string) => HTMLCollection', info: '通过类名获取元素集合' },
            { label: 'getElementsByTagName', type: 'function', detail: '(tagName: string) => HTMLCollection', info: '通过标签名获取元素集合' },
            { label: 'getElementsByName', type: 'function', detail: '(name: string) => NodeList', info: '通过 name 属性获取元素集合' },
            { label: 'querySelector', type: 'function', detail: '(selectors: string) => Element | null', info: '返回匹配的第一个元素' },
            { label: 'querySelectorAll', type: 'function', detail: '(selectors: string) => NodeList', info: '返回匹配的所有元素' },
            // 属性
            { label: 'body', type: 'property', detail: 'HTMLElement', info: '文档的 body 元素' },
            { label: 'head', type: 'property', detail: 'HTMLElement', info: '文档的 head 元素' },
            { label: 'documentElement', type: 'property', detail: 'HTMLElement', info: '文档的根元素 (html)' },
            { label: 'title', type: 'property', detail: 'string', info: '文档标题' },
            { label: 'URL', type: 'property', detail: 'string', info: '文档的完整 URL' },
            { label: 'domain', type: 'property', detail: 'string', info: '文档的域名' },
            { label: 'referrer', type: 'property', detail: 'string', info: '来源页面的 URL' },
            { label: 'cookie', type: 'property', detail: 'string', info: '文档的 Cookie' },
            { label: 'readyState', type: 'property', detail: 'string', info: '文档加载状态' },
            // 元素创建
            { label: 'createElement', type: 'function', detail: '(tagName: string) => HTMLElement', info: '创建元素节点' },
            { label: 'createTextNode', type: 'function', detail: '(data: string) => Text', info: '创建文本节点' },
            { label: 'createDocumentFragment', type: 'function', detail: '() => DocumentFragment', info: '创建文档片段' },
            { label: 'createComment', type: 'function', detail: '(data: string) => Comment', info: '创建注释节点' },
            { label: 'createAttribute', type: 'function', detail: '(name: string) => Attr', info: '创建属性节点' },
            // 事件
            { label: 'addEventListener', type: 'function', detail: '(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void', info: '添加事件监听器' },
            { label: 'removeEventListener', type: 'function', detail: '(type: string, listener: EventListener, options?: boolean | EventListenerOptions) => void', info: '移除事件监听器' },
            { label: 'dispatchEvent', type: 'function', detail: '(event: Event) => boolean', info: '派发事件' },
            // 写入
            { label: 'write', type: 'function', detail: '(...text: string[]) => void', info: '向文档写入 HTML' },
            { label: 'writeln', type: 'function', detail: '(...text: string[]) => void', info: '向文档写入 HTML 并添加换行' },
            // 其他
            { label: 'hasFocus', type: 'function', detail: '() => boolean', info: '检查文档是否获得焦点' },
            { label: 'getSelection', type: 'function', detail: '() => Selection | null', info: '获取当前选中的文本' },
            { label: 'createRange', type: 'function', detail: '() => Range', info: '创建范围对象' },
            { label: 'elementFromPoint', type: 'function', detail: '(x: number, y: number) => Element | null', info: '获取指定坐标的元素' },
            { label: 'elementsFromPoint', type: 'function', detail: '(x: number, y: number) => Element[]', info: '获取指定坐标的所有元素' },
            { label: 'hidden', type: 'property', detail: 'boolean', info: '页面是否隐藏' },
            { label: 'visibilityState', type: 'property', detail: 'string', info: '页面可见性状态' },
        ],
        requires: ['hasDocument'],
    },
    localStorage: {
        completions: [
            { label: 'setItem', type: 'function', detail: '(key: string, value: string) => void', info: '存储键值对' },
            { label: 'getItem', type: 'function', detail: '(key: string) => string | null', info: '获取指定键的值' },
            { label: 'removeItem', type: 'function', detail: '(key: string) => void', info: '删除指定键' },
            { label: 'clear', type: 'function', detail: '() => void', info: '清空所有存储' },
            { label: 'key', type: 'function', detail: '(index: number) => string | null', info: '获取指定索引的键名' },
            { label: 'length', type: 'property', detail: 'number', info: '存储的键值对数量' },
        ],
        requires: ['hasLocalStorage'],
    },
    sessionStorage: {
        completions: [
            { label: 'setItem', type: 'function', detail: '(key: string, value: string) => void', info: '存储键值对' },
            { label: 'getItem', type: 'function', detail: '(key: string) => string | null', info: '获取指定键的值' },
            { label: 'removeItem', type: 'function', detail: '(key: string) => void', info: '删除指定键' },
            { label: 'clear', type: 'function', detail: '() => void', info: '清空所有存储' },
            { label: 'key', type: 'function', detail: '(index: number) => string | null', info: '获取指定索引的键名' },
            { label: 'length', type: 'property', detail: 'number', info: '存储的键值对数量' },
        ],
        requires: ['hasSessionStorage'],
    },
    location: {
        completions: [
            { label: 'assign', type: 'function', detail: '(url: string) => void', info: '加载新文档' },
            { label: 'replace', type: 'function', detail: '(url: string) => void', info: '替换当前文档（不产生历史记录）' },
            { label: 'reload', type: 'function', detail: '() => void', info: '重新加载当前文档' },
            { label: 'toString', type: 'function', detail: '() => string', info: '返回完整 URL 字符串' },
            { label: 'href', type: 'property', detail: 'string', info: '完整 URL' },
            { label: 'protocol', type: 'property', detail: 'string', info: '协议部分' },
            { label: 'host', type: 'property', detail: 'string', info: '主机名和端口号' },
            { label: 'hostname', type: 'property', detail: 'string', info: '主机名' },
            { label: 'port', type: 'property', detail: 'string', info: '端口号' },
            { label: 'pathname', type: 'property', detail: 'string', info: '路径部分' },
            { label: 'search', type: 'property', detail: 'string', info: '查询字符串' },
            { label: 'hash', type: 'property', detail: 'string', info: '锚点部分' },
            { label: 'origin', type: 'property', detail: 'string', info: '源' },
        ],
        requires: ['hasWindow'],
    },
    history: {
        completions: [
            { label: 'back', type: 'function', detail: '() => void', info: '返回上一页' },
            { label: 'forward', type: 'function', detail: '() => void', info: '前进到下一页' },
            { label: 'go', type: 'function', detail: '(delta: number) => void', info: '相对当前页面跳转' },
            { label: 'pushState', type: 'function', detail: '(state: any, title: string, url?: string | null) => void', info: '添加历史记录条目' },
            { label: 'replaceState', type: 'function', detail: '(state: any, title: string, url?: string | null) => void', info: '替换当前历史记录条目' },
            { label: 'length', type: 'property', detail: 'number', info: '历史记录条目数量' },
            { label: 'state', type: 'property', detail: 'any', info: '当前状态对象' },
            { label: 'scrollRestoration', type: 'property', detail: 'string', info: '滚动恢复模式' },
        ],
        requires: ['hasWindow'],
    },
    navigator: {
        completions: (function() {
            // 基础方法 - navigator 属性非常多，这里只列出常用的
            const base = [
                { label: 'userAgent', type: 'property', detail: 'string', info: '浏览器的 User-Agent 字符串' },
                { label: 'platform', type: 'property', detail: 'string', info: '操作系统平台' },
                { label: 'language', type: 'property', detail: 'string', info: '首选语言' },
                { label: 'languages', type: 'property', detail: 'string[]', info: '浏览器接受的语言数组' },
                { label: 'onLine', type: 'property', detail: 'boolean', info: '浏览器是否在线' },
                { label: 'hardwareConcurrency', type: 'property', detail: 'number', info: 'CPU 核心数' },
                { label: 'cookieEnabled', type: 'property', detail: 'boolean', info: 'Cookie 是否启用' },
                { label: 'clipboard', type: 'property', detail: 'Clipboard', info: '剪贴板 API' },
                { label: 'storage', type: 'property', detail: 'StorageManager', info: '存储管理器' },
                { label: 'serviceWorker', type: 'property', detail: 'ServiceWorkerContainer', info: 'Service Worker 容器' },
            ];
            return base;
        })(),
        requires: ['hasNavigator'],
    },
    screen: {
        completions: [
            { label: 'width', type: 'property', detail: 'number', info: '屏幕的总宽度' },
            { label: 'height', type: 'property', detail: 'number', info: '屏幕的总高度' },
            { label: 'availWidth', type: 'property', detail: 'number', info: '屏幕可用宽度' },
            { label: 'availHeight', type: 'property', detail: 'number', info: '屏幕可用高度' },
            { label: 'colorDepth', type: 'property', detail: 'number', info: '屏幕的颜色深度' },
            { label: 'pixelDepth', type: 'property', detail: 'number', info: '屏幕的像素深度' },
            { label: 'orientation', type: 'property', detail: 'ScreenOrientation', info: '屏幕方向对象' },
        ],
        requires: ['hasWindow'],
    },
    crypto: {
        completions: [
            { label: 'randomUUID', type: 'function', detail: '() => string', info: '生成随机 UUID' },
            { label: 'getRandomValues', type: 'function', detail: '(array: TypedArray) => TypedArray', info: '填充随机值' },
            { label: 'subtle', type: 'property', detail: 'SubtleCrypto', info: '底层加密 API' },
        ],
        requires: ['hasCrypto'],
    },
    performance: {
        completions: [
            { label: 'now', type: 'function', detail: '() => number', info: '返回高精度时间戳' },
            { label: 'mark', type: 'function', detail: '(markName: string) => void', info: '创建时间标记' },
            { label: 'measure', type: 'function', detail: '(measureName: string, startMark?: string, endMark?: string) => void', info: '测量时间间隔' },
            { label: 'getEntries', type: 'function', detail: '() => PerformanceEntry[]', info: '获取性能条目列表' },
            { label: 'getEntriesByName', type: 'function', detail: '(name: string, type?: string) => PerformanceEntry[]', info: '按名称获取性能条目' },
            { label: 'getEntriesByType', type: 'function', detail: '(type: string) => PerformanceEntry[]', info: '按类型获取性能条目' },
            { label: 'clearMarks', type: 'function', detail: '(markName?: string) => void', info: '清除标记' },
            { label: 'clearMeasures', type: 'function', detail: '(measureName?: string) => void', info: '清除测量' },
            { label: 'timeOrigin', type: 'property', detail: 'number', info: '性能测量起始时间' },
            { label: 'memory', type: 'property', detail: 'object', info: '内存信息（仅 Chrome）' },
        ],
        requires: ['hasPerformance'],
    },
};

/**
 * 获取当前环境可用的内置对象数据
 * @param {Object} environment - 环境检测结果
 * @returns {Object} 过滤后的 registry
 */
export function getAvailableBuiltinData(environment) {
    const available = {};

    for (const [name, config] of Object.entries(builtinDataRegistry)) {
        if (!config.requires || config.requires.length === 0) {
            // 无依赖，始终可用
            available[name] = config.completions;
        } else {
            // 检查所有依赖是否满足
            const allMet = config.requires.every(req => {
                if (req.startsWith('has')) {
                    return environment[req] === true;
                }
                return true;
            });
            if (allMet) {
                available[name] = config.completions;
            }
        }
    }

    return available;
}
```

---

## 6. `completion/sources/global-source.js` - 全局变量补全源

```javascript
// completion/sources/global-source.js

import { globalCompletions } from '../data/globals';
import { Priority } from '../core/priority';

/**
 * 创建全局变量补全源
 * 
 * 处理直接使用的全局变量/函数，如：
 * - Math
 * - console
 * - fetch
 * - parseInt
 * - document
 * - localStorage
 * 
 * 同时也作为 window.xxx 的数据源（通过 alias 机制）
 * 
 * @param {Object} options
 * @param {Array} options.customCompletions - 用户自定义全局补全
 * @param {Object} options.customObjects - 用户自定义对象
 * @param {Object} options.environment - 环境检测结果
 * @returns {Function} 补全源函数
 */
export function createGlobalCompletionSource(options = {}) {
    const {
        customCompletions = [],
        customObjects = {},
        environment
    } = options;

    // 构建完整的全局补全列表
    let allGlobals = [...globalCompletions];

    // 添加用户自定义的全局补全（没有 path 的）
    for (const comp of customCompletions) {
        if (!comp.path && !allGlobals.some(g => g.label === comp.label)) {
            allGlobals.push({
                label: comp.label,
                type: comp.type || 'variable',
                detail: comp.detail || '',
                info: comp.info || '',
                priority: Priority.USER_CUSTOM_GLOBAL,
                boost: 100 // 给自定义项更高的 boost
            });
        }
    }

    // 添加用户自定义对象作为全局变量
    for (const name of Object.keys(customObjects)) {
        if (!allGlobals.some(g => g.label === name)) {
            allGlobals.push({
                label: name,
                type: 'class',
                detail: 'object',
                info: `用户自定义对象: ${name}`,
                priority: Priority.USER_CUSTOM_OBJECT,
                boost: 95
            });
        }
    }

    // 根据环境过滤掉不可用的全局变量
    if (environment) {
        allGlobals = allGlobals.filter(g => {
            // 检查 requires
            if (g.requires) {
                return g.requires.every(req => environment[req] === true);
            }
            return true;
        });
    }

    // 去重（按 label，保留优先级最高的）
    const seen = new Map();
    for (const g of allGlobals) {
        const existing = seen.get(g.label);
        if (!existing || (g.priority || 0) > (existing.priority || 0)) {
            seen.set(g.label, g);
        }
    }
    allGlobals = Array.from(seen.values());

    // 排序：boost 高的在前，同 boost 按字母排序
    allGlobals.sort((a, b) => {
        const boostDiff = (b.boost || 50) - (a.boost || 50);
        if (boostDiff !== 0) return boostDiff;
        return a.label.localeCompare(b.label);
    });

    return (context) => {
        const before = context.matchBefore(/\w*/);
        if (!before || (before.from === before.to && !context.explicit)) return null;

        const word = before.text;
        const matched = allGlobals.filter(c =>
            c.label.toLowerCase().startsWith(word.toLowerCase())
        );

        if (matched.length === 0) return null;

        return {
            from: before.from,
            options: matched,
            validFor: /^\w*$/
        };
    };
}
```

---

## 7. `completion/sources/object-property-source.js` - 对象属性补全源（核心）

```javascript
// completion/sources/object-property-source.js

import { getAvailableBuiltinData } from '../data/builtin/index';
import { prototypeCompletions } from '../data/prototypes/index';
import { parseFunctionSignature } from '../resolvers/signature-parser';
import { Priority } from '../core/priority';
import { getGlobalScope, getWindowScope } from '../core/environment';

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

    /**
     * 检测是否为字面量原型链访问
     * 例如：[].xxx -> Array.prototype
     *       "".xxx -> String.prototype
     *       1..xxx -> Number.prototype
     */
    function detectLiteralPrototype(line, objectName) {
        // 检测 [].property
        if (objectName === ']' && line.endsWith('[')) {
            return { type: 'Array', label: 'Array.prototype' };
        }
        // 检测 "".property 或 ''.property
        if ((objectName === '"' || objectName === "'") && 
            (line.endsWith('"') || line.endsWith("'"))) {
            return { type: 'String', label: 'String.prototype' };
        }
        // 检测数字字面量 .property（如 1.xxx、1..xxx）
        const numMatch = line.match(/(\d+)\.(\w*)$/);
        if (numMatch) {
            return { type: 'Number', label: 'Number.prototype' };
        }
        // 检测 /regex/.property
        const regexMatch = line.match(/\/[^/]+\/\.(\w*)$/);
        if (regexMatch) {
            return { type: 'RegExp', label: 'RegExp.prototype' };
        }
        return null;
    }

    return (context) => {
        const cursor = context.pos;
        
        // 获取光标前的文本（最多取 500 字符）
        const line = context.state.sliceDoc(Math.max(0, cursor - 500), cursor);
        
        // 匹配 对象名.部分属性名
        const match = line.match(/([\w$\]'"`)]+)\.([\w$]*)$/);
        if (!match) return null;

        let [, objectName, partialProp] = match;
        const { targetName, isWindowAccess } = resolveObjectName(objectName);

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
            const literalProto = detectLiteralPrototype(line, objectName);
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

    // 添加全局函数/变量（从全局补全中提取）
    const windowGlobalProps = [
        { label: 'parseInt', type: 'function', detail: '(string: string, radix?: number) => number', info: '解析字符串为整数' },
        { label: 'parseFloat', type: 'function', detail: '(string: string) => number', info: '解析字符串为浮点数' },
        { label: 'isNaN', type: 'function', detail: '(value: any) => boolean', info: '判断值是否为 NaN' },
        { label: 'isFinite', type: 'function', detail: '(value: any) => boolean', info: '判断值是否为有限数' },
        { label: 'encodeURI', type: 'function', detail: '(uri: string) => string', info: '编码 URI' },
        { label: 'decodeURI', type: 'function', detail: '(encodedURI: string) => string', info: '解码 URI' },
        { label: 'encodeURIComponent', type: 'function', detail: '(component: string) => string', info: '编码 URI 组件' },
        { label: 'decodeURIComponent', type: 'function', detail: '(encodedComponent: string) => string', info: '解码 URI 组件' },
        { label: 'atob', type: 'function', detail: '(encodedData: string) => string', info: '解码 Base64' },
        { label: 'btoa', type: 'function', detail: '(stringToEncode: string) => string', info: '编码 Base64' },
        { label: 'fetch', type: 'function', detail: '(input: RequestInfo, init?: RequestInit) => Promise<Response>', info: '发起网络请求' },
        { label: 'setTimeout', type: 'function', detail: '(handler: Function, timeout?: number, ...args: any[]) => number', info: '延迟执行' },
        { label: 'clearTimeout', type: 'function', detail: '(id: number) => void', info: '清除延迟执行' },
        { label: 'setInterval', type: 'function', detail: '(handler: Function, timeout?: number, ...args: any[]) => number', info: '定时执行' },
        { label: 'clearInterval', type: 'function', detail: '(id: number) => void', info: '清除定时执行' },
        { label: 'alert', type: 'function', detail: '(message?: any) => void', info: '警告弹窗' },
        { label: 'confirm', type: 'function', detail: '(message?: string) => boolean', info: '确认弹窗' },
        { label: 'prompt', type: 'function', detail: '(message?: string, defaultValue?: string) => string | null', info: '输入弹窗' },
        { label: 'NaN', type: 'constant', detail: 'number', info: 'Not-a-Number' },
        { label: 'Infinity', type: 'constant', detail: 'number', info: '无穷大' },
        { label: 'undefined', type: 'constant', detail: 'undefined', info: '未定义' },
    ];

    for (const prop of windowGlobalProps) {
        if (seen.has(prop.label)) continue;
        seen.add(prop.label);
        allCompletions.push({ ...prop, boost: 75, source: 'window-global' });
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
 */
function resolveWindowRuntimeProperties(partialProp, builtinCompletions, customObjects) {
    const completions = [];
    const win = getWindowScope();
    if (!win) return completions;

    const seen = new Set();

    // 收集已有的名称（避免重复）
    for (const name of Object.keys(builtinCompletions)) seen.add(name);
    for (const name of Object.keys(customObjects)) seen.add(name);

    try {
        // 扫描 window 的自有属性
        const propNames = Object.getOwnPropertyNames(win);
        
        for (const prop of propNames) {
            if (seen.has(prop)) continue;
            if (prop.startsWith('_')) continue;
            if (!partialProp || prop.toLowerCase().startsWith(partialProp.toLowerCase())) {
                seen.add(prop);

                try {
                    const value = win[prop];
                    if (typeof value === 'function') {
                        const signature = parseFunctionSignature(value);
                        completions.push({
                            label: prop,
                            type: 'function',
                            detail: signature || 'function',
                            info: `window.${prop} (运行时解析)`,
                        });
                    } else if (value && typeof value === 'object') {
                        const propCount = Object.keys(value).length;
                        completions.push({
                            label: prop,
                            type: 'class',
                            detail: `{${propCount}}`,
                            info: `window.${prop} 对象 (运行时解析)`,
                        });
                    } else {
                        completions.push({
                            label: prop,
                            type: 'variable',
                            detail: String(value),
                            info: `window.${prop} (运行时解析)`,
                        });
                    }
                } catch (e) {
                    // 某些属性可能无法访问
                    completions.push({
                        label: prop,
                        type: 'variable',
                        detail: 'unknown',
                        info: `window.${prop} (无法访问)`,
                    });
                }
            }
        }
    } catch (e) {
        // 获取 window 属性失败
    }

    return completions;
}
```

---

由于输出限制，我将继续在下一个回复中完成剩余文件。