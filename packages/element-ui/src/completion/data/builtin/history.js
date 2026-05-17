/** history 对象补全项 */
export const historyCompletions = [
    {label: 'back', type: 'function', detail: '() => void', info: '返回上一页'},
    {label: 'forward', type: 'function', detail: '() => void', info: '前进到下一页'},
    {label: 'go', type: 'function', detail: '(delta: number) => void', info: '相对当前页面跳转'},
    {
        label: 'pushState',
        type: 'function',
        detail: '(state: any, title: string, url?: string | null) => void',
        info: '添加历史记录条目'
    },
    {
        label: 'replaceState',
        type: 'function',
        detail: '(state: any, title: string, url?: string | null) => void',
        info: '替换当前历史记录条目'
    },
    {label: 'length', type: 'property', detail: 'number', info: '历史记录条目数量'},
    {label: 'state', type: 'property', detail: 'any', info: '当前状态对象'},
    {label: 'scrollRestoration', type: 'property', detail: 'string', info: '滚动恢复模式'},
];
