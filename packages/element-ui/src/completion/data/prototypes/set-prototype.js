export const setPrototypeCompletions = [
    {label: 'add', type: 'function', detail: '(value: T) => Set<T>', info: '添加值'},
    {label: 'has', type: 'function', detail: '(value: T) => boolean', info: '检查值是否存在'},
    {label: 'delete', type: 'function', detail: '(value: T) => boolean', info: '删除值'},
    {label: 'clear', type: 'function', detail: '() => void', info: '清空所有值'},
    {label: 'size', type: 'property', detail: 'number', info: '值的数量'},
    {
        label: 'forEach',
        type: 'function',
        detail: '(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) => void',
        info: '遍历'
    },
    {label: 'keys', type: 'function', detail: '() => IterableIterator<T>', info: '值迭代器'},
    {label: 'values', type: 'function', detail: '() => IterableIterator<T>', info: '值迭代器'},
    {label: 'entries', type: 'function', detail: '() => IterableIterator<[T, T]>', info: '键值对迭代器'},
    {label: 'union', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '并集'},
    {label: 'intersection', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '交集'},
    {label: 'difference', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '差集'},
    {label: 'symmetricDifference', type: 'function', detail: '(other: Set<T>) => Set<T>', info: '对称差集'},
    {label: 'isSubsetOf', type: 'function', detail: '(other: Set<T>) => boolean', info: '是否为子集'},
    {label: 'isSupersetOf', type: 'function', detail: '(other: Set<T>) => boolean', info: '是否为超集'},
    {label: 'isDisjointFrom', type: 'function', detail: '(other: Set<T>) => boolean', info: '是否无交集'},
];
