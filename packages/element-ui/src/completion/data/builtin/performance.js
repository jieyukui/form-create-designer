/** performance 对象补全项 */
export const performanceCompletions = [
    {label: 'now', type: 'function', detail: '() => number', info: '返回高精度时间戳'},
    {label: 'mark', type: 'function', detail: '(markName: string) => void', info: '创建时间标记'},
    {
        label: 'measure',
        type: 'function',
        detail: '(measureName: string, startMark?: string, endMark?: string) => void',
        info: '测量时间间隔'
    },
    {label: 'getEntries', type: 'function', detail: '() => PerformanceEntry[]', info: '获取性能条目列表'},
    {
        label: 'getEntriesByName',
        type: 'function',
        detail: '(name: string, type?: string) => PerformanceEntry[]',
        info: '按名称获取性能条目'
    },
    {
        label: 'getEntriesByType',
        type: 'function',
        detail: '(type: string) => PerformanceEntry[]',
        info: '按类型获取性能条目'
    },
    {label: 'clearMarks', type: 'function', detail: '(markName?: string) => void', info: '清除标记'},
    {label: 'clearMeasures', type: 'function', detail: '(measureName?: string) => void', info: '清除测量'},
    {label: 'timeOrigin', type: 'property', detail: 'number', info: '性能测量起始时间'},
    {label: 'memory', type: 'property', detail: 'object', info: '内存信息（仅 Chrome）'},
];
