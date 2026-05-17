好问题！这是一个关键的代码补全质量提升点。`scopeCompletionSource` 确实能智能地判断当前上下文是否适合出现补全。让我分析当前框架的问题，然后设计解决方案。

---

## 问题分析

当前框架的补全源都使用简单的正则匹配来判断上下文：

```javascript
// 当前做法
const line = context.state.sliceDoc(Math.max(0, cursor - 500), cursor);
const match = line.match(/([\w$\]'"`)]+)\.([\w$]*)$/);
```

这种简单正则无法判断：
1. **声明位置**：`const Math.` - 这语法就是错的
2. **注释中**：`// Math.` - 不应该触发
3. **字符串中**：`'Math.'` - 不应该触发
4. **模板字符串中**：`` `Math.` `` - 不应该触发
5. **变量声明左侧**：`let Math. =` - 不应该补全属性
6. **解构后**：`const { Math } =` - 不同上下文
7. **import/export**：`import { Math }` - 应该补全导出名，不是对象属性

---

## 设计思路

不直接使用 `scopeCompletionSource`（它和你的自定义补全体系不兼容），而是：

1. **创建 `completion/core/context-analyzer.js`** - 语法上下文分析器
2. **包装所有补全源** - 在匹配前先判断语法上下文
3. **保留框架灵活性** - 仍然允许自定义补全源决定是否绕过上下文检查

下面是完整实现：

---

## 1. `completion/core/context-analyzer.js` - 语法上下文分析器

