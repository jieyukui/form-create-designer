import openSourceProducts from './open-source-products';
import proProducts from './pro-products';
import {renderViewBox} from './render-view-box';
import {createHtmlRule} from './utils';

export default [
    createHtmlRule(
        renderViewBox({
            title: 'FormCreate 设计器开源版演示站',
            desc: '开源免费可商用的可视化表单设计器',
            products: openSourceProducts,
        }),
        'id_demo_open',
        'ref_demo_open',
    ),
    createHtmlRule(
        renderViewBox({
            title: 'FormCreate 设计器<span style="color:#cd7f32;">高级版</span>演示站',
            desc: '全面实现多端表单设计，为企业提供低代码表单解决方案',
            products: proProducts,
        }),
        'id_demo_pro',
        'ref_demo_pro',
    ),
];
