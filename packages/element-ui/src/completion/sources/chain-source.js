import {parseFunctionSignature} from '../resolvers/signature-parser';
import {Priority} from '../core/priority';
import {getGlobalScope} from '../core/environment';
import {prototypeCompletions} from '../data/prototypes/index';

/**
 * 类型映射表
 *
 * 将已知的返回类型映射到 prototypeCompletions 中的键。
 * 这样就能复用原型链补全数据。
 */
const typeCompletionMap = {
    'HTMLElement': 'Element',
    'Element': 'Element',
    'HTMLDivElement': 'Element',
    'HTMLSpanElement': 'Element',
    'HTMLInputElement': 'Element',
    'HTMLButtonElement': 'Element',
    'HTMLFormElement': 'Element',
    'HTMLAnchorElement': 'Element',
    'HTMLImageElement': 'Element',
    'HTMLCanvasElement': 'Element',
    'HTMLVideoElement': 'Element',
    'HTMLAudioElement': 'Element',
    'NodeList': 'NodeList',
    'HTMLCollection': 'HTMLCollection',
    'Document': 'Element',   // Document 也支持 Element 的大部分方法
    'Window': 'Element',     // Window 有部分 DOM 方法
    'Array': 'Array',
    'String': 'String',
    'Number': 'Number',
    'Promise': 'Promise',
    'Map': 'Map',
    'Set': 'Set',
    'RegExp': 'RegExp',
    'Date': 'Date',
    'Error': 'Error',
};

/**
 * 链式调用类型推断与补全
 *
 * 基于已知方法的返回值类型，推断后续链式调用的补全。
 *
 * 这是一个基础实现，处理常见的 DOM 和内置对象链式调用。
 */
export class ChainTypeResolver {
    constructor() {
        // 方法 -> 返回值类型 映射
        this.returnTypeMap = new Map();

        this._initializeMappings();
    }

    /**
     * 初始化常用方法返回值类型映射
     */
    _initializeMappings() {
        // ==================== Document 方法 ====================
        this.register('document.querySelector', 'Element|null');
        this.register('document.querySelectorAll', 'NodeList');
        this.register('document.getElementById', 'Element|null');
        this.register('document.getElementsByClassName', 'HTMLCollection');
        this.register('document.getElementsByTagName', 'HTMLCollection');
        this.register('document.createElement', 'HTMLElement');
        this.register('document.body', 'HTMLElement');
        this.register('document.documentElement', 'HTMLElement');
        this.register('document.head', 'HTMLElement');

        // ==================== Element 方法 ====================
        const elementMethods = [
            'querySelector', 'querySelectorAll', 'getElementsByClassName',
            'getElementsByTagName', 'closest', 'parentElement',
            'nextElementSibling', 'previousElementSibling',
            'firstElementChild', 'lastElementChild',
            'appendChild', 'insertBefore', 'removeChild', 'replaceChild',
        ];
        for (const method of elementMethods) {
            // 这些方法的返回类型需要在运行时确定，先注册通用映射
            this.register(`Element.${method}`, null); // null 表示使用 Element 自身的补全
        }
        this.register('Element.querySelector', 'Element|null');
        this.register('Element.querySelectorAll', 'NodeList');
        this.register('Element.getElementsByClassName', 'HTMLCollection');
        this.register('Element.getElementsByTagName', 'HTMLCollection');
        this.register('Element.closest', 'Element|null');
        this.register('Element.parentElement', 'Element|null');
        this.register('Element.nextElementSibling', 'Element|null');
        this.register('Element.previousElementSibling', 'Element|null');
        this.register('Element.firstElementChild', 'Element|null');
        this.register('Element.lastElementChild', 'Element|null');

        // ==================== Array 方法 ====================
        const arrayReturningArray = [
            'map', 'filter', 'slice', 'concat', 'reverse', 'sort',
            'splice', 'flat', 'flatMap', 'toReversed', 'toSorted',
            'toSpliced', 'with'
        ];
        for (const method of arrayReturningArray) {
            this.register(`Array.prototype.${method}`, 'Array');
        }

        // ==================== String 方法 ====================
        const stringReturningString = [
            'trim', 'trimStart', 'trimEnd', 'toUpperCase', 'toLowerCase',
            'replace', 'replaceAll', 'slice', 'substring', 'substr',
            'concat', 'padStart', 'padEnd', 'repeat', 'toWellFormed',
            'normalize', 'toLocaleLowerCase', 'toLocaleUpperCase'
        ];
        for (const method of stringReturningString) {
            this.register(`String.prototype.${method}`, 'String');
        }

        // ==================== Promise 方法 ====================
        this.register('Promise.prototype.then', 'Promise');
        this.register('Promise.prototype.catch', 'Promise');
        this.register('Promise.prototype.finally', 'Promise');

        // ==================== Map/Set 方法 ====================
        this.register('Map.prototype.set', 'Map');
        this.register('Set.prototype.add', 'Set');
        this.register('Set.prototype.union', 'Set');
        this.register('Set.prototype.intersection', 'Set');
        this.register('Set.prototype.difference', 'Set');
        this.register('Set.prototype.symmetricDifference', 'Set');
    }

