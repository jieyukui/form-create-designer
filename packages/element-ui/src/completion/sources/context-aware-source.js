import {getContextAnalyzer, ContextType} from '../core/context-analyzer';

/**
 * 创建上下文感知的补全源包装器
 *
 * 在原始补全源执行前，先判断当前语法上下文是否适合补全。
 * 不适合的上下文（注释、字符串、声明位置等）直接返回 null。
 *
 * @param {Function} sourceFn - 原始补全源函数
 * @param {Object} options - 配置
 * @param {Array<string>} options.allowedContexts - 允许的上下文类型列表（null 表示全部允许）
 * @param {Array<string>} options.blockedContexts - 阻止的上下文类型列表
 * @param {boolean} options.debug - 是否输出调试信息
 * @returns {Function} 包装后的补全源函数
 */
export function createContextAwareSource(sourceFn, options = {}) {
    const {
        allowedContexts = null,    // 白名单
        blockedContexts = [        // 默认黑名单
            ContextType.COMMENT,
            ContextType.STRING,
            ContextType.TEMPLATE_STRING,
            ContextType.DECLARATION,
        ],
        debug = false
    } = options;

    const analyzer = getContextAnalyzer();

    return (context) => {
        // 分析语法上下文
        const ctx = analyzer.analyze(context);

        if (debug) {
            console.log('[ContextAware]', {
                type: ctx.type,
                isValid: ctx.isValid,
                objectName: ctx.objectName,
                partialProp: ctx.partialProp,
                node: ctx.node?.type?.name,
                pos: ctx.position
            });
        }

        // 检查是否允许在此上下文补全
        if (!ctx.isValid) {
            if (debug) console.log('[ContextAware] 上下文无效，跳过补全');
            return null;
        }

        // 白名单检查
        if (allowedContexts && !allowedContexts.includes(ctx.type)) {
            if (debug) console.log('[ContextAware] 不在白名单中，跳过补全');
            return null;
        }

        // 黑名单检查
        if (blockedContexts && blockedContexts.includes(ctx.type)) {
            if (debug) console.log('[ContextAware] 在黑名单中，跳过补全');
            return null;
        }

        // 特殊处理：声明位置
        if (ctx.type === ContextType.DECLARATION) {
            // 在声明位置，仍然允许全局变量补全（如 const xxx = Math.）
            // 但不应该补全声明的变量名
            // 这里通过检查是否有属性访问来判断
            if (ctx.objectName === null && ctx.partialProp === '') {
                if (debug) console.log('[ContextAware] 声明位置且无属性访问，跳过补全');
                return null;
            }
        }

        // 将上下文信息附加到 context 上，供源函数使用
        context._completionContext = ctx;
        context._analyzer = analyzer;

        // 执行原始补全源
        return sourceFn(context);
    };
}

/**
 * 创建全局补全的上下文感知包装器
 *
 * 全局补全（不带点的）在以下场景不应出现：
 * - 声明位置（const xxx）
 * - 赋值左侧
 * - 注释/字符串中
 */
export function createContextAwareGlobalSource(sourceFn, options = {}) {
    return createContextAwareSource(sourceFn, {
        blockedContexts: [
            ContextType.COMMENT,
            ContextType.STRING,
            ContextType.TEMPLATE_STRING,
        ],
        // 声明位置允许全局补全，但需要特殊处理
        ...options
    });
}

/**
 * 创建对象属性补全的上下文感知包装器
 *
 * 属性补全（obj.xxx）在以下场景不应出现：
 * - 注释/字符串中
 * - 声明位置的变量名部分
 * - 赋值左侧的变量名部分
 */
export function createContextAwarePropertySource(sourceFn, options = {}) {
    return createContextAwareSource(sourceFn, {
        blockedContexts: [
            ContextType.COMMENT,
            ContextType.STRING,
            ContextType.TEMPLATE_STRING,
        ],
        ...options
    });
}