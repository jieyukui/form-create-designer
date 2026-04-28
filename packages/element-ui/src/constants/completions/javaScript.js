// ==================== 预定义的常用补全项 ====================

/**
 * 预定义的 JavaScript/浏览器 API 补全项（带详细 info）
 */
export const defaultJavaScriptCompletions = [
    // Math 对象
    {label: 'Math', type: 'class', info: '内置对象，提供数学常数和函数', detail: '对象'},
    {label: 'Math.PI', type: 'constant', info: '圆周率 π ≈ 3.141592653589793', detail: '3.14159...'},
    {label: 'Math.E', type: 'constant', info: '自然对数的底数 e ≈ 2.718281828459045', detail: '2.71828...'},
    {label: 'Math.random', type: 'function', info: '返回 0（包含）到 1（不包含）之间的伪随机数', detail: '() => number'},
    {
        label: 'Math.floor',
        type: 'function',
        info: '向下取整，返回小于等于给定数字的最大整数',
        detail: '(x: number) => number'
    },
    {
        label: 'Math.ceil',
        type: 'function',
        info: '向上取整，返回大于等于给定数字的最小整数',
        detail: '(x: number) => number'
    },
    {label: 'Math.round', type: 'function', info: '四舍五入到最接近的整数', detail: '(x: number) => number'},
    {label: 'Math.abs', type: 'function', info: '返回绝对值', detail: '(x: number) => number'},
    {label: 'Math.max', type: 'function', info: '返回一组数中的最大值', detail: '(...values: number[]) => number'},
    {label: 'Math.min', type: 'function', info: '返回一组数中的最小值', detail: '(...values: number[]) => number'},
    {label: 'Math.pow', type: 'function', info: '返回 x 的 y 次幂', detail: '(x: number, y: number) => number'},
    {label: 'Math.sqrt', type: 'function', info: '返回平方根', detail: '(x: number) => number'},

    // console 对象
    {label: 'console', type: 'class', info: '提供浏览器控制台的日志输出功能', detail: '对象'},
    {label: 'console.log', type: 'function', info: '向控制台输出信息', detail: '(...args: any[]) => void'},
    {label: 'console.error', type: 'function', info: '向控制台输出错误信息（红色）', detail: '(...args: any[]) => void'},
    {label: 'console.warn', type: 'function', info: '向控制台输出警告信息（黄色）', detail: '(...args: any[]) => void'},
    {label: 'console.info', type: 'function', info: '向控制台输出信息性消息', detail: '(...args: any[]) => void'},
    {label: 'console.table', type: 'function', info: '以表格形式显示数据', detail: '(data: any) => void'},
    {label: 'console.time', type: 'function', info: '启动计时器', detail: '(label?: string) => void'},
    {label: 'console.timeEnd', type: 'function', info: '停止计时器并输出耗时', detail: '(label?: string) => void'},

    // 常用全局对象
    {label: 'document', type: 'variable', info: 'DOM 文档对象，操作页面元素的入口', detail: 'Document'},
    {label: 'window', type: 'variable', info: '浏览器窗口对象，表示当前浏览器窗口', detail: 'Window'},
    {label: 'JSON', type: 'class', info: 'JSON 解析和序列化工具', detail: '对象'},
    {
        label: 'JSON.parse',
        type: 'function',
        info: '解析 JSON 字符串为 JavaScript 对象',
        detail: '(text: string) => any'
    },
    {
        label: 'JSON.stringify',
        type: 'function',
        info: '将 JavaScript 对象序列化为 JSON 字符串',
        detail: '(value: any) => string'
    },
    {
        label: 'fetch',
        type: 'function',
        info: '发起网络请求（Fetch API）',
        detail: '(input: RequestInfo, init?: RequestInit) => Promise<Response>'
    },
    {label: 'Promise', type: 'class', info: '异步操作的最终结果', detail: 'Promise<T>'},
    {
        label: 'setTimeout',
        type: 'function',
        info: '延迟执行函数',
        detail: '(handler: Function, timeout?: number) => number'
    },
    {
        label: 'setInterval',
        type: 'function',
        info: '定时执行函数',
        detail: '(handler: Function, timeout?: number) => number'
    },
    {label: 'clearTimeout', type: 'function', info: '清除延迟执行', detail: '(id: number) => void'},
    {label: 'clearInterval', type: 'function', info: '清除定时执行', detail: '(id: number) => void'},

    // 内置构造函数
    {label: 'Array', type: 'class', info: '数组构造函数，用于创建数组', detail: 'Array(T)'},
    {label: 'Object', type: 'class', info: '对象构造函数', detail: 'Object'},
    {label: 'String', type: 'class', info: '字符串对象构造函数', detail: 'String'},
    {label: 'Number', type: 'class', info: '数字对象构造函数', detail: 'Number'},
    {label: 'Boolean', type: 'class', info: '布尔对象构造函数', detail: 'Boolean'},
    {label: 'Date', type: 'class', info: '日期和时间对象', detail: 'Date'},
    {label: 'RegExp', type: 'class', info: '正则表达式对象', detail: 'RegExp'},
    {label: 'Map', type: 'class', info: '键值对集合（保持插入顺序）', detail: 'Map(K, V)'},
    {label: 'Set', type: 'class', info: '值的集合（唯一性）', detail: 'Set(T)'},

    // 常用 ES6+ 特性
    {label: 'const', type: 'keyword', info: '声明块级作用域的常量', detail: 'const name = value'},
    {label: 'let', type: 'keyword', info: '声明块级作用域的变量', detail: 'let name = value'},
    {label: 'async', type: 'keyword', info: '声明异步函数', detail: 'async function name() {}'},
    {label: 'await', type: 'keyword', info: '等待 Promise 完成', detail: 'await promise'},
    {label: '箭头函数', type: 'function', info: '简洁的函数语法，不绑定自己的 this', detail: '(param) => expression'},
    {label: '解构赋值', type: 'keyword', info: '从数组或对象中提取值', detail: 'const { a, b } = obj'},
    {label: '展开运算符', type: 'keyword', info: '展开数组或对象', detail: '...iterable'}
];