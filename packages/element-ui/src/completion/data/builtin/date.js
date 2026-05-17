/** Date 静态方法补全项 */
export const dateCompletions = [
    {label: 'now', type: 'function', detail: '() => number', info: '返回当前时间戳'},
    {label: 'parse', type: 'function', detail: '(dateString: string) => number', info: '解析日期字符串'},
    {
        label: 'UTC',
        type: 'function',
        detail: '(year: number, month: number, ...args: number[]) => number',
        info: '返回 UTC 时间戳'
    },
]