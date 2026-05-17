/** Number 对象补全项 */
export const numberCompletions = [
    {label: 'isFinite', type: 'function', detail: '(value: any) => boolean', info: '判断是否为有限数'},
    {label: 'isInteger', type: 'function', detail: '(value: any) => boolean', info: '判断是否为整数'},
    {label: 'isNaN', type: 'function', detail: '(value: any) => boolean', info: '判断是否为 NaN'},
    {label: 'isSafeInteger', type: 'function', detail: '(value: any) => boolean', info: '判断是否为安全整数'},
    {label: 'parseFloat', type: 'function', detail: '(value: string) => number', info: '解析浮点数'},
    {
        label: 'parseInt',
        type: 'function',
        detail: '(value: string, radix?: number) => number',
        info: '解析整数'
    },
    {label: 'EPSILON', type: 'constant', detail: '2.220446049250313e-16', info: '最小精度值'},
    {label: 'MAX_VALUE', type: 'constant', detail: '1.7976931348623157e+308', info: '最大数值'},
    {label: 'MIN_VALUE', type: 'constant', detail: '5e-324', info: '最小正数值'},
    {label: 'MAX_SAFE_INTEGER', type: 'constant', detail: '9007199254740991', info: '最大安全整数'},
    {label: 'MIN_SAFE_INTEGER', type: 'constant', detail: '-9007199254740991', info: '最小安全整数'},
    {label: 'NaN', type: 'constant', detail: 'NaN', info: '非数值'},
    {label: 'NEGATIVE_INFINITY', type: 'constant', detail: '-Infinity', info: '负无穷大'},
    {label: 'POSITIVE_INFINITY', type: 'constant', detail: 'Infinity', info: '正无穷大'},
]