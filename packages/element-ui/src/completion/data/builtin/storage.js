/** Storage 接口补全项（localStorage / sessionStorage 共用） */
const storageMethodCompletions = [
    {label: 'setItem', type: 'function', detail: '(key: string, value: string) => void', info: '存储键值对'},
    {label: 'getItem', type: 'function', detail: '(key: string) => string | null', info: '获取指定键的值'},
    {label: 'removeItem', type: 'function', detail: '(key: string) => void', info: '删除指定键'},
    {label: 'clear', type: 'function', detail: '() => void', info: '清空所有存储'},
    {label: 'key', type: 'function', detail: '(index: number) => string | null', info: '获取指定索引的键名'},
    {label: 'length', type: 'property', detail: 'number', info: '存储的键值对数量'},
];

/** localStorage 补全项 */
export const localStorageCompletions = [...storageMethodCompletions];

/** sessionStorage 补全项 */
export const sessionStorageCompletions = [...storageMethodCompletions];
