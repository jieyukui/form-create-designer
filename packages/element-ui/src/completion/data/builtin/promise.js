/** Promise 静态方法补全项 */
export const promiseCompletions = [
    {label: 'resolve', type: 'function', detail: '<T>(value: T) => Promise<T>', info: '创建已解决的 Promise'},
    {
        label: 'reject',
        type: 'function',
        detail: '<T = never>(reason?: any) => Promise<T>',
        info: '创建已拒绝的 Promise'
    },
    {
        label: 'all',
        type: 'function',
        detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T[]>',
        info: '等待所有 Promise 完成'
    },
    {
        label: 'race',
        type: 'function',
        detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T>',
        info: '返回最先完成的 Promise'
    },
    {
        label: 'allSettled',
        type: 'function',
        detail: '<T>(promises: Iterable<Promise<T>>) => Promise<PromiseSettledResult<T>[]>',
        info: '等待所有 Promise 完成（无论成功或失败）'
    },
    {
        label: 'any',
        type: 'function',
        detail: '<T>(promises: Iterable<Promise<T>>) => Promise<T>',
        info: '返回第一个成功的 Promise'
    },
    {
        label: 'withResolvers',
        type: 'function',
        detail: '() => { promise: Promise<T>, resolve: Function, reject: Function }',
        info: '创建带控制器的 Promise'
    },
];
