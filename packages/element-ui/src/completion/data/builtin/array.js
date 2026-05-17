/** Array 静态方法补全项 */
export const arrayCompletions = [
    {label: 'isArray', type: 'function', detail: '(value: any) => boolean', info: '判断是否为数组'},
    {
        label: 'from',
        type: 'function',
        detail: '(arrayLike: ArrayLike<T>, mapFn?: Function, thisArg?: any) => T[]',
        info: '从类数组对象创建数组'
    },
    {label: 'of', type: 'function', detail: '(...items: T[]) => T[]', info: '从参数创建数组'},
];
