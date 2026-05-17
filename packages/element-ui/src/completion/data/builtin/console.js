/** console 对象补全项 */
export const consoleCompletions = [
    {label: 'log', type: 'function', detail: '(...args: any[]) => void', info: '输出日志信息'},
    {label: 'error', type: 'function', detail: '(...args: any[]) => void', info: '输出错误信息'},
    {label: 'warn', type: 'function', detail: '(...args: any[]) => void', info: '输出警告信息'},
    {label: 'info', type: 'function', detail: '(...args: any[]) => void', info: '输出信息'},
    {label: 'debug', type: 'function', detail: '(...args: any[]) => void', info: '输出调试信息'},
    {
        label: 'table',
        type: 'function',
        detail: '(data: any, columns?: string[]) => void',
        info: '以表格形式显示数据'
    },
    {label: 'time', type: 'function', detail: '(label?: string) => void', info: '启动计时器'},
    {label: 'timeEnd', type: 'function', detail: '(label?: string) => void', info: '停止计时器'},
    {
        label: 'timeLog',
        type: 'function',
        detail: '(label?: string, ...args: any[]) => void',
        info: '输出中间计时'
    },
    {label: 'group', type: 'function', detail: '(label?: string) => void', info: '创建分组'},
    {label: 'groupEnd', type: 'function', detail: '() => void', info: '结束分组'},
    {label: 'groupCollapsed', type: 'function', detail: '(label?: string) => void', info: '创建折叠分组'},
    {label: 'clear', type: 'function', detail: '() => void', info: '清空控制台'},
    {label: 'count', type: 'function', detail: '(label?: string) => void', info: '计数器'},
    {label: 'countReset', type: 'function', detail: '(label?: string) => void', info: '重置计数器'},
    {label: 'dir', type: 'function', detail: '(item: any) => void', info: '显示对象属性'},
    {label: 'dirxml', type: 'function', detail: '(item: any) => void', info: '显示 XML/HTML 元素'},
    {label: 'trace', type: 'function', detail: '() => void', info: '输出堆栈跟踪'},
    {
        label: 'assert',
        type: 'function',
        detail: '(condition: boolean, ...args: any[]) => void',
        info: '条件断言'
    },
];
