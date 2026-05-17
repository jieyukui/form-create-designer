/**
 * 补全优先级常量
 */
export const Priority = {
    // 用户自定义（最高优先级）
    USER_CUSTOM_OBJECT: 1000,
    USER_CUSTOM_GLOBAL: 999,
    USER_CUSTOM_SIGNATURE: 998,
    USER_CUSTOM_OBJECT_COMPLETIONS: 995,

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