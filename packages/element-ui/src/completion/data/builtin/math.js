/** Math 静态方法补全项 */
export const mathCompletions = [
    // 方法
    {label: 'abs', type: 'function', detail: '(x: number) => number', info: '返回绝对值'},
    {label: 'ceil', type: 'function', detail: '(x: number) => number', info: '向上取整'},
    {label: 'floor', type: 'function', detail: '(x: number) => number', info: '向下取整'},
    {label: 'round', type: 'function', detail: '(x: number) => number', info: '四舍五入'},
    {label: 'max', type: 'function', detail: '(...values: number[]) => number', info: '返回最大值'},
    {label: 'min', type: 'function', detail: '(...values: number[]) => number', info: '返回最小值'},
    {label: 'random', type: 'function', detail: '() => number', info: '返回 0-1 之间的随机数'},
    {label: 'sqrt', type: 'function', detail: '(x: number) => number', info: '返回平方根'},
    {
        label: 'pow',
        type: 'function',
        detail: '(base: number, exponent: number) => number',
        info: '返回 base 的 exponent 次幂'
    },
    {label: 'sin', type: 'function', detail: '(x: number) => number', info: '返回正弦值'},
    {label: 'cos', type: 'function', detail: '(x: number) => number', info: '返回余弦值'},
    {label: 'tan', type: 'function', detail: '(x: number) => number', info: '返回正切值'},
    {label: 'asin', type: 'function', detail: '(x: number) => number', info: '返回反正弦值'},
    {label: 'acos', type: 'function', detail: '(x: number) => number', info: '返回反余弦值'},
    {label: 'atan', type: 'function', detail: '(x: number) => number', info: '返回反正切值'},
    {
        label: 'atan2',
        type: 'function',
        detail: '(y: number, x: number) => number',
        info: '返回从 x 轴到点 (x,y) 的角度'
    },
    {label: 'exp', type: 'function', detail: '(x: number) => number', info: '返回 e 的 x 次幂'},
    {label: 'log', type: 'function', detail: '(x: number) => number', info: '返回自然对数'},
    {label: 'log10', type: 'function', detail: '(x: number) => number', info: '返回以 10 为底的对数'},
    {label: 'cbrt', type: 'function', detail: '(x: number) => number', info: '返回立方根'},
    {label: 'hypot', type: 'function', detail: '(...values: number[]) => number', info: '返回平方和的平方根'},
    {label: 'trunc', type: 'function', detail: '(x: number) => number', info: '返回整数部分'},
    {label: 'sign', type: 'function', detail: '(x: number) => number', info: '返回符号函数'},
    {label: 'clz32', type: 'function', detail: '(x: number) => number', info: '返回 32 位整数前导零的数量'},
    {label: 'imul', type: 'function', detail: '(a: number, b: number) => number', info: '返回 32 位整数乘法结果'},
    {label: 'fround', type: 'function', detail: '(x: number) => number', info: '返回最接近的 32 位浮点数'},

    // 常量
    {label: 'PI', type: 'constant', detail: '3.141592653589793', info: '圆周率 π'},
    {label: 'E', type: 'constant', detail: '2.718281828459045', info: '自然对数的底数 e'},
    {label: 'LN2', type: 'constant', detail: '0.6931471805599453', info: '2 的自然对数'},
    {label: 'LN10', type: 'constant', detail: '2.302585092994046', info: '10 的自然对数'},
    {label: 'LOG2E', type: 'constant', detail: '1.4426950408889634', info: '以 2 为底 e 的对数'},
    {label: 'LOG10E', type: 'constant', detail: '0.4342944819032518', info: '以 10 为底 e 的对数'},
    {label: 'SQRT1_2', type: 'constant', detail: '0.7071067811865476', info: '1/2 的平方根'},
    {label: 'SQRT2', type: 'constant', detail: '1.4142135623730951', info: '2 的平方根'}
];