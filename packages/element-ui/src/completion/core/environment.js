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