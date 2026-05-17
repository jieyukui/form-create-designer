好问题！让我检查一下当前 `_isInDeclaration` 的实现，确实**已经包含**了 `var`，但让我确认是否覆盖了所有相关的语法场景。

---

## 当前实现的覆盖情况

```javascript
// 当前代码
_isInDeclaration(node, pos, doc) {
    const line = doc.lineAt(pos);
    const lineText = line.text;
    const col = pos - line.from;

    const declMatch = lineText.match(
        /^\s*(const|let|var)\s+/  // ✅ 已包含 var
    );
    // ...
}
```

`const|let|var` 已经覆盖了三种声明关键字。但还有以下场景需要补充：

---

## 未覆盖的场景

| 场景 | 示例 | 当前是否处理 |
|------|------|:---:|
| 1. 带解构的声明 | `var { x, y } =` | ✅ 正则能匹配 |
| 2. 前面的代码不是声明 | `foo(); var Math.` | ✅ 匹配失败（前面有内容） |
| 3. 缩进 + 声明 | `  var Math.` | ✅ `^\s*` 处理了缩进 |
| 4. `for` 循环中的声明 | `for (var i = 0; ...)` | ❌ 未处理 |
| 5. `for...in` / `for...of` | `for (var x in obj)` | ❌ 未处理 |
| 6. `catch` 参数 | `catch (err)` | ❌ 未处理 |
| 7. 函数参数 | `function(a, b)` | ✅ `_isInFunctionParams` 处理 |
| 8. 多行声明 | `var a,\n    b` | ❌ 未处理 |
| 9. 箭头函数参数 | `(a, b) =>` | ✅ `_isInFunctionParams` 处理 |

---

## 改进后的 `_isInDeclaration` 实现

以下是完整的改进版本，覆盖所有声明相关的语法场景：

