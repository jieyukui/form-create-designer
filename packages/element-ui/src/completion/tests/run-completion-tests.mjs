/**
 * 代码补全 / 语法上下文 测试套件
 *
 * 运行（在 packages/element-ui 目录下）:
 *   node src/completion/tests/run-completion-tests.mjs
 *
 * 可选: node src/completion/tests/run-completion-tests.mjs --verbose
 */

import {EditorState} from '@codemirror/state';
import {javascript} from '@codemirror/lang-javascript';
import {CompletionContext} from '@codemirror/autocomplete';
import {ContextType, analyzeCompletionContext} from '../core/context-analyzer.js';
import {createJavaScriptCompletions, normalizeCustomObjectCompletions} from '../index.js';
import {detectLiteralPrototypeType} from '../utils/literal-prototype.js';
import {parsePropertyAccess} from '../utils/expression-object.js';
import {getQuoteContextAt, QuoteContext, shouldBlockCompletionInLiteral} from '../utils/string-context.js';

const verbose = process.argv.includes('--verbose');

function createState(code, cursorIndex = code.length) {
    return EditorState.create({
        doc: code,
        selection: {anchor: cursorIndex},
        extensions: [javascript({jsx: false, typescript: false})]
    });
}

function analyzeAt(code, pos = code.length) {
    const state = createState(code, pos);
    const ctx = new CompletionContext(state, pos, false);
    return analyzeCompletionContext(ctx);
}

const testEnvironment = {
    type: 'browser',
    hasWindow: false,
    hasDocument: false,
    hasLocalStorage: true,
    hasSessionStorage: true,
    features: ['localStorage', 'sessionStorage']
};

const sampleCustomObjectTree = {
    myApp: {
        version: {label: 'version', type: 'property', detail: 'string', info: '版本'},
        request: {label: 'request', type: 'function', detail: '()', info: '请求'},
        api: {
            user: {
                get: {label: 'get', type: 'function', detail: '(id)', info: '获取用户'},
                list: {label: 'list', type: 'function', detail: '()', info: '列表'}
            },
            post: {label: 'post', type: 'function', detail: '(data)', info: '提交'}
        }
    }
};

async function completeAt(code, pos = code.length, explicit = false, extraOptions = {}) {
    const state = createState(code, pos);
    const cmCtx = new CompletionContext(state, pos, explicit);
    const config = createJavaScriptCompletions({
        includeWindow: false,
        includeChain: false,
        environment: testEnvironment,
        ...extraOptions
    });
    const source = config.override[0];
    return source(cmCtx);
}

function labels(result) {
    if (!result?.options) return [];
    return result.options.map(o => o.label);
}

function hasLabels(result, expected) {
    const set = new Set(labels(result));
    return expected.every(l => set.has(l));
}

function lacksLabels(result, forbidden) {
    const set = new Set(labels(result));
    return forbidden.every(l => !set.has(l));
}

// ==================== 上下文分析用例 ====================

