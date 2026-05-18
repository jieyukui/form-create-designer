/**
 * 统一入口：dev 走 src，verify 走 npm 包（由 vue.config.js 的 alias 切换）
 */
export {default} from '@fc-designer-entry';
export {copyTextToClipboard, toJSON} from '@fc-designer-entry';
export {default as ZhCn} from '@fc-locale/zh-cn.js';
export {default as En} from '@fc-locale/en.js';
