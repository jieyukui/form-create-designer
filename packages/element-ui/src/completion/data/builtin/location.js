/** location 对象补全项 */
export const locationCompletions = [
    {label: 'assign', type: 'function', detail: '(url: string) => void', info: '加载新文档'},
    {label: 'replace', type: 'function', detail: '(url: string) => void', info: '替换当前文档（不产生历史记录）'},
    {label: 'reload', type: 'function', detail: '() => void', info: '重新加载当前文档'},
    {label: 'toString', type: 'function', detail: '() => string', info: '返回完整 URL 字符串'},
    {label: 'href', type: 'property', detail: 'string', info: '完整 URL'},
    {label: 'protocol', type: 'property', detail: 'string', info: '协议部分'},
    {label: 'host', type: 'property', detail: 'string', info: '主机名和端口号'},
    {label: 'hostname', type: 'property', detail: 'string', info: '主机名'},
    {label: 'port', type: 'property', detail: 'string', info: '端口号'},
    {label: 'pathname', type: 'property', detail: 'string', info: '路径部分'},
    {label: 'search', type: 'property', detail: 'string', info: '查询字符串'},
    {label: 'hash', type: 'property', detail: 'string', info: '锚点部分'},
    {label: 'origin', type: 'property', detail: 'string', info: '源'},
];
