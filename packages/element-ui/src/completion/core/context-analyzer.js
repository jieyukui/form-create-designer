import {syntaxTree} from '@codemirror/language';

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
    JSX_TAG: 'jsx-tag',                 // JSX 标签名
    ATTRIBUTE_VALUE: 'attribute-value', // HTML 属性值
    FOR_LOOP: 'for-loop',               // for 循环声明
    CATCH_PARAM: 'catch-param',         // catch 参数声明
    MULTILINE_DECL: 'multiline-decl',   // 多行声明续行
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
        this.node = null;           // 语法树节点（光标前）
        this.nodeAround = null;     // 语法树节点（光标周围）
        this.position = 0;          // 光标位置
        this.depth = 0;             // 嵌套深度
        this.scopeInfo = {};        // 作用域信息

        // 内部标记
        this._templateExpression = false;  // 在模板表达式内
        this._isImportExport = false;      // 在 import/export 中
        this._isFunctionParams = false;    // 在函数参数中
        this._isPropertyName = false;      // 在对象属性名位置
        this._parseError = false;          // 解析出错
    }
}

/**
 * 代码补全的语法上下文分析器
 *
 * 使用 CodeMirror 的语法树判断当前光标位置的上下文，
 * 决定是否适合进行代码补全。
 *
 * 主要职责：
 * 1. 判断当前是否在注释、字符串等不适合补全的位置
 * 2. 识别声明语句（const/let/var）避免错误补全
 * 3. 识别赋值左侧，避免错误补全
 * 4. 识别属性访问（obj.xxx）模式
 * 5. 识别 import/export 语句
 * 6. 识别模板字符串中的表达式位置
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
     * @param {EditorState} context.state - 编辑器状态
     * @param {number} context.pos - 光标位置
     * @param {boolean} context.explicit - 是否显式触发
     * @returns {CompletionContext} 分析结果
     */
    analyze(context) {
        const {state, pos} = context;
        const doc = state.doc;

        // 使用文档版本 + 位置作为缓存键
        const cacheKey = `${doc.version}_${pos}`;
        const cached = this._cache.get(cacheKey);
        if (cached) {
            return cached;
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

            // ==================== 1. 注释检查 ====================
            if (this._isInComment(nodeBefore, pos) || this._isInComment(nodeAround, pos)) {
                result.type = ContextType.COMMENT;
                result.isValid = false;
                this._setCache(cacheKey, result);
                return result;
            }

            // ==================== 2. 字符串检查 ====================
            if (this._isInString(nodeBefore, nodeAround, pos)) {
                // 检查是否在模板字符串的表达式内：`...${Math.}`
                if (this._isInTemplateExpression(nodeBefore, nodeAround, pos, doc)) {
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

            // ==================== 3. 声明语句检查 ====================
            if (this._isInDeclaration(nodeBefore, pos, doc)) {
                result.type = ContextType.DECLARATION;
                result.isValid = false; // 声明位置不应该触发对象属性补全
                this._setCache(cacheKey, result);
                return result;
            }

            // ==================== 4. 赋值左侧检查 ====================
            if (this._isInAssignmentLeft(nodeBefore, pos, doc)) {
                result.type = ContextType.ASSIGNMENT_LEFT;
                result.isValid = false;
                this._setCache(cacheKey, result);
                return result;
            }

            // ==================== 5. import/export 检查 ====================
            if (this._isInImportExport(nodeBefore, pos, doc)) {
                result.type = ContextType.IMPORT_EXPORT;
                result.isValid = true; // import/export 有自己的补全逻辑
                result._isImportExport = true;
                this._setCache(cacheKey, result);
                return result;
            }

            // ==================== 6. 函数参数检查 ====================
            if (this._isInFunctionParams(nodeBefore, pos)) {
                result.type = ContextType.FUNCTION_PARAMS;
                result.isValid = true;
                result._isFunctionParams = true;
            }

            // ==================== 7. 属性访问检查 ====================
            const propAccess = this._detectPropertyAccess(nodeBefore, pos, doc);
            if (propAccess) {
                result.type = ContextType.PROPERTY_ACCESS;
                result.isValid = true;
                result.objectName = propAccess.objectName;
                result.partialProp = propAccess.partialProp;
                this._setCache(cacheKey, result);
                return result;
            }

            // ==================== 8. 对象字面量属性名检查 ====================
            if (this._isInPropertyName(nodeBefore, pos)) {
                result.type = ContextType.PROPERTY_NAME;
                result.isValid = true;
                result._isPropertyName = true;
            }

            // ==================== 默认：标识符位置 ====================
            result.type = ContextType.IDENTIFIER;
            result.isValid = true;

        } catch (error) {
            // 解析失败时，默认允许补全（避免因分析错误导致补全完全失效）
            if (typeof console !== 'undefined' && console.debug) {
                console.debug('[ContextAnalyzer] 分析失败，使用默认上下文:', error.message);
            }
            result.type = ContextType.UNKNOWN;
            result.isValid = true;
            result._parseError = true;
        }

        this._setCache(cacheKey, result);
        return result;
    }

    // ==================== 注释检测 ====================

    /**
     * 检查是否在注释中
     */
    _isInComment(node, pos) {
        let current = node;
        let depth = 0;
        const maxDepth = 30;

        while (current && depth < maxDepth) {
            const typeName = current.type?.name;
            if (typeName === 'Comment' ||
                typeName === 'LineComment' ||
                typeName === 'BlockComment') {
                // 确认光标在注释范围内
                if (pos > current.from && pos <= current.to) {
                    return true;
                }
            }
            current = current.parent;
            depth++;
        }
        return false;
    }

    // ==================== 字符串检测 ====================

    /**
     * 检查是否在字符串中
     */
    _isInString(nodeBefore, nodeAround, pos) {
        // 检查节点本身及其父级是否为字符串
        for (const node of [nodeBefore, nodeAround]) {
            let current = node;
            let depth = 0;
            const maxDepth = 20;

            while (current && depth < maxDepth) {
                const typeName = current.type?.name;
                if (typeName === 'String' ||
                    typeName === 'TemplateString' ||
                    typeName?.startsWith('String') ||
                    typeName?.startsWith('TemplateString')) {
                    // 对于字符串，光标必须在内部（不在引号上）
                    if (pos > current.from + 1 && pos < current.to - 1) {
                        return true;
                    }
                }
                current = current.parent;
                depth++;
            }
        }
        return false;
    }

    /**
     * 检查是否在模板字符串的表达式内部
     *
     * 例如：`Hello ${name.}` 中的 name. 应该是有效的
     */
    _isInTemplateExpression(nodeBefore, nodeAround, pos, doc) {
        // 首先确认我们在模板字符串内
        let templateNode = null;

        for (const node of [nodeBefore, nodeAround]) {
            let current = node;
            let depth = 0;
            while (current && depth < 20) {
                const typeName = current.type?.name;
                if (typeName === 'TemplateString' || typeName?.startsWith('TemplateString')) {
                    templateNode = current;
                    break;
                }
                current = current.parent;
                depth++;
            }
        }

        if (!templateNode) return false;

        // 获取模板字符串的完整文本
        const templateText = doc.sliceString(templateNode.from, templateNode.to);
        const offsetInTemplate = pos - templateNode.from;

        // 分析 ${...} 表达式的位置
        const expressions = [];
        let i = 0;
        while (i < templateText.length) {
            const dollarBrace = templateText.indexOf('${', i);
            if (dollarBrace === -1) break;

            // 跳过转义的 \$
            if (dollarBrace > 0 && templateText[dollarBrace - 1] === '\\') {
                i = dollarBrace + 2;
                continue;
            }

            // 找到对应的 }
            let braceCount = 1;
            let j = dollarBrace + 2;
            let inString = false;
            let stringChar = '';

            while (j < templateText.length && braceCount > 0) {
                const ch = templateText[j];

                if (inString) {
                    if (ch === stringChar && templateText[j - 1] !== '\\') {
                        inString = false;
                    }
                } else {
                    if (ch === '"' || ch === '\'' || ch === '`') {
                        inString = true;
                        stringChar = ch;
                    } else if (ch === '{') {
                        braceCount++;
                    } else if (ch === '}') {
                        braceCount--;
                    }
                }
                j++;
            }

            if (braceCount === 0) {
                expressions.push({
                    start: dollarBrace + 2,
                    end: j - 1
                });
            }

            i = dollarBrace + 2;
        }

        // 检查光标是否在某个表达式内
        for (const expr of expressions) {
            if (offsetInTemplate >= expr.start && offsetInTemplate <= expr.end) {
                return true;
            }
        }

        return false;
    }

    /**
     * 获取字符串类型
     */
    _getStringType(nodeBefore, nodeAround) {
        for (const node of [nodeBefore, nodeAround]) {
            let current = node;
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
        }
        return ContextType.STRING;
    }

    // ==================== 声明检测 ====================

    /**
     * 检查是否在声明语句中
     *
     * 覆盖的声明场景：
     * - const/let/var 声明
     * - for 循环中的声明
     * - for...in / for...of 中的声明
     * - catch 参数
     * - 多行声明
     *
     * @returns {boolean}
     */
    _isInDeclaration(node, pos, doc) {
        const line = doc.lineAt(pos);
        const lineText = line.text;
        const col = pos - line.from;

        // 1. const/let/var 声明
        if (this._isSimpleDeclaration(lineText, col, doc, line)) {
            return true;
        }

        // 2. for 循环中的声明
        if (this._isForLoopDeclaration(lineText, col, pos, doc)) {
            return true;
        }

        // 3. for...in / for...of 中的声明
        if (this._isForInOfDeclaration(lineText, col, pos, doc)) {
            return true;
        }

        // 4. catch 参数
        if (this._isCatchParameter(pos, doc)) {
            return true;
        }

        // 5. 多行声明（续行）
        if (this._isMultilineDeclaration(pos, doc)) {
            return true;
        }

        return false;
    }

    /**
     * 简单声明：const/let/var xxx
     *
     * 示例：
     *   const abc = ...
     *   let xyz;
     *   var foo, bar
     *   var { x, y } = obj
     */
    _isSimpleDeclaration(lineText, col, doc, line) {
        // 必须以 const/let/var 开头（允许前导空白）
        const match = lineText.match(/^\s*(const|let|var)\s+/);
        if (!match) return false;

        const declKeywordEnd = match[0].length;

        // 光标必须在声明关键字之后
        if (col < declKeywordEnd) return false;

        // 获取光标前的文本
        const beforeCursor = lineText.substring(0, col);

        // 如果光标前有点号，说明是属性访问（如 const x = Math.）
        // 这种情况应该允许属性补全
        if (/\.\w*$/.test(beforeCursor)) {
            return false;
        }

        // 查找等号位置
        const eqIndex = lineText.indexOf('=');

        // 场景1：没有等号，整行都是声明
        // 如：const abc
        if (eqIndex === -1) {
            return true;
        }

        // 场景2：有等号，光标在等号之前
        // 如：const abc = ...
        if (col < eqIndex) {
            // 检查光标是否在变量名位置（不是逗号分隔的其他变量）
            return true;
        }

        // 光标在等号之后，这是赋值表达式的右侧，允许补全
        return false;
    }

    /**
     * for 循环中的声明：for (let/var i = 0; ...)
     *
     * 示例：
     *   for (let i = 0; i < 10; i++)
     *   for (var j = 0; j < arr.length; j++)
     *   for (let x = 0, y = 0; ...)
     */
    _isForLoopDeclaration(lineText, col, pos, doc) {
        // 检查当前行包含 for
        if (!/^\s*for\s*\(/.test(lineText)) return false;

        // 获取从文档开头到光标位置的文本
        const text = doc.sliceString(0, pos);
        const textLength = text.length;

        // 查找最近的未闭合的 `for (`
        let forIndex = -1;
        let searchPos = textLength - 1;
        let depth = 0;

        while (searchPos >= 0) {
            const ch = text[searchPos];
            if (ch === ')') depth++;
            else if (ch === '(') {
                depth--;
                if (depth < 0) {
                    // 检查前面是否是 for
                    const before = text.substring(Math.max(0, searchPos - 4), searchPos).trimEnd();
                    if (before.endsWith('for')) {
                        forIndex = searchPos;
                        break;
                    }
                    depth = 0;
                }
            }
            searchPos--;
        }

        if (forIndex === -1) return false;

        const afterFor = text.substring(forIndex);

        // 匹配 for (let/var/const 的声明部分
        const match = afterFor.match(
            /for\s*\(\s*(var|let|const)\s+/
        );
        if (!match) return false;

        // 计算声明区域的起始和结束位置
        const declStart = forIndex + match[0].length;

        // 找到声明的结束位置（分号或逗号...但需要处理嵌套括号）
        let declEnd = -1;
        let parenDepth = 1;
        for (let i = match[0].length; i < afterFor.length; i++) {
            const ch = afterFor[i];
            if (ch === '(') parenDepth++;
            else if (ch === ')') {
                parenDepth--;
                if (parenDepth === 0) {
                    declEnd = forIndex + i;
                    break;
                }
            } else if (ch === ';' && parenDepth === 1) {
                declEnd = forIndex + i;
                break;
            }
        }

        if (declEnd === -1 || declEnd >= textLength) {
            // 声明还未结束
            if (pos >= declStart && pos <= textLength) {
                // 进一步检查：光标在 = 之前
                const afterDecl = text.substring(declStart, pos);
                const eqIndex = afterDecl.indexOf('=');
                if (eqIndex === -1) return true;
            }
            return false;
        }

        // 光标在声明区域内
        if (pos >= declStart && pos <= declEnd) {
            const afterDecl = text.substring(declStart, pos);
            const eqIndex = afterDecl.indexOf('=');
            if (eqIndex === -1) return true;
            return false;
        }

        return false;
    }

    /**
     * for...in / for...of 中的声明
     *
     * 示例：
     *   for (var key in obj)
     *   for (let value of arr)
     *   for (const [k, v] of entries)
     */
    _isForInOfDeclaration(lineText, col, pos, doc) {
        if (!/^\s*for\s*\(/.test(lineText)) return false;
        if (!/\b(in|of)\b/.test(lineText)) return false;

        const text = doc.sliceString(0, pos);

        // 查找最近的 for (
        const forMatch = text.match(/for\s*\(([^)]*)$/);
        if (!forMatch) return false;

        const forIndex = text.lastIndexOf('for (');
        if (forIndex === -1) return false;

        const afterFor = text.substring(forIndex);

        // 匹配 for (var/let/const identifier in/of
        const match = afterFor.match(
            /for\s*\(\s*(var|let|const)\s+([\w$]*)/
        );
        if (!match) return false;

        const declKeywordEnd = forIndex + match[0].length - match[2].length;
        const declVarEnd = declKeywordEnd + match[2].length;

        if (pos >= declKeywordEnd && pos <= declVarEnd) {
            return true;
        }

        return false;
    }

    /**
     * catch 参数声明
     *
     * 示例：
     *   try { ... } catch (err) { ... }
     *   try { ... } catch (error) { ... }
     *   try { ... } catch { ... }  // 可选 catch 绑定
     */
    _isCatchParameter(pos, doc) {
        const text = doc.sliceString(0, pos);

        // 查找最后一个 catch
        const catchIndex = text.lastIndexOf('catch');
        if (catchIndex === -1) return false;

        const afterCatch = text.substring(catchIndex);

        // 匹配 catch (identifier) 或 catch (
        const match = afterCatch.match(/catch\s*\(([\w$]*)/);
        if (!match) return false;

        // 如果没有括号（可选 catch 绑定），不处理
        if (!afterCatch.includes('(')) return false;

        const openParenIndex = afterCatch.indexOf('(');
        const paramStart = catchIndex + openParenIndex + 1;
        const paramEnd = paramStart + match[1].length;

        if (pos >= paramStart && pos <= paramEnd && match[1].length > 0) {
            return true;
        }

        return false;
    }

    /**
     * 多行声明（续行）
     *
     * 示例：
     *   var a,
     *       b,   // 光标在这里
     *       c
     *   let x,
     *       y = 1,
     *       z  // 光标在这里
     */
    _isMultilineDeclaration(pos, doc) {
        const maxLookback = 10;
        let currentLine = doc.lineAt(pos);

        // 检查当前行是否可能是声明的续行
        // 不允许有独立的声明关键字
        const currentText = currentLine.text.trim();
        if (/^\s*(const|let|var)\s+/.test(currentText)) {
            return false; // 这是新的声明行
        }

        for (let i = 0; i < maxLookback; i++) {
            const prevLineNumber = currentLine.number - 1;
            if (prevLineNumber < 1) break;

            const prevLine = doc.line(prevLineNumber);
            const prevText = prevLine.text.trimEnd();

            // 跳过空行和注释行
            if (prevText.trim() === '' ||
                prevText.trim().startsWith('//') ||
                prevText.trim().startsWith('/*')) {
                currentLine = prevLine;
                continue;
            }

            // 检查上一行是否为声明语句的一部分
            const declMatch = prevText.match(/^\s*(const|let|var)\s+/);
            if (declMatch) {
                // 检查声明语句是否还未结束（以逗号结尾 = 续行）
                if (prevText.endsWith(',')) {
                    // 当前行是声明的续行
                    const col = pos - currentLine.from;
                    const beforeCursor = currentText.substring(0, col);

                    // 如果光标前没有点号且没有等号，则是声明变量名位置
                    if (!beforeCursor.includes('.') &&
                        !beforeCursor.includes('=') &&
                        !currentText.includes(';')) {
                        return true;
                    }
                }
                break;
            }

            // 如果上一行不是声明开头，但以逗号结尾，继续向上找
            if (!prevText.endsWith(',')) {
                break;
            }

            currentLine = prevLine;
        }

        return false;
    }

    // ==================== 赋值检测 ====================

    /**
     * 检查是否在赋值语句的左侧
     *
     * 覆盖场景：
     * - 简单赋值：x = 1（非声明语句中）
     * - 解构赋值：{ a, b } = obj
     * - 数组解构：[a, b] = arr
     *
     * 不覆盖：
     * - 属性赋值：obj.x = 1（允许属性补全）
     * - 声明语句中的赋值：const x = 1（由 _isInDeclaration 处理）
     */
    _isInAssignmentLeft(node, pos, doc) {
        const line = doc.lineAt(pos);
        const lineText = line.text;
        const col = pos - line.from;

        // 排除声明语句（已经由 _isInDeclaration 处理）
        if (/^\s*(const|let|var)\s+/.test(lineText)) return false;

        // 查找等号位置（排除比较运算符 == 和 ===, !=, !==, <=, >=）
        const eqMatch = lineText.match(/(?<![!=<>])=(?!=|>)/);
        if (!eqMatch) return false;

        const eqIndex = eqMatch.index;

        // 检查等号前的内容
        const beforeEq = lineText.substring(0, eqIndex);

        // 如果等号前为空（如 += 被误判），不算赋值左侧
        if (beforeEq.trim() === '') return false;

        // 光标在等号之前
        if (col < eqIndex && col > 0) {
            const beforeCursor = lineText.substring(0, col);

            // 排除属性赋值 obj.x = 1（允许属性补全）
            if (/\.\w*$/.test(beforeCursor)) {
                return false;
            }

            // 排除解构内部的属性名
            if (/[{[]\s*[\w$]*$/.test(beforeCursor.trimEnd())) {
                return false;
            }

            return true;
        }

        return false;
    }

    // ==================== import/export 检测 ====================

    /**
     * 检查是否在 import/export 语句中
     */
    _isInImportExport(node, pos, doc) {
        const line = doc.lineAt(pos);
        const lineText = line.text;
        const col = pos - line.from;

        // 获取完整语句（处理多行 import/export）
        let fullStatement = this._getFullStatement(doc, line);

        if (!/^\s*(import|export)\b/.test(fullStatement)) return false;

        // 检查是否在花括号内
        const openBraceIndex = fullStatement.indexOf('{');
        const closeBraceIndex = fullStatement.lastIndexOf('}');
        const offset = pos - (line.from - (fullStatement.length - lineText.length > 0 ?
            doc.lineAt(Math.max(1, line.number - 1)).from : line.from));

        // 简化处理：检查是否在花括号内
        if (openBraceIndex !== -1 && closeBraceIndex !== -1) {
            const globalOffset = doc.lineAt(Math.max(1, line.number - 1)).from;
            const adjustedOffset = pos - globalOffset;
            if (adjustedOffset > openBraceIndex && adjustedOffset < closeBraceIndex) {
                return true;
            }
        }

        // 检查是否在 import xxx from 的标识符位置
        if (/^\s*import\s+[\w$]*$/.test(lineText.substring(0, col))) {
            return true;
        }

        // 检查是否在 export xxx
        if (/^\s*export\s+[\w$]*$/.test(lineText.substring(0, col))) {
            return true;
        }

        return false;
    }

    // ==================== 函数参数检测 ====================

    /**
     * 检查是否在函数参数位置
     */
    _isInFunctionParams(node, pos) {
        let current = node;
        let depth = 0;
        const maxDepth = 30;

        while (current && depth < maxDepth) {
            const typeName = current.type?.name;
            if (typeName === 'ParamList' ||
                typeName === 'FormalParameters' ||
                typeName === 'ArgList' ||
                typeName === 'Arguments') {
                // 确认光标在参数列表范围内
                if (pos >= current.from && pos <= current.to) {
                    return true;
                }
            }
            current = current.parent;
            depth++;
        }
        return false;
    }

    // ==================== 属性访问检测 ====================

    /**
     * 检测属性访问：obj.xxx 或 obj[xxx]
     *
     * @returns {{ objectName: string, partialProp: string, type: string } | null}
     */
    _detectPropertyAccess(node, pos, doc) {
        // 方法1：使用语法树查找 MemberExpression 节点
        let current = node;
        let depth = 0;
        const maxDepth = 30;

        while (current && depth < maxDepth) {
            const typeName = current.type?.name;

            if (typeName === 'MemberExpression') {
                const text = doc.sliceString(current.from, pos);

                // 匹配 .xxx 模式
                const dotMatch = text.match(/\.([\w$]*)$/);
                if (dotMatch) {
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
                    const beforeBracket = text.substring(0, text.lastIndexOf('['));
                    const objectName = beforeBracket.trim();
                    const partialProp = bracketMatch[1].replace(/['"]/g, '');

                    return {
                        objectName: objectName,
                        partialProp: partialProp,
                        type: 'bracket'
                    };
                }

                return null;
            }

            current = current.parent;
            depth++;
        }

        // 方法2：语法树解析失败时的回退
        const line = doc.lineAt(pos);
        const text = doc.sliceString(Math.max(0, line.from), pos);

        // 更精确的点语法匹配
        // 匹配：identifier.identifier 或 expression.identifier
        const dotMatch = text.match(
            /([\w$\])'"`]+(?:\.[\w$]+)*)\.([\w$]*)$/
        );
        if (dotMatch) {
            // 验证这不是声明语句中的变量名
            const beforeMatch = doc.sliceString(0, line.from);
            if (!/^\s*(const|let|var)\s+[\w$,\s]*$/.test(beforeMatch + line.text.substring(0, line.text.indexOf('.')))) {
                return {
                    objectName: dotMatch[1],
                    partialProp: dotMatch[2],
                    type: 'dot-fallback'
                };
            }
        }

        // 匹配方括号访问：obj[...]
        const bracketMatch = text.match(
            /([\w$\])'"`]+)\[([\w$'"]*)$/
        );
        if (bracketMatch) {
            return {
                objectName: bracketMatch[1],
                partialProp: bracketMatch[2].replace(/['"]/g, ''),
                type: 'bracket-fallback'
            };
        }

        return null;
    }

    // ==================== 对象属性名检测 ====================

    /**
     * 检查是否在对象字面量属性名位置
     */
    _isInPropertyName(node, pos) {
        let current = node;
        let depth = 0;
        const maxDepth = 30;

        while (current && depth < maxDepth) {
            const typeName = current.type?.name;

            // Property 节点表示对象字面量中的属性
            if (typeName === 'Property' ||
                typeName === 'PropertyDefinition' ||
                typeName === 'ObjectExpression') {

                // 如果当前是 ObjectExpression，检查光标是否在属性名位置
                if (typeName === 'ObjectExpression') {
                    const text = current.toString();
                    // 简单启发式：检查是否在 { 后且不在 : 后
                    return this._isInObjectLiteralProperty(pos, current);
                }

                // 检查光标是否在属性名的子节点中
                const children = current.getChildren();
                for (const child of children) {
                    if (child.type?.name === 'PropertyName' ||
                        child.type?.name === 'Property') {
                        if (pos >= child.from && pos <= child.to) {
                            return true;
                        }
                    }
                }
            }

            current = current.parent;
            depth++;
        }
        return false;
    }

    /**
     * 检查是否在对象字面量的属性名位置（启发式）
     */
    _isInObjectLiteralProperty(pos, objectNode) {
        // 获取对象字面量文本
        const text = objectNode.toString();
        const offset = pos - objectNode.from;

        if (offset <= 1) return false; // 在 { 位置

        const beforeCursor = text.substring(0, offset);
        const afterCursor = text.substring(offset);

        // 如果前面有未闭合的 : 说明在属性值位置
        let inString = false;
        let stringChar = '';
        let braceDepth = 0;
        let lastColonPos = -1;

        for (let i = 0; i < beforeCursor.length; i++) {
            const ch = beforeCursor[i];

            if (inString) {
                if (ch === stringChar && beforeCursor[i - 1] !== '\\') {
                    inString = false;
                }
                continue;
            }

            if (ch === '"' || ch === '\'' || ch === '`') {
                inString = true;
                stringChar = ch;
                continue;
            }

            if (ch === '{') braceDepth++;
            else if (ch === '}') braceDepth--;
            else if (ch === ':' && braceDepth === 0) {
                lastColonPos = i;
            } else if (ch === ',' && braceDepth === 0) {
                lastColonPos = -1; // 重置，新的属性开始
            }
        }

        // 如果在最后一个冒号之后，说明在属性值位置
        if (lastColonPos !== -1) return false;

        // 检查后面是否有冒号
        const afterTrim = afterCursor.trimStart();
        if (afterTrim.startsWith(':') || afterTrim.startsWith('(')) return false;

        return true;
    }

    // ==================== 辅助方法 ====================

    /**
     * 获取完整的语句文本（跨行）
     */
    _getFullStatement(doc, startLine) {
        let text = startLine.text;
        let currentLineNum = startLine.number;

        // 向前查找，合并前面的行（如果前面的行未结束）
        while (currentLineNum > 1) {
            const prevLine = doc.line(currentLineNum - 1);
            const prevText = prevLine.text.trimEnd();
            if (prevText.endsWith(',') ||
                prevText.endsWith('{') ||
                prevText.endsWith('(') ||
                prevText.endsWith('&&') ||
                prevText.endsWith('||')) {
                text = prevText + ' ' + text;
                currentLineNum--;
            } else {
                break;
            }
        }

        return text;
    }

    /**
     * 获取完整的语法上下文（用于调试）
     *
     * @param {Object} context - CodeMirror CompletionContext
     * @param {number} pos - 光标位置
     * @returns {Object} 语法上下文信息
     */
    getSyntaxContext(context, pos) {
        try {
            const tree = syntaxTree(context.state);
            const node = tree.resolveInner(pos || context.pos, -1);

            const path = [];
            let current = node;
            let depth = 0;
            const maxDepth = 30;

            while (current && depth < maxDepth) {
                path.unshift({
                    type: current.type?.name,
                    from: current.from,
                    to: current.to,
                    size: current.to - current.from
                });
                current = current.parent;
                depth++;
            }

            return {
                path,
                nodeType: node.type?.name,
                nodeText: context.state.doc.sliceString(
                    node.from,
                    Math.min(node.to, node.from + 100)
                )
            };
        } catch (e) {
            return {error: e.message};
        }
    }

    /**
     * 设置缓存
     */
    _setCache(key, value) {
        if (this._cache.size >= this._maxCacheSize) {
            // 清除最早的缓存（Map 保持插入顺序）
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

    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return {
            size: this._cache.size,
            maxSize: this._maxCacheSize
        };
    }
}

// ==================== 全局单例 ====================

let analyzerInstance = null;

/**
 * 获取上下文分析器的单例
 * @returns {ContextAnalyzer}
 */
export function getContextAnalyzer() {
    if (!analyzerInstance) {
        analyzerInstance = new ContextAnalyzer();
    }
    return analyzerInstance;
}

/**
 * 快速分析：直接分析给定的 CompletionContext
 *
 * @param {Object} context - CodeMirror CompletionContext
 * @returns {CompletionContext}
 */
export function analyzeCompletionContext(context) {
    const analyzer = getContextAnalyzer();
    return analyzer.analyze(context);
}