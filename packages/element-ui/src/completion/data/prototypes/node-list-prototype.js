// NodeList (DOM)
export const nodeListPrototypeCompletions = [
    {label: 'length', type: 'property', detail: 'number', info: '节点数量'},
    {label: 'item', type: 'function', detail: '(index: number) => Node | null', info: '获取指定索引的节点'},
    {
        label: 'forEach',
        type: 'function',
        detail: '(callback: (node: Node, index: number, list: NodeList) => void, thisArg?: any) => void',
        info: '遍历节点'
    },
    {label: 'entries', type: 'function', detail: '() => IterableIterator<[number, Node]>', info: '键值对迭代器'},
    {label: 'keys', type: 'function', detail: '() => IterableIterator<number>', info: '键迭代器'},
    {label: 'values', type: 'function', detail: '() => IterableIterator<Node>', info: '值迭代器'},
];
