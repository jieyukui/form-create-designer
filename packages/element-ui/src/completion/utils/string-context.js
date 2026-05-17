/**
 * 引号 / 模板字符串上下文（基于文本扫描，弥补语法树未闭合时的漏判）
 */
export const QuoteContext = {
    CODE: 'code',
    STRING: 'string',
    TEMPLATE_LITERAL: 'template-literal',
    TEMPLATE_EXPRESSION: 'template-expression',
};

/**
 * 扫描光标前的文本，返回当前引号上下文
 *
 * @param {import('@codemirror/state').Text} doc
 * @param {number} pos
 * @returns {string} QuoteContext 枚举值
 */
export function getQuoteContextAt(doc, pos) {
    const text = doc.sliceString(0, pos);
    let mode = QuoteContext.CODE;
    let stringQuote = '';
    let templateExprDepth = 0;
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];
        const prev = i > 0 ? text[i - 1] : '';

        if (inLineComment) {
            if (ch === '\n') inLineComment = false;
            continue;
        }

        if (inBlockComment) {
            if (ch === '*' && next === '/') {
                inBlockComment = false;
                i++;
            }
            continue;
        }

        if (mode === QuoteContext.CODE) {
            if (ch === '/' && next === '/') {
                inLineComment = true;
                i++;
                continue;
            }
            if (ch === '/' && next === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (ch === '"' || ch === '\'') {
                mode = QuoteContext.STRING;
                stringQuote = ch;
                continue;
            }
            if (ch === '`') {
                mode = QuoteContext.TEMPLATE_LITERAL;
                continue;
            }
            continue;
        }

        if (mode === QuoteContext.STRING) {
            if (ch === stringQuote && !isEscaped(text, i)) {
                mode = QuoteContext.CODE;
                stringQuote = '';
            }
            continue;
        }

        if (mode === QuoteContext.TEMPLATE_LITERAL) {
            if (ch === '$' && next === '{' && !isEscaped(text, i)) {
                mode = QuoteContext.TEMPLATE_EXPRESSION;
                templateExprDepth = 1;
                i++;
                continue;
            }
            if (ch === '`' && !isEscaped(text, i)) {
                mode = QuoteContext.CODE;
            }
            continue;
        }

        if (mode === QuoteContext.TEMPLATE_EXPRESSION) {
            if (inNestedString(text, i, mode)) {
                i = skipNestedString(text, i);
                continue;
            }
            if (ch === '/' && next === '/') {
                inLineComment = true;
                i++;
                continue;
            }
            if (ch === '/' && next === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (ch === '"' || ch === '\'') {
                i = skipQuotedString(text, i, ch);
                continue;
            }
            if (ch === '`') {
                i = skipTemplateLiteral(text, i);
                continue;
            }
            if (ch === '{') {
                templateExprDepth++;
                continue;
            }
            if (ch === '}') {
                templateExprDepth--;
                if (templateExprDepth <= 0) {
                    mode = QuoteContext.TEMPLATE_LITERAL;
                    templateExprDepth = 0;
                }
            }
        }
    }

    return mode;
}

/**
 * 是否应阻止代码补全（普通字符串或模板字面量片段）
 */
export function shouldBlockCompletionInLiteral(doc, pos) {
    const ctx = getQuoteContextAt(doc, pos);
    return ctx === QuoteContext.STRING || ctx === QuoteContext.TEMPLATE_LITERAL;
}

/**
 * 是否在模板字符串的 ${} 表达式内（允许补全）
 */
export function isInTemplateExpression(doc, pos) {
    return getQuoteContextAt(doc, pos) === QuoteContext.TEMPLATE_EXPRESSION;
}

function isEscaped(text, index) {
    let slashes = 0;
    for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
        slashes++;
    }
    return slashes % 2 === 1;
}

function skipQuotedString(text, start, quote) {
    for (let i = start + 1; i < text.length; i++) {
        if (text[i] === quote && !isEscaped(text, i)) {
            return i;
        }
    }
    return text.length - 1;
}

function skipTemplateLiteral(text, start) {
    for (let i = start + 1; i < text.length; i++) {
        if (text[i] === '`' && !isEscaped(text, i)) {
            return i;
        }
    }
    return text.length - 1;
}

function inNestedString(text, index) {
    const ch = text[index];
    return ch === '"' || ch === '\'';
}

function skipNestedString(text, start) {
    return skipQuotedString(text, start, text[start]);
}