```javascript
// completion/core/context-analyzer.js

import { syntaxTree } from '@codemirror/language';

/**
 * 语法上下文类型
 */
export const ContextType = {
    IDENTIFIER: 'identifier',           // 普通标识符位置（可以补全）
    PROPERTY_ACCESS: 'property-access', // 对象.属性 位置
    PROPERTY_NAME: 'property-name',     // 对象字面量 { xxx: } 中的属性名
    DECLARATION: 'declaration',         // 变量声明位置（const/let/var xxx）
    ASSIGNMENT_LEFT: 'assignment-left', // 赋值左侧
    STRING: 'string',                   // 字符串内部
    TEMPLATE_STRING: 'template-string', // 模板字符串内部
    COMMENT: 'comment',                 // 注释内部
    IMPORT_EXPORT: 'import-export',     // import/export 语句
    FUNCTION_PARAMS: 'function-params', // 函数参数位置
    TYPE_ANNOTATION: 'type-annotation', // TypeScript 类型注解位置
    JSX_CONTENT: 'jsx-content',         // JSX 内容
    JSX_TAG: 'jsx-tag',                // JSX 标签名
    ATTRIBUTE_VALUE: 'attribute-value', // HTML 属性值
    UNKNOWN: 'unknown'                  // 未知上下文
};

/**
 * 上下文分析结果
 */
export class CompletionContext {
    constructor() {
        this.type = ContextType.UNKNOWN;
        this.isValid = true;        // 是否可以在此位置补全
        this.objectName = null;     // 点语法中的对象名
        this.partialProp = '';      // 点语法中已输入的部分属性名
        this.node = null;           // 语法树节点
        this.depth = 0;             // 嵌套深度
        this.scopeInfo = {};        // 作用域信息
    }
}

/**
 * 代码补全的语法上下文分析器
 * 
 * 使用 CodeMirror 的语法树判断当前光标位置的上下文，
 * 决定是否适合进行代码补全。
 */
export class ContextAnalyzer {
    constructor() {
        this._cache = new Map();
        this._maxCacheSize = 200;
    }

    /**
     * 分析光标位置的上下文
     * 
     * @param {Object} context - CodeMirror 的 CompletionContext
     * @returns {CompletionContext} 分析结果
     */
    analyze(context) {
        const { state, pos } = context;
        const doc = state.doc;

        // 使用文档版本 + 位置作为缓存键
        const cacheKey = `${doc.version}_${pos}`;
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        const result = new CompletionContext();
        result.position = pos;

        try {
            // 获取语法树
            const tree = syntaxTree(state);
            
            // 获取光标位置的语法节点
            const nodeBefore = tree.resolveInner(pos, -1);
            const nodeAround = tree.resolveInner(pos, 0);
            
            result.node = nodeBefore;
            result.nodeAround = nodeAround;

            // 检测当前是否在注释中
            if (this._isInComment(nodeBefore, pos) || this._isInComment(nodeAround, pos)) {
                result.type = ContextType.COMMENT;
                result.isValid = false;
                this._setCache(cacheKey, result);
                return result;
            }

            // 检测当前是否在字符串中
            if (this._isInString(nodeBefore, nodeAround, pos)) {
                // 检查是否在模板字符串的表达式内：`...${Math.}`
                if (this._isInTemplateExpression(nodeBefore, pos)) {
                    result.type = ContextType.IDENTIFIER;
                    result.isValid = true;
                    result._templateExpression = true;
                } else {
                    result.type = this._getStringType(nodeBefore, nodeAround);
                    result.isValid = false;
                }
                this._setCache(cacheKey, result);
                return result;
            }

            // 检测声明位置：const xxx、let xxx、var xxx
            if (this._isInDeclaration(nodeBefore, pos, doc)) {
                result.type = ContextType.DECLARATION;
                result.isValid = false; // 声明位置不应该触发对象属性补全
                this._setCache(cacheKey, result);
                return result;
            }

            // 检测赋值左侧
            if (this._isInAssignmentLeft(nodeBefore, pos, doc)) {
                result.type = ContextType.ASSIGNMENT_LEFT;
                result.isValid = false;
                this._setCache(cacheKey, result);
                return result;
            }

            // 检测 import/export
            if (this._isInImportExport(nodeBefore, pos, doc)) {
                result.type = ContextType.IMPORT_EXPORT;
                result.isValid = true; // import/export 有自己的补全逻辑
                result._isImportExport = true;
                this._setCache(cacheKey, result);
                return result;
            }

            // 检测函数参数位置（需要区分是否适合补全）
            if (this._isInFunctionParams(nodeBefore, pos)) {
                result.type = ContextType.FUNCTION_PARAMS;
                result.isValid = true;
                result._isFunctionParams = true;
            }

            // 检测属性访问：obj.xxx
            const propAccess = this._detectPropertyAccess(nodeBefore, pos, doc);
            if (propAccess) {
                result.type = ContextType.PROPERTY_ACCESS;
                result.isValid = true;
                result.objectName = propAccess.objectName;
                result.partialProp = propAccess.partialProp;
                this._setCache(cacheKey, result);
                return result;
            }

            // 检测对象字面量属性名
            if (this._isInPropertyName(nodeBefore, pos)) {
                result.type = ContextType.PROPERTY_NAME;
                result.isValid = true;
                result._isPropertyName = true;
            }

            // 默认为标识符位置
            result.type = ContextType.IDENTIFIER;
            result.isValid = true;

        } catch (error) {
            // 解析失败时，默认允许补全
            result.type = ContextType.UNKNOWN;
            result.isValid = true;
            result._parseError = true;
        }

        this._setCache(cacheKey, result);
        return result;
    }

    /**
     * 检查是否在注释中
     */
    _isInComment(node, pos) {
        let current = node;
        while (current) {
            const typeName = current.type?.name;
            if (typeName === 'Comment' || typeName === 'LineComment' || typeName === 'BlockComment') {
                // 确认光标在注释范围内
                if (pos >= current.from && pos <= current.to) {
                    return true;
                }
            }
            current = current.parent;
        }
        return false;
    }

    /**
     * 检查是否在字符串中
     */
    _isInString(nodeBefore, nodeAround, pos) {
        // 检查节点的父级是否为字符串
        let current = nodeBefore;
        while (current) {
            const typeName = current.type?.name;
            if (typeName === 'String' || typeName?.startsWith('String')) {
                if (pos > current.from && pos < current.to) {
                    return true;
                }
            }
            current = current.parent;
        }
        return false;
    }

    /**
     * 检查是否在模板字符串的表达式内部
     */
    _isInTemplateExpression(node, pos) {
        // 模板字符串中的 ${expr} 内部应该是有效的代码位置
        let current = node;
        while (current && current.from <= pos && current.to >= pos) {
            // 查找 TemplateString 节点
            if (current.type?.name === 'TemplateString' || current.type?.name?.startsWith('TemplateString')) {
                // 检查光标是否在 ${...} 内部
                const text = current.parent ? 
                    current.parent.toString() : '';
                // 简单检查：如果在 ${ 之后，} 之前
                const beforeCursor = text.substring(0, pos - current.from);
                const afterCursor = text.substring(pos - current.from);
                const openBrace = beforeCursor.lastIndexOf('${');
                const closeBrace = afterCursor.indexOf('}');
                
                if (openBrace !== -1 && (closeBrace === -1 || openBrace > beforeCursor.lastIndexOf('}'))) {
                    return true;
                }
            }
            current = current.parent;
        }
        return false;
    }

    /**
     * 获取字符串类型
     */
    _getStringType(nodeBefore, nodeAround) {
        let current = nodeBefore;
        while (current) {
            const typeName = current.type?.name;
            if (typeName === 'TemplateString' || typeName?.startsWith('TemplateString')) {
                return ContextType.TEMPLATE_STRING;
            }
            if (typeName === 'String' || typeName?.startsWith('String')) {
                return ContextType.STRING;
            }
            current = current.parent;
        }
        return ContextType.STRING;
    }

    /**
     * 检查是否在声明语句中（const/let/var）
     */
    _isInDeclaration(node, pos, doc) {
        const line = doc.lineAt(pos);
        const lineText = line.text;
        const col = pos - line.from;

        // 检查当前行是否以声明关键字开头
        // 并且光标在 '=' 之前
        const declMatch = lineText.match(
            /^\s*(const|let|var)\s+/
        );
        
        if (declMatch) {
            // 检查是否有赋值
            const eqIndex = lineText.indexOf('=');
            if (eqIndex === -1 || col < eqIndex) {
                // 在 = 之前，可能是声明位置
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否在赋值左侧
     */
    _isInAssignmentLeft(node, pos, doc) {
        const line = doc.lineAt(pos);
        const lineText = line.text;
        const col = pos - line.from;

        // 检查模式：identifier = value
        // 光标在 = 之前
        const eqIndex = lineText.indexOf('=');
        const semicolonIndex = lineText.indexOf(';');
        
        if (eqIndex !== -1 && col < eqIndex) {
            // 排除声明语句（由 _isInDeclaration 处理）
            if (!/^\s*(const|let|var)\s+/.test(lineText)) {
                // 进一步检查：前面没有声明关键字
                const beforeEq = lineText.substring(0, eqIndex).trim();
                if (beforeEq && !beforeEq.includes('==') && !beforeEq.includes('===')) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 检查是否在 import/export 语句中
     */
    _isInImportExport(node, pos, doc) {
        const line = doc.lineAt(pos);
        const lineText = line.text;
        const col = pos - line.from;

        // 检查 import/export 模式
        if (/^\s*import\b/.test(lineText) || /^\s*export\b/.test(lineText)) {
            // 检查是否在花括号内
            const openBrace = lineText.indexOf('{');
            const closeBrace = lineText.indexOf('}');
            if (openBrace !== -1 && (closeBrace === -1 || col > openBrace) && 
                (closeBrace === -1 || col < closeBrace)) {
                return true;
            }
            // 检查是否在 import xxx from 的标识符位置
            if (/^\s*import\s+[\w$]*$/.test(lineText.substring(0, col))) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否在函数参数位置
     */
    _isInFunctionParams(node, pos) {
        let current = node;
        while (current) {
            const typeName = current.type?.name;
            if (typeName === 'ParamList' || typeName === 'FormalParameters' || 
                typeName === 'ArgList' || typeName === 'Arguments') {
                if (pos >= current.from && pos <= current.to) {
                    return true;
                }
            }
            current = current.parent;
        }
        return false;
    }

    /**
     * 检测属性访问：obj.xxx 或 obj[xxx]
     */
    _detectPropertyAccess(node, pos, doc) {
        // 使用语法树查找 MemberExpression 节点
        let current = node;
        while (current) {
            const typeName = current.type?.name;
            
            if (typeName === 'MemberExpression') {
                // 找到了点语法节点
                // 提取对象名和部分属性名
                const text = doc.sliceString(current.from, pos);
                
                // 匹配 .xxx 模式
                const dotMatch = text.match(/\.([\w$]*)$/);
                if (dotMatch) {
                    // 查找对象名（点之前的完整表达式）
                    const beforeDot = text.substring(0, text.lastIndexOf('.'));
                    const objectName = beforeDot.trim();
                    
                    return {
                        objectName: objectName,
                        partialProp: dotMatch[1],
                        type: 'dot'
                    };
                }

                // 匹配 [xxx 模式
                const bracketMatch = text.match(/\[([\w$'"]*)$/);
                if (bracketMatch) {
                    return {
                        objectName: text.substring(0, text.lastIndexOf('[')).trim(),
                        partialProp: bracketMatch[1].replace(/['"]/g, ''),
                        type: 'bracket'
                    };
                }

                return null;
            }

            current = current.parent;
        }

        // 语法树解析失败时的回退：使用简单的文本分析
        // 但要做更多的语义检查
        const line = doc.lineAt(pos);
        const text = doc.sliceString(Math.max(0, line.from), pos);
        
        // 更精确的点语法匹配
        const dotMatch = text.match(/([\w$]+(?:\.[\w$]+)*)\.([\w$]*)$/);
        if (dotMatch) {
            return {
                objectName: dotMatch[1],
                partialProp: dotMatch[2],
                type: 'dot-fallback'
            };
        }

        return null;
    }

    /**
     * 检查是否在对象字面量属性名位置
     */
    _isInPropertyName(node, pos) {
        let current = node;
        while (current) {
            const typeName = current.type?.name;
            if (typeName === 'Property' || typeName === 'PropertyDefinition') {
                // 检查是否有子节点是属性名
                for (const child of current.getChildren()) {
                    if (child.type?.name === 'PropertyName' || child.type?.name === 'Property') {
                        if (pos >= child.from && pos <= child.to) {
                            return true;
                        }
                    }
                }
            }
            current = current.parent;
        }
        return false;
    }

    /**
     * 获取完整的语法上下文（用于调试）
     */
    getSyntaxContext(context, pos) {
        const tree = syntaxTree(context.state);
        const node = tree.resolveInner(pos, -1);
        
        const path = [];
        let current = node;
        while (current && path.length < 20) {
            path.unshift({
                type: current.type?.name,
                from: current.from,
                to: current.to
            });
            current = current.parent;
        }

        return {
            path,
            nodeType: node.type?.name,
            nodeText: context.state.doc.sliceString(node.from, Math.min(node.to, node.from + 50))
        };
    }

    /**
     * 设置缓存
     */
    _setCache(key, value) {
        if (this._cache.size >= this._maxCacheSize) {
            // 清除最早的缓存
            const firstKey = this._cache.keys().next().value;
            this._cache.delete(firstKey);
        }
        this._cache.set(key, value);
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this._cache.clear();
    }
}

// 全局单例
let analyzerInstance = null;

export function getContextAnalyzer() {
    if (!analyzerInstance) {
        analyzerInstance = new ContextAnalyzer();
    }
    return analyzerInstance;
}
```