const contextCases = [
    {
        group: '声明位置（应禁止普通补全）',
        cases: [
            {name: 'const 变量名', code: 'const x', expect: {type: ContextType.DECLARATION, isValid: false}},
            {name: 'let 变量名', code: 'let x', expect: {type: ContextType.DECLARATION, isValid: false}},
            {name: 'var 变量名', code: 'var x', expect: {type: ContextType.DECLARATION, isValid: false}},
            {
                name: 'const 赋值右侧',
                code: 'const x = ',
                expect: {type: ContextType.IDENTIFIER, isValid: true, note: '等号后允许表达式补全，但不应弹出全局列表'}
            },
            {
                name: '带解构的 var',
                code: 'var { x }',
                expect: {type: ContextType.DECLARATION, isValid: false}
            },
            {
                name: 'for 循环初始化',
                code: 'for (var i = 0; i < 10; i++) {}',
                pos: 'for (var i'.length,
                expect: {type: ContextType.DECLARATION, isValid: false, altTypes: [ContextType.ASSIGNMENT_LEFT]}
            },
            {
                name: 'for...in',
                code: 'for (var k in obj) {}',
                pos: 'for (var k'.length,
                expect: {type: ContextType.DECLARATION, isValid: false}
            },
            {
                name: 'for...of',
                code: 'for (let v of arr) {}',
                pos: 'for (let v'.length,
                expect: {type: ContextType.DECLARATION, isValid: false}
            },
            {
                name: 'catch 参数',
                code: 'try {} catch (err) {}',
                pos: 'try {} catch (err) {}'.indexOf('err') + 2,
                expect: {type: ContextType.DECLARATION, isValid: false}
            },
            {
                name: '多行声明续行',
                code: 'var a,\n    b',
                pos: 'var a,\n    b'.length,
                expect: {type: ContextType.DECLARATION, isValid: false}
            },
        ]
    },
    {
        group: '函数参数（声明类，应禁止普通全局补全）',
        cases: [
            {
                name: 'function 参数',
                code: 'function foo(a, b) { return a; }',
                pos: 'function foo(a, '.length,
                expect: {type: ContextType.FUNCTION_PARAMS, isValid: true}
            },
            {
                name: '箭头函数参数',
                code: '(a, b) => a + b',
                pos: '(a, '.length,
                expect: {type: ContextType.FUNCTION_PARAMS, isValid: true}
            },
        ]
    },
    {
        group: '属性访问（应识别且 isValid）',
        cases: [
            {
                name: '普通属性访问',
                code: 'obj.x',
                expect: {type: ContextType.PROPERTY_ACCESS, isValid: true, objectName: 'obj'}
            },
            {
                name: 'const Math.',
                code: 'const x = Math.',
                expect: {type: ContextType.PROPERTY_ACCESS, isValid: true, objectName: 'Math'}
            },
            {
                name: 'var Math.',
                code: 'var x = Math.',
                expect: {type: ContextType.PROPERTY_ACCESS, isValid: true, objectName: 'Math'}
            },
            {
                name: 'for 体内 Math.',
                code: 'for (var i = 0; i < Math.; i++) {}',
                pos: 'for (var i = 0; i < Math.; i++) {}'.indexOf('Math.') + 5,
                expect: {type: ContextType.PROPERTY_ACCESS, isValid: true, objectName: 'Math'}
            },
            {
                name: '空数组字面量 [].',
                code: 'const arr = [].',
                expect: {type: ContextType.PROPERTY_ACCESS, isValid: true, objectName: '[]'}
            },
            {
                name: '空字符串 "".',
                code: 'const s = "".',
                expect: {type: ContextType.PROPERTY_ACCESS, isValid: true, objectName: '""'}
            },
        ]
    },
    {
        group: '字符串 / 模板字符串',
        cases: [
            {
                name: '双引号字符串内',
                fn: () => getQuoteContextAt(createState('"Math').doc, '"Math'.length),
                expect: {type: QuoteContext.STRING}
            },
            {
                name: '单引号字符串内',
                code: "const s = 'Mat'",
                expect: {type: ContextType.STRING, isValid: false}
            },
            {
                name: '模板字面量片段',
                fn: () => getQuoteContextAt(createState('`hello Mat').doc, '`hello Mat'.length),
                expect: {type: QuoteContext.TEMPLATE_LITERAL}
            },
            {
                name: '模板字面量纯文本（双引号）',
                code: "const t = `hello Mat",
                expect: {type: ContextType.TEMPLATE_STRING, isValid: false}
            },
            {
                name: '模板表达式内',
                code: "const s = `value ${Mat",
                expect: {type: ContextType.IDENTIFIER, isValid: true}
            },
            {
                name: '模板表达式属性访问',
                code: "const s = `value ${Math.",
                expect: {type: ContextType.PROPERTY_ACCESS, isValid: true, objectName: 'Math'}
            },
        ]
    },
    {
        group: '字面量工具函数',
        cases: [
            {
                name: 'parsePropertyAccess []',
                fn: () => parsePropertyAccess('const arr = [].'),
                expect: {objectName: '[]', partialProp: ''}
            },
            {
                name: 'detectLiteralPrototypeType []',
                fn: () => detectLiteralPrototypeType('const arr = [].', '[]'),
                expect: {type: 'Array'}
            },
            {
                name: 'detectLiteralPrototypeType ""',
                fn: () => detectLiteralPrototypeType('const s = "".', '""'),
                expect: {type: 'String'}
            },
        ]
    },
];

