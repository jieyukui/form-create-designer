/** String 静态方法补全项 */
export const stringCompletions = [
    {
        label: 'fromCharCode',
        type: 'function',
        detail: '(...codes: number[]) => string',
        info: '从 Unicode 编码创建字符串'
    },
    {
        label: 'fromCodePoint',
        type: 'function',
        detail: '(...codePoints: number[]) => string',
        info: '从码点创建字符串'
    },
    {
        label: 'raw',
        type: 'function',
        detail: '(template: TemplateStringsArray, ...substitutions: any[]) => string',
        info: '获取原始字符串'
    },
];