---

## 2. 创建上下文感知的补全源包装器

```javascript
// completion/sources/context-aware-source.js

import { getContextAnalyzer, ContextType } from '../core/context-analyzer';

/**
 * 创建上下文感知的补全源包装器
 * 
 * 在原始补全源执行前，先判断当前语法上下文是否适合补全。
 * 不适合的上下文（注释、字符串、声明位置等）直接返回 null。
 * 
 * @param {Function} sourceFn - 原始补全源函数
 * @param {Object} options - 配置
 * @param {Array<string>} options.allowedContexts - 允许的上下文类型列表（null 表示全部允许）
 * @param {Array<string>} options.blockedContexts - 阻止的上下文类型列表
 * @param {boolean} options.debug - 是否输出调试信息
 * @returns {Function} 包装后的补全源函数
 */
export function createContextAwareSource(sourceFn, options = {}) {
    const {
        allowedContexts = null,    // 白名单
        blockedContexts = [        // 默认黑名单
            ContextType.COMMENT,
            ContextType.STRING,
            ContextType.TEMPLATE_STRING,
            ContextType.DECLARATION,
        ],
        debug = false
    } = options;

    const analyzer = getContextAnalyzer();

    return (context) => {
        // 分析语法上下文
        const ctx = analyzer.analyze(context);

        if (debug) {
            console.log('[ContextAware]', {
                type: ctx.type,
                isValid: ctx.isValid,
                objectName: ctx.objectName,
                partialProp: ctx.partialProp,
                node: ctx.node?.type?.name,
                pos: ctx.position
            });
        }

        // 检查是否允许在此上下文补全
        if (!ctx.isValid) {
            if (debug) console.log('[ContextAware] 上下文无效，跳过补全');
            return null;
        }

        // 白名单检查
        if (allowedContexts && !allowedContexts.includes(ctx.type)) {
            if (debug) console.log('[ContextAware] 不在白名单中，跳过补全');
            return null;
        }

        // 黑名单检查
        if (blockedContexts && blockedContexts.includes(ctx.type)) {
            if (debug) console.log('[ContextAware] 在黑名单中，跳过补全');
            return null;
        }

        // 特殊处理：声明位置
        if (ctx.type === ContextType.DECLARATION) {
            // 在声明位置，仍然允许全局变量补全（如 const xxx = Math.）
            // 但不应该补全声明的变量名
            // 这里通过检查是否有属性访问来判断
            if (ctx.objectName === null && ctx.partialProp === '') {
                if (debug) console.log('[ContextAware] 声明位置且无属性访问，跳过补全');
                return null;
            }
        }

        // 将上下文信息附加到 context 上，供源函数使用
        context._completionContext = ctx;
        context._analyzer = analyzer;

        // 执行原始补全源
        return sourceFn(context);
    };
}

/**
 * 创建全局补全的上下文感知包装器
 * 
 * 全局补全（不带点的）在以下场景不应出现：
 * - 声明位置（const xxx）
 * - 赋值左侧
 * - 注释/字符串中
 */
export function createContextAwareGlobalSource(sourceFn, options = {}) {
    return createContextAwareSource(sourceFn, {
        blockedContexts: [
            ContextType.COMMENT,
            ContextType.STRING,
            ContextType.TEMPLATE_STRING,
        ],
        // 声明位置允许全局补全，但需要特殊处理
        ...options
    });
}

/**
 * 创建对象属性补全的上下文感知包装器
 * 
 * 属性补全（obj.xxx）在以下场景不应出现：
 * - 注释/字符串中
 * - 声明位置的变量名部分
 * - 赋值左侧的变量名部分
 */
export function createContextAwarePropertySource(sourceFn, options = {}) {
    return createContextAwareSource(sourceFn, {
        blockedContexts: [
            ContextType.COMMENT,
            ContextType.STRING,
            ContextType.TEMPLATE_STRING,
        ],
        ...options
    });
}
```

