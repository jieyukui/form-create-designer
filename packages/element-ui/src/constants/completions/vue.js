// ==================== 预定义的常用补全项 ====================

/**
 * 预定义的 Vue 相关补全项
 */
export const vueCompletions = [
    {
        label: 'ref',
        type: 'function',
        info: 'Vue 3 响应式 API，创建响应式数据',
        detail: 'ref&lt;T&gt;(value: T) => Ref&lt;T&gt;'
    },
    {
        label: 'reactive',
        type: 'function',
        info: 'Vue 3 响应式 API，创建深层响应式对象',
        detail: 'reactive&lt;T&gt;(target: T) => T'
    },
    {
        label: 'computed',
        type: 'function',
        info: '创建计算属性',
        detail: 'computed&lt;T&gt;(getter: () => T) => ComputedRef&lt;T&gt;'
    },
    {label: 'watch', type: 'function', info: '监听响应式数据的变化', detail: 'watch(source, callback, options?)'},
    {
        label: 'onMounted',
        type: 'function',
        info: '组件挂载后执行的生命周期钩子',
        detail: 'onMounted(callback: () => void)'
    },
    {
        label: 'onUnmounted',
        type: 'function',
        info: '组件卸载前执行的生命周期钩子',
        detail: 'onUnmounted(callback: () => void)'
    },
    {
        label: 'nextTick',
        type: 'function',
        info: '等待下一次 DOM 更新后执行',
        detail: 'nextTick(callback?: () => void) => Promise&lt;void&gt;'
    }
];