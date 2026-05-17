/** Object 静态方法补全项 */
export const objectCompletions = [
    {label: 'keys', type: 'function', detail: '(obj: object) => string[]', info: '返回对象自身的可枚举属性名'},
    {label: 'values', type: 'function', detail: '(obj: object) => any[]', info: '返回对象自身的可枚举属性值'},
    {label: 'entries', type: 'function', detail: '(obj: object) => [string, any][]', info: '返回键值对数组'},
    {label: 'assign', type: 'function', detail: '(target: T, ...sources: any[]) => T', info: '合并对象'},
    {
        label: 'create',
        type: 'function',
        detail: '(proto: object | null, properties?: PropertyDescriptorMap) => object',
        info: '创建新对象'
    },
    {
        label: 'defineProperty',
        type: 'function',
        detail: '(obj: object, prop: string, descriptor: PropertyDescriptor) => object',
        info: '定义属性'
    },
    {
        label: 'defineProperties',
        type: 'function',
        detail: '(obj: object, props: PropertyDescriptorMap) => object',
        info: '定义多个属性'
    },
    {label: 'freeze', type: 'function', detail: '(obj: T) => T', info: '冻结对象'},
    {label: 'seal', type: 'function', detail: '(obj: T) => T', info: '密封对象'},
    {label: 'preventExtensions', type: 'function', detail: '(obj: T) => T', info: '阻止扩展'},
    {label: 'isFrozen', type: 'function', detail: '(obj: object) => boolean', info: '检查是否冻结'},
    {label: 'isSealed', type: 'function', detail: '(obj: object) => boolean', info: '检查是否密封'},
    {label: 'isExtensible', type: 'function', detail: '(obj: object) => boolean', info: '检查是否可扩展'},
    {
        label: 'getOwnPropertyDescriptor',
        type: 'function',
        detail: '(obj: object, prop: string) => PropertyDescriptor | undefined',
        info: '获取属性描述符'
    },
    {
        label: 'getOwnPropertyDescriptors',
        type: 'function',
        detail: '(obj: object) => PropertyDescriptorMap',
        info: '获取所有属性描述符'
    },
    {
        label: 'getOwnPropertyNames',
        type: 'function',
        detail: '(obj: object) => string[]',
        info: '获取自身属性名（含不可枚举）'
    },
    {
        label: 'getOwnPropertySymbols',
        type: 'function',
        detail: '(obj: object) => symbol[]',
        info: '获取自身 Symbol 属性'
    },
    {label: 'getPrototypeOf', type: 'function', detail: '(obj: object) => object | null', info: '获取原型对象'},
    {
        label: 'setPrototypeOf',
        type: 'function',
        detail: '(obj: object, proto: object | null) => object',
        info: '设置原型对象'
    },
    {
        label: 'is',
        type: 'function',
        detail: '(value1: any, value2: any) => boolean',
        info: '判断两个值是否相同'
    },
];
