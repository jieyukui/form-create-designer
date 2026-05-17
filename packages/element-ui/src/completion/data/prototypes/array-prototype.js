export const arrayPrototypeCompletions = [
    {label: 'push', type: 'function', detail: '(...items: T[]) => number', info: '在数组末尾添加元素'},
    {label: 'pop', type: 'function', detail: '() => T | undefined', info: '移除数组末尾元素'},
    {label: 'shift', type: 'function', detail: '() => T | undefined', info: '移除数组开头元素'},
    {label: 'unshift', type: 'function', detail: '(...items: T[]) => number', info: '在数组开头添加元素'},
    {label: 'slice', type: 'function', detail: '(start?: number, end?: number) => T[]', info: '返回数组的浅拷贝'},
    {
        label: 'splice',
        type: 'function',
        detail: '(start: number, deleteCount?: number, ...items: T[]) => T[]',
        info: '删除/替换/插入元素'
    },
    {label: 'concat', type: 'function', detail: '(...items: (T | T[])[]) => T[]', info: '合并数组'},
    {label: 'join', type: 'function', detail: '(separator?: string) => string', info: '将数组连接为字符串'},
    {
        label: 'indexOf',
        type: 'function',
        detail: '(searchElement: T, fromIndex?: number) => number',
        info: '查找元素索引'
    },
    {
        label: 'lastIndexOf',
        type: 'function',
        detail: '(searchElement: T, fromIndex?: number) => number',
        info: '反向查找元素索引'
    },
    {
        label: 'includes',
        type: 'function',
        detail: '(searchElement: T, fromIndex?: number) => boolean',
        info: '检查是否包含元素'
    },
    {
        label: 'find',
        type: 'function',
        detail: '(predicate: Function, thisArg?: any) => T | undefined',
        info: '查找第一个满足条件的元素'
    },
    {
        label: 'findIndex',
        type: 'function',
        detail: '(predicate: Function, thisArg?: any) => number',
        info: '查找第一个满足条件的索引'
    },
    {
        label: 'findLast',
        type: 'function',
        detail: '(predicate: Function, thisArg?: any) => T | undefined',
        info: '反向查找第一个满足条件的元素'
    },
    {
        label: 'findLastIndex',
        type: 'function',
        detail: '(predicate: Function, thisArg?: any) => number',
        info: '反向查找第一个满足条件的索引'
    },
    {label: 'filter', type: 'function', detail: '(predicate: Function, thisArg?: any) => T[]', info: '过滤数组'},
    {
        label: 'map',
        type: 'function',
        detail: '<U>(callback: (value: T, index: number, array: T[]) => U, thisArg?: any) => U[]',
        info: '映射数组'
    },
    {
        label: 'reduce',
        type: 'function',
        detail: '<U>(callback: (accumulator: U, currentValue: T, index: number, array: T[]) => U, initialValue: U) => U',
        info: '归约数组'
    },
    {
        label: 'reduceRight',
        type: 'function',
        detail: '<U>(callback: (accumulator: U, currentValue: T, index: number, array: T[]) => U, initialValue: U) => U',
        info: '反向归约数组'
    },
    {
        label: 'forEach',
        type: 'function',
        detail: '(callback: (value: T, index: number, array: T[]) => void, thisArg?: any) => void',
        info: '遍历数组'
    },
    {
        label: 'some',
        type: 'function',
        detail: '(predicate: Function, thisArg?: any) => boolean',
        info: '检查是否有元素满足条件'
    },
    {
        label: 'every',
        type: 'function',
        detail: '(predicate: Function, thisArg?: any) => boolean',
        info: '检查是否所有元素满足条件'
    },
    {label: 'sort', type: 'function', detail: '(compareFn?: (a: T, b: T) => number) => T[]', info: '排序数组'},
    {label: 'reverse', type: 'function', detail: '() => T[]', info: '反转数组'},
    {label: 'fill', type: 'function', detail: '(value: T, start?: number, end?: number) => T[]', info: '填充数组'},
    {
        label: 'copyWithin',
        type: 'function',
        detail: '(target: number, start: number, end?: number) => T[]',
        info: '复制数组内元素'
    },
    {label: 'flat', type: 'function', detail: '(depth?: number) => T[]', info: '展平数组'},
    {
        label: 'flatMap',
        type: 'function',
        detail: '<U>(callback: (value: T, index: number, array: T[]) => U | U[], thisArg?: any) => U[]',
        info: '映射并展平'
    },
    {label: 'toReversed', type: 'function', detail: '() => T[]', info: '返回反转后的新数组'},
    {label: 'toSorted', type: 'function', detail: '(compareFn?: Function) => T[]', info: '返回排序后的新数组'},
    {
        label: 'toSpliced',
        type: 'function',
        detail: '(start: number, deleteCount?: number, ...items: T[]) => T[]',
        info: '返回替换后的新数组'
    },
    {label: 'with', type: 'function', detail: '(index: number, value: T) => T[]', info: '返回替换指定位置的新数组'},
    {label: 'at', type: 'function', detail: '(index: number) => T | undefined', info: '返回指定位置的元素'},
    {label: 'entries', type: 'function', detail: '() => IterableIterator<[number, T]>', info: '返回键值对迭代器'},
    {label: 'keys', type: 'function', detail: '() => IterableIterator<number>', info: '返回键迭代器'},
    {label: 'values', type: 'function', detail: '() => IterableIterator<T>', info: '返回值迭代器'},
    {label: 'length', type: 'property', detail: 'number', info: '数组长度'},
    {label: 'toString', type: 'function', detail: '() => string', info: '返回字符串'},
    {label: 'toLocaleString', type: 'function', detail: '() => string', info: '返回本地化字符串'},
];
