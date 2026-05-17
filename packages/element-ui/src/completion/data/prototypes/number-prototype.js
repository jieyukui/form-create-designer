export const numberPrototypeCompletions = [
    {label: 'toFixed', type: 'function', detail: '(fractionDigits?: number) => string', info: '保留指定位数小数'},
    {label: 'toExponential', type: 'function', detail: '(fractionDigits?: number) => string', info: '转换为指数表示'},
    {label: 'toPrecision', type: 'function', detail: '(precision?: number) => string', info: '转换为指定精度'},
    {label: 'toString', type: 'function', detail: '(radix?: number) => string', info: '转换为字符串'},
    {
        label: 'toLocaleString',
        type: 'function',
        detail: '(locales?: string | string[], options?: object) => string',
        info: '本地化字符串'
    },
    {label: 'valueOf', type: 'function', detail: '() => number', info: '返回原始数值'},
];