    /**
     * 注册方法返回类型
     * @param {string} methodPath - 如 'Array.prototype.map' 或 'document.querySelector'
     * @param {string|null} returnType - 返回类型，null 表示与原对象相同
     */
    register(methodPath, returnType) {
        this.returnTypeMap.set(methodPath, returnType);
    }

    /**
     * 获取方法的返回类型
     * @param {string} methodPath
     * @returns {string|null}
     */
    getReturnType(methodPath) {
        return this.returnTypeMap.get(methodPath) || null;
    }

    /**
     * 尝试从代码行中推断链式调用的类型
     *
     * @param {string} line - 光标前的代码行
     * @returns {string|null} 推断出的类型，用于在 prototypeCompletions 中查找
     */
    inferChainedType(line) {
        // 模式1: 已知函数调用的链式访问
        // 例如: document.querySelector('.class').|
        const chainMatch = line.match(/\)\.(\w*)$/);
        if (chainMatch) {
            // 尝试找到完整的函数调用链
            // 匹配: object.method(...).|
            const callMatch = line.match(
                /(\w+(?:\.\w+)*)\.(\w+)\([^)]*\)\.\w*$/
            );
            if (callMatch) {
                const [, obj, method] = callMatch;

                // 1. 先检查完整路径：obj.method
                const fullPath = `${obj}.${method}`;
                let returnType = this.getReturnType(fullPath);
                if (returnType && typeCompletionMap[returnType]) {
                    return typeCompletionMap[returnType];
                }

                // 2. 如果 obj 是已知类型，检查 Type.method
                // 例如：已知 obj 是 Array，查 Array.prototype.map
                const objType = this._inferObjectType(obj);
                if (objType) {
                    const protoPath = `${objType}.prototype.${method}`;
                    returnType = this.getReturnType(protoPath);
                    if (returnType && typeCompletionMap[returnType]) {
                        return typeCompletionMap[returnType];
                    }
                    // 如果方法没有注册返回类型，但对象类型已知
                    // 返回对象类型本身（很多方法返回 this 或同类型）
                    if (typeCompletionMap[objType]) {
                        return typeCompletionMap[objType];
                    }
                }

                // 3. 尝试直接匹配 Array.prototype.method
                const protoMethodPath = `Array.prototype.${method}`;
                returnType = this.getReturnType(protoMethodPath);
                if (returnType && typeCompletionMap[returnType]) {
                    return typeCompletionMap[returnType];
                }

                // 4. 尝试 String.prototype.method
                const strProtoPath = `String.prototype.${method}`;
                returnType = this.getReturnType(strProtoPath);
                if (returnType && typeCompletionMap[returnType]) {
                    return typeCompletionMap[returnType];
                }
            }
        }

        // 模式2: 属性链式访问
        // 例如: element.parentElement.|
        const propChain = line.match(/\.(\w+)\.(\w*)$/);
        if (propChain) {
            const [, lastProp] = propChain;
            // 尝试作为 Element 属性查找
            const propType = this.getReturnType(`Element.${lastProp}`);
            if (propType && typeCompletionMap[propType]) {
                return typeCompletionMap[propType];
            }
            if (propType === null) {
                // null 表示保持 Element 类型
                return 'Element';
            }
        }

        return null;
    }

    /**
     * 尝试推断对象名的类型
     */
    _inferObjectType(objectName) {
        const lowerName = objectName.toLowerCase();

        // 常见的变量名 -> 类型推断
        const nameHints = {
            'document': 'Document',
            'element': 'Element',
            'el': 'Element',
            'div': 'Element',
            'span': 'Element',
            'input': 'Element',
            'button': 'Element',
            'form': 'Element',
            'anchor': 'Element',
            'img': 'Element',
            'canvas': 'Element',
            'video': 'Element',
            'audio': 'Element',
            'array': 'Array',
            'arr': 'Array',
            'list': 'Array',
            'items': 'Array',
            'str': 'String',
            'text': 'String',
            'name': 'String',
            'num': 'Number',
            'val': 'Number',
            'count': 'Number',
            'promise': 'Promise',
            'map': 'Map',
            'set': 'Set',
            'regex': 'RegExp',
            'date': 'Date',
            'err': 'Error',
            'error': 'Error',
        };

        // 精确匹配
        if (nameHints[objectName]) {
            return nameHints[objectName];
        }

        // 模糊匹配
        if (lowerName.endsWith('array') || lowerName.endsWith('list') || lowerName.endsWith('items')) {
            return 'Array';
        }
        if (lowerName.endsWith('string') || lowerName.endsWith('str') || lowerName.endsWith('text')) {
            return 'String';
        }
        if (lowerName.endsWith('element') || lowerName.endsWith('el') || lowerName.endsWith('node')) {
            return 'Element';
        }
        if (lowerName.endsWith('map')) return 'Map';
        if (lowerName.endsWith('set')) return 'Set';
        if (lowerName.endsWith('promise')) return 'Promise';
        if (lowerName.endsWith('error') || lowerName.endsWith('err')) return 'Error';

        return null;
    }

    /**
     * 根据类型获取补全项
     * 直接复用 prototypeCompletions 数据
     *
     * @param {string} type - 类型名称（如 'Array', 'String', 'Element'）
     * @param {string} partialProp - 部分属性名
     * @returns {Array} 补全项
     */
    getCompletionsForType(type, partialProp = '') {
        const completions = prototypeCompletions[type];
        if (!completions) return [];

        if (!partialProp) return completions;

        return completions.filter(c =>
            c.label.toLowerCase().startsWith(partialProp.toLowerCase())
        );
    }
}

