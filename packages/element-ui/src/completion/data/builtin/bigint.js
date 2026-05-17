/** BigInt 静态方法补全项 */
export const bigintCompletions = [
    {
        label: 'asIntN',
        type: 'function',
        detail: '(bits: number, bigint: bigint) => bigint',
        info: '截断为指定位数'
    },
    {
        label: 'asUintN',
        type: 'function',
        detail: '(bits: number, bigint: bigint) => bigint',
        info: '截断为无符号指定位数'
    },
];
