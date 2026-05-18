const fs = require('fs');
const path = require('path');

const examplesDir = path.resolve(__dirname, '../examples');
const lines = fs.readFileSync(path.join(examplesDir, '_App_utf8.vue'), 'utf8').split(/\r?\n/);

let template = lines.slice(0, 93).join('\n');
template = template.replace('<div id="app">', '<motion id="app">\n        <VerifyBanner/>'.replace('motion', 'div'));

const origBody = lines.slice(95, 500).join('\n');

const imports = `import jsonlint from 'jsonlint-mod';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/addon/mode/overlay';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/selection/selection-pointer';
import 'codemirror/mode/handlebars/handlebars';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/pug/pug';

import is from '@form-create/utils/lib/type';
import formCreate from '@form-create/element-ui';
import {ZhCn, En, copyTextToClipboard} from './shim';
import arrowDown from '@element-plus/icons-vue/dist/es/arrow-down.mjs';
import ConfigPanel from './components/ConfigPanel.vue';
import VerifyBanner from './components/VerifyBanner.vue';
import {defaultRule, defaultOption, codeEditorConfig} from './demo';
`;

let body = origBody.replace(/^import[\s\S]*?const CACHE_KEY/m, `${imports}\nconst CACHE_KEY`);
body = body.replace(
    /components:\s*\{[\s\S]*?\},/,
    `components: {
        ConfigPanel,
        VerifyBanner,
        arrowDown,
    },`
);
body = body.replace(
    /menus: \[\],\s*codeEditorConfig: \{[\s\S]*?\},\s*hashData/,
    'menus: [],\n            codeEditorConfig,\n            hashData'
);
body = body.replace(
    /mounted\(\) \{[\s\S]*?this\.menus = this\.\$refs\.designer\.menuList;\s*\},/,
    `mounted() {
        if (this.hashData && this.hashData.rule) {
            this.$refs.designer.setRule(this.hashData.rule);
            if (this.hashData.options) {
                this.$refs.designer.setOptions(this.hashData.options);
            }
        } else {
            this.$refs.designer.setRule(defaultRule);
            this.$refs.designer.setOption(defaultOption);
        }
        this.$nextTick(() => {
            this.loadAutoSave();
        });
        this.menus = this.$refs.designer.menuList;
    },`
);

let style = lines.slice(502).join('\n');
style = style.replace(
    /\._fd-view-box[\s\S]*\._fd-view-product > div > span \{[\s\S]*?\n\}\n\n/,
    ''
);

const output = `${template}\n\n<script>\n${body}\n\n</script>\n\n${style}\n`;
fs.writeFileSync(path.join(examplesDir, 'App.vue'), output, 'utf8');
console.log('App.vue rebuilt OK');