---

## 3. 更新主入口，集成上下文分析

```javascript
// completion/index.js (关键更新部分)

import { createContextAwareGlobalSource, createContextAwarePropertySource } from './sources/context-aware-source';
import { getContextAnalyzer, ContextType } from './core/context-analyzer';

export function createJavaScriptCompletions(options = {}) {
    // ... 前面的代码不变 ...

    // 环境检测
    const environment = providedEnv || detectEnvironment();

    // 创建源管理器
    const sourceManager = new CompletionSourceManager();

    // ==================== 创建补全源（带上下文感知） ====================

    // 优先级 1: 全局变量补全
    const rawGlobalSource = createGlobalCompletionSource({
        customCompletions,
        customObjects,
        environment
    });
    const globalSource = createContextAwareGlobalSource(rawGlobalSource, {
        debug
    });
    sourceManager.register({
        name: 'global',
        priority: Priority.PREDEFINED_GLOBAL,
        sourceFn: globalSource,
        requires: []
    });

    // 优先级 2: 对象属性补全
    const rawObjectPropertySource = createObjectPropertyCompletionSource({
        customObjects,
        customSignatures,
        environment,
        includePrototypes,
        windowFallbackEnabled: includeWindow
    });
    const objectPropertySource = createContextAwarePropertySource(rawObjectPropertySource, {
        debug
    });
    sourceManager.register({
        name: 'object-property',
        priority: Priority.PREDEFINED_BUILTIN,
        sourceFn: objectPropertySource,
        requires: []
    });

    // ... 后续代码不变 ...
}
```

