/**
 * 补全缓存：TTL、依赖失效、LRU（对齐 docs/file3.md）
 */

export class CompletionCache {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 500;
        this.defaultTTL = options.defaultTTL || 5 * 60 * 1000;
        this.cache = new Map();
        this.dependencyMap = new Map();
        this.accessOrder = [];
        this.environmentVersion = 0;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return null;
        }
        this._touch(key);
        return entry.value;
    }

    set(key, value, options = {}) {
        const ttl = options.ttl || this.defaultTTL;
        const dependencies = options.dependencies || [];

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

        for (const dep of dependencies) {
            if (!this.dependencyMap.has(dep)) {
                this.dependencyMap.set(dep, new Set());
            }
            this.dependencyMap.get(dep).add(key);
        }
    }

    delete(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return;
        }
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

    invalidateByDependency(dep) {
        const dependentKeys = this.dependencyMap.get(dep);
        if (dependentKeys) {
            for (const key of dependentKeys) {
                this.delete(key);
            }
        }
        this.dependencyMap.delete(dep);
    }

    incrementEnvironmentVersion() {
        this.environmentVersion++;
        this.invalidateByDependency('environment');
    }

    clear() {
        this.cache.clear();
        this.dependencyMap.clear();
        this.accessOrder = [];
    }

    has(key) {
        return this.get(key) !== null;
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            environmentVersion: this.environmentVersion,
            activeDependencies: this.dependencyMap.size
        };
    }

    memoize(key, fn, options = {}) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        const result = fn();
        this.set(key, result, options);
        return result;
    }

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

export const globalCompletionCache = new CompletionCache();

/**
 * 轻量 Map 缓存（兼容旧 createCompletionCache 调用形态）
 */
export function createCompletionCache(options = {}) {
    const ttlMs = typeof options.ttlMs === 'number' ? options.ttlMs : 0;
    const inner = new CompletionCache({
        maxSize: options.maxSize || 500,
        defaultTTL: ttlMs > 0 ? ttlMs : Number.MAX_SAFE_INTEGER
    });
    return {
        get(key) {
            return inner.get(key);
        },
        set(key, value) {
            inner.set(key, value, {ttl: ttlMs > 0 ? ttlMs : inner.defaultTTL});
        },
        delete(key) {
            inner.delete(key);
        },
        clear() {
            inner.clear();
        }
    };
}
