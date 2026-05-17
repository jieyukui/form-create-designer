/** document 对象补全项（浏览器） */
export const documentCompletions = [
    {
        label: 'getElementById',
        type: 'function',
        detail: '(id: string) => HTMLElement | null',
        info: '通过 ID 获取元素'
    },
    {
        label: 'getElementsByClassName',
        type: 'function',
        detail: '(classNames: string) => HTMLCollection',
        info: '通过类名获取元素集合'
    },
    {
        label: 'getElementsByTagName',
        type: 'function',
        detail: '(tagName: string) => HTMLCollection',
        info: '通过标签名获取元素集合'
    },
    {
        label: 'getElementsByName',
        type: 'function',
        detail: '(name: string) => NodeList',
        info: '通过 name 属性获取元素集合'
    },
    {
        label: 'querySelector',
        type: 'function',
        detail: '(selectors: string) => Element | null',
        info: '返回匹配的第一个元素'
    },
    {
        label: 'querySelectorAll',
        type: 'function',
        detail: '(selectors: string) => NodeList',
        info: '返回匹配的所有元素'
    },
    {label: 'body', type: 'property', detail: 'HTMLElement', info: '文档的 body 元素'},
    {label: 'head', type: 'property', detail: 'HTMLElement', info: '文档的 head 元素'},
    {label: 'documentElement', type: 'property', detail: 'HTMLElement', info: '文档的根元素 (html)'},
    {label: 'title', type: 'property', detail: 'string', info: '文档标题'},
    {label: 'URL', type: 'property', detail: 'string', info: '文档的完整 URL'},
    {label: 'domain', type: 'property', detail: 'string', info: '文档的域名'},
    {label: 'referrer', type: 'property', detail: 'string', info: '来源页面的 URL'},
    {label: 'cookie', type: 'property', detail: 'string', info: '文档的 Cookie'},
    {label: 'readyState', type: 'property', detail: 'string', info: '文档加载状态'},
    {
        label: 'createElement',
        type: 'function',
        detail: '(tagName: string) => HTMLElement',
        info: '创建元素节点'
    },
    {label: 'createTextNode', type: 'function', detail: '(data: string) => Text', info: '创建文本节点'},
    {label: 'createDocumentFragment', type: 'function', detail: '() => DocumentFragment', info: '创建文档片段'},
    {label: 'createComment', type: 'function', detail: '(data: string) => Comment', info: '创建注释节点'},
    {label: 'createAttribute', type: 'function', detail: '(name: string) => Attr', info: '创建属性节点'},
    {
        label: 'addEventListener',
        type: 'function',
        detail: '(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) => void',
        info: '添加事件监听器'
    },
    {
        label: 'removeEventListener',
        type: 'function',
        detail: '(type: string, listener: EventListener, options?: boolean | EventListenerOptions) => void',
        info: '移除事件监听器'
    },
    {label: 'dispatchEvent', type: 'function', detail: '(event: Event) => boolean', info: '派发事件'},
    {label: 'write', type: 'function', detail: '(...text: string[]) => void', info: '向文档写入 HTML'},
    {
        label: 'writeln',
        type: 'function',
        detail: '(...text: string[]) => void',
        info: '向文档写入 HTML 并添加换行'
    },
    {label: 'hasFocus', type: 'function', detail: '() => boolean', info: '检查文档是否获得焦点'},
    {label: 'getSelection', type: 'function', detail: '() => Selection | null', info: '获取当前选中的文本'},
    {label: 'createRange', type: 'function', detail: '() => Range', info: '创建范围对象'},
    {
        label: 'elementFromPoint',
        type: 'function',
        detail: '(x: number, y: number) => Element | null',
        info: '获取指定坐标的元素'
    },
    {
        label: 'elementsFromPoint',
        type: 'function',
        detail: '(x: number, y: number) => Element[]',
        info: '获取指定坐标的所有元素'
    },
    {label: 'hidden', type: 'property', detail: 'boolean', info: '页面是否隐藏'},
    {label: 'visibilityState', type: 'property', detail: 'string', info: '页面可见性状态'},
];
