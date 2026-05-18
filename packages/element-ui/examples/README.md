# Examples 使用说明

本目录是 **FcDesigner 演示 / 发版验证** 工程，支持两种模式：

| 模式 | 命令 | 设计器来源 |
|------|------|------------|
| 开发 | `npm run dev` | 仓库 `src/` 源码（改代码即时生效） |
| 发版验证 | `npm run dev:verify` | `node_modules` 中由 `npm pack` 安装的包（与业务项目一致） |

## 日常开发

```bash
cd packages/element-ui
npm run dev
```

浏览器访问终端提示的地址（一般为 `http://localhost:8080`）。

## 发版前验证（推荐流程）

确认打包产物与 npm 安装后行为一致，再执行 `npm publish`：

```bash
cd packages/element-ui

# 1. 构建并打 tgz 包
npm run build
npm run pack

# 2. 将 tgz 解压到 node_modules（不修改 package.json，兼容 monorepo）
npm run verify:install

# 3. 以「安装包」模式启动演示
npm run dev:verify
```

页面顶部会出现 **发版验证模式** 横幅，表示当前加载的是 npm 包而非源码。

也可一条命令完成安装并启动：

```bash
npm run verify:dev
```

## 目录说明

```
examples/
├── README.md           # 本说明
├── index.html
├── main.js             # 入口（挂载 App、注册插件）
├── shim.js             # 统一 import；dev/verify 由 vue.config alias 切换
├── App.vue             # 演示页（逻辑与布局）
├── demo/               # 默认演示数据与样式（可单独修改）
│   ├── default-rule.js
│   ├── default-option.js
│   ├── open-source-products.js
│   ├── pro-products.js
│   ├── code-editor-config.js
│   └── demo.css
└── components/
    ├── ConfigPanel.vue # 设计器配置面板
    └── VerifyBanner.vue# 验证模式提示条
```

## 常见问题

**`dev:verify` 报错找不到包**

先执行 `npm run verify:install`，确保已 `npm pack` 且存在 `.tgz` 文件。

**验证通过后要恢复开发**

直接 `npm run dev` 即可，无需卸载；开发模式始终使用 `src/`。

**与业务项目对齐**

验证模式下 `import` 路径与发布后一致（包名见根目录 `package.json` 的 `name` 字段，当前为 `@jieyukui/form-create-designer`）。
