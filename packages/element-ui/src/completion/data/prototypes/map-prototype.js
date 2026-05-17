export const mapPrototypeCompletions = [
    {label: 'get', type: 'function', detail: '(key: K) => V | undefined', info: '获取值'},
    {label: 'set', type: 'function', detail: '(key: K, value: V) => Map<K, V>', info: '设置键值对'},
    {label: 'has', type: 'function', detail: '(key: K) => boolean', info: '检查键是否存在'},
    {label: 'delete', type: 'function', detail: '(key: K) => boolean', info: '删除键值对'},
    {label: 'clear', type: 'function', detail: '() => void', info: '清空所有键值对'},
    {label: 'size', type: 'property', detail: 'number', info: '键值对数量'},
    {
        label: 'forEach',
        type: 'function',
        detail: '(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) => void',
        info: '遍历'
    },
    {label: 'keys', type: 'function', detail: '() => IterableIterator<K>', info: '键迭代器'},
    {label: 'values', type: 'function', detail: '() => IterableIterator<V>', info: '值迭代器'},
    {label: 'entries', type: 'function', detail: '() => IterableIterator<[K, V]>', info: '键值对迭代器'},
];
