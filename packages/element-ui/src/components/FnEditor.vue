<template>
    <div class="_fd-fn">
        <div class="_fd-fn-tip">
            <div class="_fd-fn-ind"></div>
            <div class="cm-keyword"><span
            >function {{ name }}(<template v-for="(item, idx) in argList"
            >{{
                    idx > 0 ? ', ' : ''
                }}<template v-if="item.type === 'string'">
                                <span>{{ item.name }}</span> </template
                ><template v-else
                ><el-popover placement="top-start" :width="400" :hide-after="0" trigger="click" :title="item.name"
                ><template #reference
                ><span class="_fd-fn-arg">{{ item.name }}<i class="fc-icon icon-question"></i></span
                ></template>
                                    <template v-if="item.info">
                                        <div class="_fd-fn-info" v-html="item.info || ''"></div>
                                    </template>
                                    <template v-if="item.columns">
                                        <el-table :data="item.columns" border>
                                            <el-table-column width="120" property="label" :label="t('props.field')"/>
                                            <el-table-column property="info" :label="t('event.info')"/>
                                            <el-table-column width="80" property="type" :label="t('event.type')"/>
                                        </el-table>
                                    </template>
                                </el-popover>
                            </template> </template
            >) {</span
            ></div>
        </div>
        <div ref="editor" class="_fd-fn-editor"></div>
        <div class="_fd-fn-tip">
            <div class="_fd-fn-ind"></div>
            <div class="cm-keyword">}</div>
        </div>
        <el-button v-if="visible && button" type="primary" size="small" @click="save">{{ t('props.save') }}</el-button>
    </div>
</template>

<script>
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
// CM6 核心导入 - 不使用 basicSetup，手动组合
import {EditorView, keymap, lineNumbers} from '@codemirror/view';
import {javascript} from '@codemirror/lang-javascript';
import {autocompletion} from '@codemirror/autocomplete';
import {defaultKeymap, history, historyKeymap} from '@codemirror/commands';
import {defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching} from '@codemirror/language';
import {defineComponent, markRaw} from 'vue';
import {toJSON} from '../utils/index';
import errorMessage from '../utils/message';
import {getAutocompletionConfig} from '../completion/index'

const PREFIX = '[[FORM-CREATE-PREFIX-';
const SUFFIX = '-FORM-CREATE-SUFFIX]]';

