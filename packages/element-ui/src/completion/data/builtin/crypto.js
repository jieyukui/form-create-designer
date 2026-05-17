/** crypto 对象补全项 */
export const cryptoCompletions = [
    {label: 'randomUUID', type: 'function', detail: '() => string', info: '生成随机 UUID'},
    {
        label: 'getRandomValues',
        type: 'function',
        detail: '(array: TypedArray) => TypedArray',
        info: '填充随机值'
    },
    {label: 'subtle', type: 'property', detail: 'SubtleCrypto', info: '底层加密 API'},
];