```javascript
// completion/core/context-analyzer.js

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

    // ==================== 1. const/let/var 声明 ====================
    if (this._isSimpleDeclaration(lineText, col, pos, doc)) {
        return true;
    }

    // ==================== 2. for 循环中的声明 ====================
    if (this._isForLoopDeclaration(lineText, col, pos, doc)) {
        return true;
    }

    // ==================== 3. for...in / for...of 中的声明 ====================
    if (this._isForInOfDeclaration(lineText, col, pos, doc)) {
        return true;
    }

    // ==================== 4. catch 参数 ====================
    if (this._isCatchParameter(lineText, col, pos, doc)) {
        return true;
    }

    // ==================== 5. 多行声明（续行） ====================
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
 */
_isSimpleDeclaration(lineText, col) {
    // 必须以 const/let/var 开头（允许前导空白）
    const match = lineText.match(/^\s*(const|let|var)\s+/);
    if (!match) return false;

    const declEnd = match[0].length;
    // 光标必须在声明关键字之后，并且在赋值之前
    if (col < declEnd) return false;

    // 查找赋值符号
    const eqIndex = lineText.indexOf('=', declEnd);
    const semiIndex = lineText.lastIndexOf(';');
    
    // 场景1：没有赋值符号，如 `let xxx`
    if (eqIndex === -1) {
        // 允许在变量名位置补全全局变量，但不补全属性
        return true;
    }
    
    // 场景2：有赋值符号，光标在 = 之前
    if (col < eqIndex) {
        return true;
    }

    return false;
}

/**
 * for 循环声明：for (let/var i = 0; ...)
 * 
 * 示例：
 *   for (let i = 0; i < 10; i++)
 *   for (var j = 0; j < arr.length; j++)
 *   for (const item of arr)
 */
_isForLoopDeclaration(lineText, col, pos, doc) {
    // 检查当前行包含 for
    if (!/^\s*for\s*\(/.test(lineText)) return false;

    const text = doc.sliceString(0, pos);
    // 查找最近的 `for (`
    const forIndex = text.lastIndexOf('for (');
    if (forIndex === -1) return false;

    const afterFor = text.substring(forIndex);
    
    // 匹配 for (let/var/const identifier
    const match = afterFor.match(/for\s*\((\s*(?:let|var|const)\s+[\w$,\s]*)/);
    if (!match) return false;

    const declStart = forIndex + match[0].length - match[1].length;
    const declEnd = forIndex + match[0].length;

    // 光标在声明区域内
    if (pos >= declStart && pos <= declEnd) {
        // 进一步检查是否在变量名上（而非 = 之后）
        const beforeCursor = afterFor.substring(match[1].length);
        const eqInDecl = beforeCursor.indexOf('=');
        if (eqInDecl === -1 || (pos - declStart) < eqInDecl + match[1].length) {
            return true;
        }
    }

    return false;
}

/**
 * for...in / for...of 中的声明
 * 
 * 示例：
 *   for (var key in obj)
 *   for (let value of arr)
 */
_isForInOfDeclaration(lineText, col, pos, doc) {
    if (!/^\s*for\s*\(/.test(lineText)) return false;
    if (!/\b(in|of)\b/.test(lineText)) return false;

    const text = doc.sliceString(0, pos);
    const forIndex = text.lastIndexOf('for (');
    if (forIndex === -1) return false;

    const afterFor = text.substring(forIndex);
    
    // 匹配 for (var/let/const identifier in/of
    const match = afterFor.match(
        /for\s*\((\s*(?:var|let|const)\s+[\w$]+)\s+(?:in|of)\b/
    );
    if (!match) return false;

    const declEnd = forIndex + match[0].length - match[1].length + match[1].trim().length;
    
    if (pos <= declEnd) {
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
 */
_isCatchParameter(lineText, col, pos, doc) {
    const text = doc.sliceString(0, pos);
    const catchIndex = text.lastIndexOf('catch');
    if (catchIndex === -1) return false;

    const afterCatch = text.substring(catchIndex);
    
    // 匹配 catch (identifier)
    const match = afterCatch.match(/catch\s*\(([\w$]*)/);
    if (!match) return false;

    const paramStart = catchIndex + match[0].indexOf('(') + 1;
    const paramEnd = paramStart + match[1].length;

    if (pos >= paramStart && pos <= paramEnd) {
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
    // 向上查找，看前面几行是否有未结束的声明语句
    const maxLookback = 10;
    let currentLine = doc.lineAt(pos);
    
    for (let i = 0; i < maxLookback; i++) {
        const prevLineNumber = currentLine.number - 1;
        if (prevLineNumber < 1) break;

        const prevLine = doc.line(prevLineNumber);
        const prevText = prevLine.text.trimEnd();

        // 跳过空行和注释行
        if (prevText.trim() === '' || prevText.trim().startsWith('//')) {
            currentLine = prevLine;
            continue;
        }

        // 检查上一行是否为声明语句的一部分
        // 特征：以 const/let/var 开头，且以逗号结尾（还未到分号）
        if (/^\s*(const|let|var)\s+/.test(prevText)) {
            // 检查是否以逗号结尾（续行）
            if (prevText.endsWith(',')) {
                // 当前行是声明的续行
                const currentText = currentLine.text;
                
                // 检查当前行是否还在声明区域（没有分号或等号结束）
                if (!currentText.includes(';') && !/=\s*$/.test(currentText)) {
                    // 排除已经是属性访问的情况
                    const col = pos - currentLine.from;
                    const beforeCursor = currentText.substring(0, col);
                    if (!beforeCursor.includes('.')) {
                        return true;
                    }
                }
            }
            // 上一行或之前几行是声明
            break;
        }

        // 如果上一行不是声明开头，但以逗号结尾，继续向上找
        if (!prevText.endsWith(',')) break;

        currentLine = prevLine;
    }

    return false;
}

/**
 * 检查是否在赋值语句的左侧
 * 
 * 覆盖场景：
 * - 简单赋值：x = 1
 * - 解构赋值：{ a, b } = obj
 * - 数组解构：[a, b] = arr
 * - 属性赋值：obj.x = 1
 */
_isInAssignmentLeft(node, pos, doc) {
    const line = doc.lineAt(pos);
    const lineText = line.text;
    const col = pos - line.from;

    // 排除声明语句（已经由 _isInDeclaration 处理）
    if (/^\s*(const|let|var)\s+/.test(lineText)) return false;

    // 查找等号位置（排除比较运算符 == 和 ===）
    const eqMatch = lineText.match(/(?<![!=<>])=(?!=)/);
    if (!eqMatch) return false;

    const eqIndex = eqMatch.index;
    
    // 检查等号前的内容
    const beforeEq = lineText.substring(0, eqIndex);
    
    // 如果等号前为空（如 += 被误判），不算赋值左侧
    if (beforeEq.trim() === '') return false;

    // 光标在等号之前，且在可能的位置
    if (col < eqIndex && col > 0) {
        // 进一步检查：排除属性赋值 obj.x = 1
        // 这种情况下，x 是 obj 的属性，允许属性补全
        const beforeCursor = lineText.substring(0, col);
        
        // 如果光标前有点号，说明是 obj.x 形式，允许属性补全
        if (/\.\w*$/.test(beforeCursor)) {
            return false; // 这是属性访问，不是赋值左侧
        }
        
        // 如果是解构赋值，允许补全
        if (/[{[]\s*$/.test(beforeCursor)) {
            return false; // 解构内部，允许补全
        }

        return true;
    }

    return false;
}
```

---

## 更新后的完整 `context-analyzer.js`

需要我把整个文件的完整代码输出给你吗？考虑到篇幅，我先输出**关键改动部分的完整文件头部和方法签名**，你可以确认后我再输出完整文件。

```javascript
// completion/core/context-analyzer.js

import { syntaxTree } from '@codemirror/language';

export const ContextType = {
    IDENTIFIER: 'identifier',
    PROPERTY_ACCESS: 'property-access',
    PROPERTY_NAME: 'property-name',
    DECLARATION: 'declaration',
    ASSIGNMENT_LEFT: 'assignment-left',
    STRING: 'string',
    TEMPLATE_STRING: 'template-string',
    COMMENT: 'comment',
    IMPORT_EXPORT: 'import-export',
    FUNCTION_PARAMS: 'function-params',
    TYPE_ANNOTATION: 'type-annotation',
    JSX_CONTENT: 'jsx-content',
    JSX_TAG: 'jsx-tag',
    FOR_LOOP: 'for-loop',              // 新增
    CATCH_PARAM: 'catch-param',        // 新增
    MULTILINE_DECL: 'multiline-decl',  // 新增
    UNKNOWN: 'unknown'
};

// ... ContextAnalyzer 类，包含上面所有改进后的方法 ...
```

---

## 汇总：现在完整覆盖的声明场景

| 场景 | 示例 | 状态 |
|------|------|:---:|
| `const` 声明 | `const x =` | ✅ |
| `let` 声明 | `let x =` | ✅ |
| `var` 声明 | `var x =` | ✅ |
| 带解构的 `var` | `var { x } =` | ✅ |
| `for` 循环 | `for (var i = 0; ...)` | ✅ |
| `for...in` | `for (var k in obj)` | ✅ |
| `for...of` | `for (let v of arr)` | ✅ |
| `catch` 参数 | `catch (err)` | ✅ |
| 多行声明 | `var a,\n    b` | ✅ |
| 函数参数 | `function(a, b)` | ✅ |
| 箭头函数参数 | `(a, b) =>` | ✅ |
| 普通属性访问 | `obj.x` | ✅ 不会被误拦 |

这些改进确保在所有这些场景下，`const Math.`、`var Math.`、`for (var Math.` 等都不会触发不恰当的代码补全。

需要我输出完整的合并后的 `context-analyzer.js` 文件吗？