// ==================== 补全结果用例 ====================

const completionCases = [
    {
        group: '声明位置不应出现全局/Storage 补全',
        cases: [
            {name: 'const x =', code: 'const x = ', forbid: ['Math', 'localStorage', 'getItem']},
            {name: 'let y =', code: 'let y = ', forbid: ['Math', 'push']},
            {name: 'var z =', code: 'var z = ', forbid: ['console', 'getItem']},
        ]
    },
    {
        group: '属性访问应返回正确成员',
        cases: [
            {
                name: 'const Math.',
                code: 'const x = Math.',
                require: ['abs', 'max'],
                forbid: ['getItem', 'setItem', 'localStorage']
            },
            {
                name: 'var Math.',
                code: 'var x = Math.',
                require: ['abs', 'min'],
                forbid: ['getItem', 'push']
            },
            {
                name: 'for 体内 Math.',
                code: 'for (var i = 0; i < Math.; i++) {}',
                pos: 'for (var i = 0; i < Math.'.length,
                require: ['abs', 'PI'],
                forbid: ['getItem', 'setItem']
            },
            {
                name: 'Math.',
                code: 'const x = Math.',
                require: ['abs', 'max'],
                forbid: ['getItem', 'setItem', 'localStorage']
            },
            {
                name: '[].  → Array 原型',
                code: 'const arr = [].',
                require: ['push', 'length', 'map'],
                forbid: ['getItem', 'setItem', 'clear', 'localStorage']
            },
            {
                name: '"".  → String 原型',
                code: 'const s = "".',
                require: ['charAt', 'length', 'slice'],
                forbid: ['getItem', 'setItem', 'push']
            },
            {
                name: 'localStorage.',
                code: 'localStorage.',
                require: ['getItem', 'setItem', 'length'],
                forbid: ['push', 'charAt']
            },
        ]
    },
    {
        group: '字符串内不应补全',
        cases: [
            {
                name: '双引号内 Math',
                code: 'const s = "Mat"',
                expectEmpty: true,
                forbid: ['Math', 'Map', 'let']
            },
            {
                name: '单引号内 Math',
                code: "const msg = 'Mat'",
                expectEmpty: true,
                forbid: ['Math', 'parseInt']
            },
            {
                name: '模板字面量纯文本',
                code: "const t = `hello Mat",
                expectEmpty: true,
                forbid: ['Math', 'Map']
            },
        ]
    },
    {
        group: '模板 ${} 内可补全',
        cases: [
            {
                name: '模板表达式内 Math',
                code: "const t = `x ${Ma",
                explicit: true,
                require: ['Math', 'Map'],
                forbid: ['getItem']
            },
            {
                name: '模板表达式内 Math.',
                code: "const t = `x ${Math.",
                explicit: true,
                require: ['abs', 'max'],
                forbid: ['getItem', 'let']
            },
        ]
    },
    {
        group: '关键字补全',
        cases: [
            {
                name: 'const 关键字',
                code: 'con',
                require: ['const'],
                checkApply: {label: 'const', expectInsert: 'const '}
            },
            {
                name: 'return 关键字带空格',
                code: 'ret',
                require: ['return'],
                checkApply: {label: 'return', expectInsert: 'return '}
            },
            {
                name: 'this 关键字无空格',
                code: 'thi',
                require: ['this'],
                checkApply: {label: 'this', expectInsert: 'this'}
            },
            {
                name: 'default 关键字无空格',
                code: 'defa',
                require: ['default'],
                checkApply: {label: 'default', expectInsert: 'default'}
            },
            {
                name: 'break 关键字无空格',
                code: 'bre',
                require: ['break'],
                checkApply: {label: 'break', expectInsert: 'break'}
            },
            {
                name: 'continue 关键字无空格',
                code: 'cont',
                require: ['continue'],
                checkApply: {label: 'continue', expectInsert: 'continue'}
            },
            {
                name: 'for...of 的 of',
                code: 'of',
                require: ['of'],
                checkApply: {label: 'of', expectInsert: 'of '}
            },
        ]
    },
    {
        group: '点号后不应回退到全局列表',
        cases: [
            {
                name: '显式触发 [].',
                code: 'const arr = [].',
                explicit: true,
                forbid: ['localStorage', 'window', 'document']
            },
        ]
    },
    {
        group: 'customObjectCompletions 树形',
        completionOptions: {customObjectCompletions: sampleCustomObjectTree},
        cases: [
            {
                name: 'myApp 顶层属性',
                code: 'myApp.',
                require: ['version', 'request', 'api']
            },
            {
                name: 'myApp.api 二级',
                code: 'myApp.api.',
                require: ['user', 'post']
            },
            {
                name: 'myApp.api.user 三级',
                code: 'myApp.api.user.',
                require: ['get', 'list']
            },
            {
                name: '全局补全 myApp',
                code: 'myA',
                require: ['myApp']
            },
        ]
    },
];

