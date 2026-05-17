export const promisePrototypeCompletions = [
    {
        label: 'then',
        type: 'function',
        detail: '<TResult1 = T, TResult2 = never>(onfulfilled?: Function, onrejected?: Function) => Promise<TResult1 | TResult2>',
        info: '添加回调'
    },
    {
        label: 'catch',
        type: 'function',
        detail: '<TResult = never>(onrejected?: Function) => Promise<T | TResult>',
        info: '捕获错误'
    },
    {label: 'finally', type: 'function', detail: '(onfinally?: Function) => Promise<T>', info: '总是执行'},
];
