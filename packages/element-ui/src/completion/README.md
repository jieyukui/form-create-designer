## 文件结构规划

```
completion/
├── index.js
├── core/
├── data/
├── sources/
├── resolvers/
└── utils/
    └── custom-object-completions.js
```

### 使用方式

```javascript
import { getAutocompletionConfig } from './completion/index';

const completionConfig = getAutocompletionConfig({
    customObjectCompletions: {
        myApp: {
            meta: {
                type: 'class',
                detail: 'Application',
                info: '自定义应用对象'
            },
            members: {
                version: { type: 'property', detail: 'string', info: '版本号' },
                api: {
                    meta: { type: 'class', detail: 'API', info: 'HTTP 接口模块' },
                    members: {
                        user: {
                            meta: { type: 'class', detail: 'UserAPI', info: '用户相关接口' },
                            members: {
                                // 属性名与 meta 字段同名时，必须用 meta 包裹
                                type: { meta: { type: 'property', detail: 'string', info: '用户类型' } },
                                get: { type: 'function', detail: '(id) => User', info: '获取用户' }
                            }
                        }
                    }
                }
            }
        }
    }
});
```

通过 `FcDesigner` 的 `codeEditorConfig` 传入，`FnEditor` 自动接入。

### 节点结构（meta + members）

**`type` / `detail` / `info` 等补全说明只能写在 `meta` 里，用户属性一律写在 `members` 里**，避免与用户自定义字段（如属性名 `type`、`info`）混写冲突。

| 节点类型 | 结构 |
|----------|------|
| 命名空间（有子属性） | `{ meta: { type, detail, info, ... }, members: { ... } }` |
| 叶子属性（简写） | `{ type, detail, info }` — 仅含补全说明字段 |
| 叶子属性（属性名冲突） | `{ meta: { type, detail, info } }` — 如 `members.type` |

`children` 可作为 `members` 的别名。

### 效果

- 输入 `myA` → 全局 `myApp`，展示 `meta` 中的说明
- `myApp.` → `api` 带 `meta` 中的 detail / info
- `myApp.api.user.` → 可出现名为 `type` 的用户属性，且说明来自其 `meta`，不会被上层 `type: 'class'` 覆盖

### 与 customCompletions 的分工

| 配置 | 用途 |
|------|------|
| `customObjectCompletions` | 对象树（`meta` + `members`），含根对象全局提示 |
| `customCompletions` | 非对象树的顶层项 |
| `customObjects` | 运行时扫描 |
| `customSignatures` | 按 `'obj.method'` 覆盖 detail / info |

### 测试

```bash
cd packages/element-ui
npm run test:completion
```