function runContextCase(testCase) {
    if (testCase.fn) {
        const got = testCase.fn();
        const exp = testCase.expect;
        const ok = (!exp.type || got === exp.type || got?.type === exp.type)
            && (!exp.objectName || got?.objectName === exp.objectName)
            && (exp.partialProp === undefined || got?.partialProp === exp.partialProp);
        return {ok, got, expect: exp};
    }

    const pos = testCase.pos ?? testCase.code.length;
    const got = analyzeAt(testCase.code, pos);
    const exp = testCase.expect;
    let ok = true;
    const details = [];

    if (exp.note && !exp.type) {
        return {ok: true, got: {type: got.type, isValid: got.isValid}, expect: exp};
    }

    if (exp.type && got.type !== exp.type) {
        const altOk = exp.altTypes && exp.altTypes.includes(got.type);
        if (!altOk) {
            ok = false;
            details.push(`type: ${got.type} !== ${exp.type}`);
        }
    }
    if (exp.isValid !== undefined && got.isValid !== exp.isValid) {
        ok = false;
        details.push(`isValid: ${got.isValid} !== ${exp.isValid}`);
    }
    if (exp.objectName !== undefined && got.objectName !== exp.objectName) {
        ok = false;
        details.push(`objectName: ${got.objectName} !== ${exp.objectName}`);
    }

    return {ok, got: {type: got.type, isValid: got.isValid, objectName: got.objectName}, expect: exp, details};
}

function runNormalizeObjectCompletionsTests() {
    const {topLevel, nestedPaths} = normalizeCustomObjectCompletions(sampleCustomObjectTree);
    const checks = [
        ['topLevel myApp', topLevel.myApp?.map(c => c.label).sort().join(','), 'api,request,version'],
        ['nested myApp.api', nestedPaths['myApp.api']?.map(c => c.label).sort().join(','), 'post,user'],
        ['nested myApp.api.user', nestedPaths['myApp.api.user']?.map(c => c.label).sort().join(','), 'get,list'],
    ];
    let ok = true;
    for (const [name, got, expect] of checks) {
        if (got !== expect) {
            ok = false;
            console.error(`  normalize ${name}: got "${got}" !== "${expect}"`);
        }
    }
    return ok;
}

