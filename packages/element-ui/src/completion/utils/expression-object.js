import {extractImmediateObjectExpression, isPropertyAccessPosition} from './literal-prototype';

/**
 * 解析属性访问：obj.xxx
 *
 * @param {string} docBefore - 光标前的文本
 * @returns {{ objectName: string, partialProp: string, type: string } | null}
 */
export function parsePropertyAccess(docBefore) {
    const normalized = docBefore.replace(/`+$/, '');
    if (!isPropertyAccessPosition(docBefore)) {
        return null;
    }

    const dotMatch = normalized.match(/\.([\w$]*)$/);
    if (!dotMatch) return null;

    let beforeDot = normalized.substring(0, normalized.lastIndexOf('.'));
    const templateExpr = beforeDot.match(/\$\{([\s\S]*)$/);
    if (templateExpr) {
        beforeDot = templateExpr[1];
    }
    const objectName = extractImmediateObjectExpression(beforeDot);
    const partialProp = dotMatch[1];

    return {
        objectName,
        partialProp,
        type: 'dot'
    };
}
