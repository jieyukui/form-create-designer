/** Symbol 静态方法补全项 */
export const symbolCompletions = [
    {label: 'iterator', type: 'constant', detail: 'symbol', info: '默认迭代器符号'},
    {label: 'asyncIterator', type: 'constant', detail: 'symbol', info: '异步迭代器符号'},
    {label: 'species', type: 'constant', detail: 'symbol', info: '物种构造函数符号'},
    {label: 'toStringTag', type: 'constant', detail: 'symbol', info: '对象类型标签符号'},
    {label: 'hasInstance', type: 'constant', detail: 'symbol', info: 'instanceof 符号'},
    {label: 'isConcatSpreadable', type: 'constant', detail: 'symbol', info: '展开符号'},
    {label: 'unscopables', type: 'constant', detail: 'symbol', info: 'with 排除符号'},
    {label: 'match', type: 'constant', detail: 'symbol', info: '正则匹配符号'},
    {label: 'matchAll', type: 'constant', detail: 'symbol', info: '正则全部匹配符号'},
    {label: 'replace', type: 'constant', detail: 'symbol', info: '正则替换符号'},
    {label: 'search', type: 'constant', detail: 'symbol', info: '正则搜索符号'},
    {label: 'split', type: 'constant', detail: 'symbol', info: '正则分割符号'},
    {label: 'toPrimitive', type: 'constant', detail: 'symbol', info: '转换为原始值符号'},
    {label: 'for', type: 'function', detail: '(key: string) => symbol', info: '获取全局符号'},
    {
        label: 'keyFor',
        type: 'function',
        detail: '(sym: symbol) => string | undefined',
        info: '获取全局符号的键'
    },
];