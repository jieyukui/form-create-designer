/** Reflect 静态方法补全项 */
export const reflectCompletions = [
    {
        label: 'apply',
        type: 'function',
        detail: '(target: Function, thisArg: any, args: any[]) => any',
        info: '调用函数'
    },
    {
        label: 'construct',
        type: 'function',
        detail: '(target: Function, args: any[], newTarget?: Function) => any',
        info: '调用构造函数'
    },
    {
        label: 'defineProperty',
        type: 'function',
        detail: '(target: object, key: string, attributes: object) => boolean',
        info: '定义属性'
    },
    {
        label: 'deleteProperty',
        type: 'function',
        detail: '(target: object, key: string) => boolean',
        info: '删除属性'
    },
    {
        label: 'get',
        type: 'function',
        detail: '(target: object, key: string, receiver?: any) => any',
        info: '获取属性值'
    },
    {
        label: 'getOwnPropertyDescriptor',
        type: 'function',
        detail: '(target: object, key: string) => PropertyDescriptor | undefined',
        info: '获取属性描述符'
    },
    {label: 'getPrototypeOf', type: 'function', detail: '(target: object) => object | null', info: '获取原型'},
    {label: 'has', type: 'function', detail: '(target: object, key: string) => boolean', info: '检查属性'},
    {label: 'isExtensible', type: 'function', detail: '(target: object) => boolean', info: '检查可扩展性'},
    {
        label: 'ownKeys',
        type: 'function',
        detail: '(target: object) => Array<string | symbol>',
        info: '获取所有自身键'
    },
    {label: 'preventExtensions', type: 'function', detail: '(target: object) => boolean', info: '阻止扩展'},
    {
        label: 'set',
        type: 'function',
        detail: '(target: object, key: string, value: any, receiver?: any) => boolean',
        info: '设置属性值'
    },
    {
        label: 'setPrototypeOf',
        type: 'function',
        detail: '(target: object, proto: object | null) => boolean',
        info: '设置原型'
    },
];