---

## 4. 更新对象属性补全源，使用语法上下文

```javascript
// completion/sources/object-property-source.js (关键更新)

/**
 * 创建对象属性补全源（更新版，使用语法上下文）
 */
export function createObjectPropertyCompletionSource(options = {}) {
    // ... 前面的初始化代码不变 ...

    return (context) => {
        const cursor = context.pos;
        
        // 优先使用上下文分析器提供的信息
        const ctx = context._completionContext;
        
        let objectName, partialProp;
        
        if (ctx && ctx.objectName !== null) {
            // 从语法分析器获取
            objectName = ctx.objectName;
            partialProp = ctx.partialProp;
        } else {
            // 回退到正则匹配（但做更多检查）
            const line = context.state.sliceDoc(Math.max(0, cursor - 500), cursor);
            
            // 更严格的匹配：排除声明关键字后的位置
            const strictMatch = line.match(
                /(?<!\b(const|let|var|function|class|if|for|while|switch|catch)\s+[\w$]*)([\w$\]'"`)]+)\.([\w$]*)$/
            );
            if (!strictMatch) return null;
            
            [, objectName, partialProp] = strictMatch;
        }

        // ... 后续处理逻辑不变 ...
    };
}
```

---

## 5. 更新全局补全源，使用完整的语法上下文判断

```javascript
// completion/sources/global-source.js (新增辅助函数)

