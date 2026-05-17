/**
 * 按 detectEnvironment 结果过滤静态 builtin 表键（对齐 docs/file3 思路）
 */

const OBJECT_ENV_REQUIRES = {
    document: ['hasDocument'],
    localStorage: ['hasLocalStorage'],
    sessionStorage: ['hasSessionStorage'],
    location: ['hasWindow'],
    history: ['hasWindow'],
    navigator: ['hasNavigator'],
    screen: ['hasWindow'],
    window: ['hasWindow'],
    crypto: ['hasCrypto'],
    performance: ['hasPerformance']
};

export function filterBuiltinCompletionsByEnvironment(environment, builtinMap) {
    if (!builtinMap || typeof builtinMap !== 'object') {
        return {};
    }
    const out = {};
    for (const [name, list] of Object.entries(builtinMap)) {
        const reqs = OBJECT_ENV_REQUIRES[name];
        if (!reqs || reqs.length === 0) {
            out[name] = list;
            continue;
        }
        const ok = reqs.every((k) => environment && environment[k] === true);
        if (ok) {
            out[name] = list;
        }
    }
    return out;
}
