export const stringPrototypeCompletions = [
    {label: 'length', type: 'property', detail: 'number', info: '字符串长度'},
    {label: 'charAt', type: 'function', detail: '(index: number) => string', info: '返回指定位置的字符'},
    {label: 'charCodeAt', type: 'function', detail: '(index: number) => number', info: '返回指定位置的 Unicode 值'},
    {label: 'codePointAt', type: 'function', detail: '(pos: number) => number | undefined', info: '返回码点值'},
    {label: 'concat', type: 'function', detail: '(...strings: string[]) => string', info: '连接字符串'},
    {
        label: 'includes',
        type: 'function',
        detail: '(searchString: string, position?: number) => boolean',
        info: '检查是否包含子串'
    },
    {
        label: 'indexOf',
        type: 'function',
        detail: '(searchValue: string, fromIndex?: number) => number',
        info: '查找子串位置'
    },
    {
        label: 'lastIndexOf',
        type: 'function',
        detail: '(searchValue: string, fromIndex?: number) => number',
        info: '反向查找子串位置'
    },
    {
        label: 'match',
        type: 'function',
        detail: '(regexp: RegExp | string) => RegExpMatchArray | null',
        info: '正则匹配'
    },
    {
        label: 'matchAll',
        type: 'function',
        detail: '(regexp: RegExp) => IterableIterator<RegExpMatchArray>',
        info: '正则全局匹配'
    },
    {
        label: 'replace',
        type: 'function',
        detail: '(searchValue: string | RegExp, replaceValue: string | Function) => string',
        info: '替换'
    },
    {
        label: 'replaceAll',
        type: 'function',
        detail: '(searchValue: string | RegExp, replaceValue: string | Function) => string',
        info: '全部替换'
    },
    {label: 'search', type: 'function', detail: '(regexp: RegExp | string) => number', info: '搜索匹配位置'},
    {label: 'slice', type: 'function', detail: '(start?: number, end?: number) => string', info: '提取子串'},
    {
        label: 'split',
        type: 'function',
        detail: '(separator: string | RegExp, limit?: number) => string[]',
        info: '分割字符串'
    },
    {label: 'substring', type: 'function', detail: '(start: number, end?: number) => string', info: '提取子串'},
    {label: 'toLowerCase', type: 'function', detail: '() => string', info: '转为小写'},
    {label: 'toUpperCase', type: 'function', detail: '() => string', info: '转为大写'},
    {label: 'toLocaleLowerCase', type: 'function', detail: '() => string', info: '转为本地小写'},
    {label: 'toLocaleUpperCase', type: 'function', detail: '() => string', info: '转为本地大写'},
    {label: 'trim', type: 'function', detail: '() => string', info: '去除首尾空白'},
    {label: 'trimStart', type: 'function', detail: '() => string', info: '去除开头空白'},
    {label: 'trimEnd', type: 'function', detail: '() => string', info: '去除末尾空白'},
    {
        label: 'padStart',
        type: 'function',
        detail: '(targetLength: number, padString?: string) => string',
        info: '开头填充'
    },
    {
        label: 'padEnd',
        type: 'function',
        detail: '(targetLength: number, padString?: string) => string',
        info: '末尾填充'
    },
    {
        label: 'startsWith',
        type: 'function',
        detail: '(searchString: string, position?: number) => boolean',
        info: '检查开头'
    },
    {
        label: 'endsWith',
        type: 'function',
        detail: '(searchString: string, endPosition?: number) => boolean',
        info: '检查末尾'
    },
    {label: 'repeat', type: 'function', detail: '(count: number) => string', info: '重复字符串'},
    {label: 'at', type: 'function', detail: '(index: number) => string | undefined', info: '返回指定位置字符'},
    {label: 'isWellFormed', type: 'function', detail: '() => boolean', info: '检查是否合规的 UTF-16'},
    {label: 'toWellFormed', type: 'function', detail: '() => string', info: '转换为合规的 UTF-16'},
    {label: 'toString', type: 'function', detail: '() => string', info: '返回字符串本身'},
];