export default defineComponent({
    name: 'FnEditor',
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: [String, Function],
        name: String,
        args: Array,
        body: Boolean,
        button: Boolean,
        fnx: Boolean
    },
    inject: ['designer'],
    data() {
        return {
            editor: null,
            fn: '',
            visible: false,
            value: '',
        };
    },
    watch: {
        modelValue(n) {
            if (n != this.value && (!n || !n.__json || (n.__json && n.__json != this.value))) {
                this.editor && this.setEditorValue(this.tidyValue());
            }
        },
    },
    computed: {
        codeEditorConfig() {
            return this.designer.props.codeEditorConfig;
        },
        t() {
            return this.designer.setupState.t;
        },
        argStr() {
            return (this.args || []).map(arg => {
                if (typeof arg === 'string') {
                    return arg;
                }
                return arg.name;
            }).join(', ');
        },
        argList() {
            return (this.args || []).map(arg => {
                if (typeof arg === 'string') {
                    return {
                        name: arg,
                        type: 'string'
                    }
                }
                return arg;
            });
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.load();
        });
    },
    beforeUnmount() {
        if (this.editor) {
            this.editor.destroy();
        }
    },
    methods: {
        setEditorValue(value) {
            if (!this.editor) return;
            const currentValue = this.editor.state.doc.toString();
            if (currentValue === value) return;
            this.editor.dispatch({
                changes: {from: 0, to: this.editor.state.doc.length, insert: value || ''}
            });
        },
        getEditorValue() {
            return this.editor ? this.editor.state.doc.toString() : '';
        },
        save() {
            const str = this.getEditorValue() || '';
            if (str.trim() === '') {
                this.fn = '';
            } else {
                let fn;
                try {
                    fn = (new Function('return function (' + this.argStr + '){\n' + str + '\n}'))();
                } catch (e) {
                    console.error(e);
                    errorMessage(this.t('struct.errorMsg'));
                    return false;
                }
                if (this.body) {
                    this.fn = (this.fnx ? '$FNX:' : '') + str;
                } else {
                    this.fn = PREFIX + fn + SUFFIX;
                }
            }
            this.submit();
            return true;
        },
        submit() {
            this.$emit('update:modelValue', this.fn);
            this.$emit('change', this.fn);
            this.value = this.fn;
            this.visible = false;
        },
        trimString(input) {
            const firstIndex = input.indexOf('{');
            const lastIndex = input.lastIndexOf('}');
            if (firstIndex === -1 || lastIndex === -1 || firstIndex >= lastIndex) {
                return input;
            }
            return input.slice(firstIndex + 1, lastIndex).replace(/^\n+|\n+$/g, '');
        },
        tidyValue() {
            let value = this.modelValue || '';
            if (value && value.__json) {
                value = value.__json;
            }
            if (this.fnx && typeof value === 'string' && value.indexOf('$FNX:') === 0) {
                value = value.slice(5);
            }
            if (typeof value === 'function') {
                value = this.trimString(toJSON(value)).trim();
            } else if (!this.body && typeof value === 'string') {
                value = this.trimString(value).trim();
            }
            this.value = value;
            return value;
        },
        load() {
            this.$nextTick(() => {
                let value = this.tidyValue();
                const editorCfg = this.codeEditorConfig || {};
                const completionConfig = getAutocompletionConfig({
                    customCompletions: editorCfg.customCompletions,
                    customObjects: editorCfg.customObjects,
                    customSignatures: editorCfg.customSignatures,
                    customObjectCompletions: editorCfg.customObjectCompletions
                });

                const extensions = [
                    lineNumbers(),
                    EditorView.lineWrapping,
                    history(),
                    keymap.of([
                        ...defaultKeymap,
                        ...historyKeymap,
                        {
                            key: 'Ctrl-Space',
                            run: (view) => {
                                const completion = view.state.field(autocompletion());
                                completion.open();
                                return true;
                            },
                            preventDefault: true
                        },
                        {
                            key: 'Ctrl-Enter',
                            run: (view) => {
                                const completion = view.state.field(autocompletion());
                                completion.open();
                                return true;
                            },
                            preventDefault: true
                        }
                    ]),
                    indentOnInput(),
                    syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
                    bracketMatching(),
                    javascript({
                        jsx: false,
                        typescript: false
                    }),
                    autocompletion(completionConfig),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            this.visible = true;
                        }
                    })
                ];

                this.editor = markRaw(new EditorView({
                    doc: value,
                    parent: this.$refs.editor,
                    extensions: extensions
                }));
            });
        }
    }
});
</script>

<style>
/* 保留原有样式，添加 CM6 样式覆盖 */
._fd-fn {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: 100%;
}

._fd-fn .el-button {
    position: absolute;
    bottom: 3px;
    right: 5px;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    z-index: 10;
}

._fd-fn-editor {
    display: flex;
    flex: 1;
    width: 100%;
    overflow: auto;
    min-height: 200px;
    //border: 1px solid #dcdfe6;
    //border-radius: 4px;
}

/* CM6 样式覆盖 */
._fd-fn-editor .cm-editor {
    height: 100%;
    width: 100%;
}

._fd-fn-editor .cm-editor.cm-focused {
    outline: none;
}

._fd-fn-editor .cm-scroller {
    overflow: auto;
    font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
}

._fd-fn-tip {
    color: #000;
    font-family: monospace;
    direction: ltr;
}

._fd-fn-tip .cm-keyword {
    color: #708;
    line-height: 24px;
    white-space: nowrap;
    overflow-x: auto;
}

._fd-fn-tip .cm-keyword::-webkit-scrollbar {
    width: 0;
    height: 0;
    background-color: transparent;
}

._fd-fn-ind {
    background-color: #f7f7f7;
    width: 29px;
    height: 24px;
    display: inline-block;
    margin-right: 4px;
    border-right: 1px solid #ddd;
    float: left;
}
._fd-fn-editor .cm-editor .cm-lineNumbers .cm-gutterElement {
    min-width: 29px;
}

._fd-fn-arg {
    text-decoration: underline;
    cursor: pointer;
}

._fd-fn-arg i {
    font-size: 12px;
    color: #3073ff;
}

._fd-fn-info a {
    text-decoration: underline;
}
</style>