// 单例
let chainResolverInstance = null;

export function getChainTypeResolver() {
    if (!chainResolverInstance) {
        chainResolverInstance = new ChainTypeResolver();
    }
    return chainResolverInstance;
}

/**
 * 创建链式调用补全源
 *
 * 尝试根据前一个调用的返回类型提供补全。
 * 使用 prototypeCompletions 数据作为补全项的来源。
 *
 * @returns {Function} 补全源函数
 */
export function createChainCompletionSource() {
    const resolver = getChainTypeResolver();

    return (context) => {
        const cursor = context.pos;
        const line = context.state.sliceDoc(Math.max(0, cursor - 300), cursor);

        // 检测是否在链式调用中：xxx.yyy().|
        if (!/\)\.\w*$/.test(line)) return null;

        // 提取部分属性名
        const propMatch = line.match(/\.(\w*)$/);
        const partialProp = propMatch ? propMatch[1] : '';

        // 推断链式调用的类型
        const inferredType = resolver.inferChainedType(line);
        if (!inferredType) return null;

        // 获取该类型的补全项
        let completions = resolver.getCompletionsForType(inferredType, partialProp);

        if (completions.length === 0) {
            // 回退：尝试运行时扫描
            const scope = getGlobalScope();
            if (scope) {
                const typeObj = scope[inferredType];
                if (typeObj && typeObj.prototype) {
                    completions = buildRuntimeCompletions(
                        typeObj.prototype,
                        inferredType,
                        partialProp
                    );
                }
            }
        }

        if (completions.length === 0) return null;

        // 标记来源
        completions = completions.map(c => ({
            ...c,
            boost: c.boost || 60,
            source: 'chain-inference'
        }));

        return {
            from: cursor - partialProp.length,
            options: completions,
            validFor: /^\w*$/,
            sourcePriority: Priority.RUNTIME_PROTOTYPE_CHAIN
        };
    };
}

/**
 * 从运行时原型构建补全项
 */
function buildRuntimeCompletions(prototype, typeName, partialProp) {
    const completions = [];

    try {
        const names = Object.getOwnPropertyNames(prototype);
        for (const name of names) {
            if (name.startsWith('_')) continue;
            if (name === 'constructor') continue;
            if (!partialProp || name.toLowerCase().startsWith(partialProp.toLowerCase())) {
                const value = prototype[name];
                if (typeof value === 'function') {
                    const signature = parseFunctionSignature(value);
                    completions.push({
                        label: name,
                        type: 'function',
                        detail: signature || 'function',
                        info: `${typeName}.prototype.${name} (推断)`,
                        boost: 55,
                    });
                } else {
                    completions.push({
                        label: name,
                        type: 'property',
                        detail: typeof value,
                        info: `${typeName}.prototype.${name}`,
                        boost: 50,
                    });
                }
            }
        }
    } catch (e) {
        // 忽略运行时错误
    }

    return completions;
}