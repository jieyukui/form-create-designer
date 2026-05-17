/** JSON 静态方法补全项 */
export const jsonCompletions = [
    {
        label: 'parse',
        type: 'function',
        detail: '(text: string, reviver?: Function) => any',
        info: '解析 JSON 字符串'
    },
    {
        label: 'stringify',
        type: 'function',
        detail: '(value: any, replacer?: Function, space?: number) => string',
        info: '序列化为 JSON 字符串'
    },
];