async function runCompletionCase(testCase, groupOptions = {}) {
    const pos = testCase.pos ?? testCase.code.length;
    const result = await completeAt(
        testCase.code,
        pos,
        testCase.explicit === true,
        {...groupOptions, ...testCase.completionOptions}
    );
    const gotLabels = labels(result).slice(0, 12);

    let ok = true;
    const details = [];

    if (testCase.require && !hasLabels(result, testCase.require)) {
        ok = false;
        details.push(`缺少: ${testCase.require.filter(l => !labels(result).includes(l)).join(', ')}`);
    }
    if (testCase.forbid && !lacksLabels(result, testCase.forbid)) {
        ok = false;
        details.push(`不应出现: ${testCase.forbid.filter(l => labels(result).includes(l)).join(', ')}`);
    }
    if (testCase.expectEmpty && result?.options?.length > 0) {
        ok = false;
        details.push(`期望无补全，实际 ${result.options.length} 项`);
    }

    if (!testCase.require && !testCase.forbid && !testCase.expectEmpty && !testCase.checkApply && !result) {
        ok = false;
        details.push('无任何补全结果');
    }

    if (testCase.checkApply && result?.options) {
        const item = result.options.find(o => o.label === testCase.checkApply.label);
        if (!item) {
            ok = false;
            details.push(`未找到关键字 ${testCase.checkApply.label}`);
        } else {
            const applyText = typeof item.apply === 'string' ? item.apply : item.label;
            if (applyText !== testCase.checkApply.expectInsert) {
                ok = false;
                details.push(`apply: "${applyText}" !== "${testCase.checkApply.expectInsert}"`);
            }
        }
    }

    return {ok, gotLabels, count: labels(result).length, details};
}

function padStatus(ok) {
    return ok ? '✅' : '❌';
}

async function main() {
    console.log('\n# 代码补全语法解析测试报告\n');
    console.log(`运行时间: ${new Date().toISOString()}\n`);

    let total = 0;
    let passed = 0;
    const rows = [];

    console.log('## 一、ContextAnalyzer 上下文分析\n');
    console.log('| 分组 | 场景 | 状态 | 说明 |');
    console.log('|------|------|:---:|------|');

    for (const group of contextCases) {
        for (const tc of group.cases) {
            total++;
            const {ok, got, expect, details} = runContextCase(tc);
            if (ok) passed++;
            const note = ok
                ? (got.type ? `${got.type}${got.objectName ? ` · ${got.objectName}` : ''}` : JSON.stringify(got))
                : (details?.join('; ') || JSON.stringify({got, expect}));
            console.log(`| ${group.group} | ${tc.name} | ${padStatus(ok)} | ${note} |`);
            rows.push({group: group.group, name: tc.name, ok, note});
            if (!ok && verbose) console.log('  ', {got, expect});
        }
    }

    console.log('\n## 二、customObjectCompletions 规范化\n');
    total++;
    const normOk = runNormalizeObjectCompletionsTests();
    if (normOk) passed++;
    console.log(`| normalizeCustomObjectCompletions | 树形展开 | ${padStatus(normOk)} | topLevel + nestedPaths |\n`);

    console.log('## 三、补全源集成（createJavaScriptCompletions）\n');
    console.log('| 分组 | 场景 | 状态 | 说明 |');
    console.log('|------|------|:---:|------|');

    for (const group of completionCases) {
        for (const tc of group.cases) {
            total++;
            const {ok, gotLabels, count, details} = await runCompletionCase(tc, group.completionOptions);
            if (ok) passed++;
            const note = ok
                ? `${count} 项${gotLabels.length ? `，如: ${gotLabels.join(', ')}` : ''}`
                : details.join('; ');
            console.log(`| ${group.group} | ${tc.name} | ${padStatus(ok)} | ${note} |`);
            if (!ok && verbose) console.log('  ', {gotLabels, details});
        }
    }

    const pct = total ? Math.round((passed / total) * 100) : 0;
    console.log('\n---\n');
    console.log(`**合计:** ${passed}/${total} 通过 (${pct}%)\n`);

    if (passed < total) {
        process.exitCode = 1;
    }
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