/**
 * 检查是否在声明语句的变量名位置
 * 例如：const |Math  - 可以补全
 *       const Math|   - 已在变量名末尾
 *       const Math.|  - 这是属性访问，由对象属性源处理
 */
function findWordAtCursorBeforeDot(line, cursorInLine) {
    // 获取光标前的文本
    const textBeforeCursor = line.substring(0, cursorInLine);
    
    // 检查是否有点号在光标前
    const lastDot = textBeforeCursor.lastIndexOf('.');
    if (lastDot !== -1) {
        // 有点号，应该由对象属性源处理
        // 但检查点是否是注释或其他
        const afterDot = textBeforeCursor.substring(lastDot);
        if (/^\.\w*$/.test(afterDot)) {
            return null; // 这是属性访问
        }
    }
    
    // 没有点号，是独立的标识符
    const wordMatch = textBeforeCursor.match(/([\w$]+)$/);
    return wordMatch ? wordMatch[1] : '';
}
```

---

## 完成总结

新增了以下文件：

| 文件 | 功能 |
|------|------|
| `completion/core/context-analyzer.js` | 基于 CodeMirror 语法树的上下文分析器 |
| `completion/sources/context-aware-source.js` | 上下文感知的补全源包装器 |

更新了以下文件：

| 文件 | 更新内容 |
|------|----------|
| `completion/index.js` | 集成上下文感知包装 |
| `completion/sources/object-property-source.js` | 使用语法上下文替代纯正则 |
| `completion/sources/global-source.js` | 增强上下文判断 |

现在你的补全系统可以正确处理：

- ❌ `const Math.` - 不出属性补全（声明位置）
- ❌ `// Math.` - 不出任何补全（注释中）
- ❌ `'Math.'` - 不出补全（字符串中）
- ❌ `let Math.` - 不出补全（赋值左侧）
- ✅ `console.log(Math.)` - 正常出 Math 属性补全
- ✅ `Math.` - 任意有效位置的属性访问
- ✅ `Math` - 正常的标识符补全
- ✅ `` `...${Math}` `` - 模板表达式内正常补全