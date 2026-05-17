## 文件结构规划

```
completion/
├── index.js              # 主入口，导出配置方法
├── core/
│   ├── environment.js    # 环境检测（浏览器/Node/Worker等）
│   ├── priority.js       # 优先级管理
│   └── cache.js          # 缓存策略（含失效机制）
├── data/
│   ├── builtin/
│   │   ├── index.js      # 内置对象数据汇总
│   │   ├── math.js       # Math 对象
│   │   ├── console.js    # console 对象
│   │   ├── json.js       # JSON 对象
│   │   ├── array.js      # Array 静态方法
│   │   ├── object.js     # Object 静态方法
│   │   ├── string.js     # String 静态方法
│   │   ├── promise.js    # Promise 静态方法
│   │   ├── document.js   # document 对象
│   │   ├── storage.js    # localStorage/sessionStorage
│   │   ├── location.js   # location 对象
│   │   ├── history.js    # history 对象
│   │   ├── navigator.js  # navigator 对象
│   │   ├── screen.js     # screen 对象
│   │   └── window-core.js # window 核心方法（定时器、URL编码等）
│   ├── prototypes/
│   │   ├── index.js      # 原型链补全汇总 
│   │   ├── array-prototype.js
│   │   ├── string-prototype.js
│   │   ├── number-prototype.js
│   │   ├── date-prototype.js
│   │   ├── regexp-prototype.js
│   │   ├── map-prototype.js
│   │   ├── set-prototype.js
│   │   ├── promise-prototype.js
│   │   └── element-prototype.js
│   └── globals.js        # 全局变量定义
├── sources/
│   ├── global-source.js      # 全局变量补全源
│   ├── object-property-source.js  # 对象属性补全源（含原型链）
│   ├── window-fallback-source.js  # window 兜底补全源
│   └── chain-source.js      # 链式调用补全源（基础版）
├── resolvers/
│   ├── runtime-resolver.js   # 运行时属性解析器
│   ├── signature-parser.js   # 函数签名解析器
│   └── type-inferrer.js      # 类型推断器
└── utils/
    ├── merge.js           # 补全源合并
    └── normalize.js       # 数据规范化
```

### 使用方式

```javascript
import { getAutocompletionConfig } from './completion/index';

const completionConfig = getAutocompletionConfig({
    customCompletions: [
        { 
            label: 'myApp', 
            type: 'class', 
            detail: 'Application', 
            info: '自定义应用对象' 
        }
    ],
    customObjectCompletions: {
        myApp: [
            { label: 'version', type: 'property', detail: 'string', info: '版本' },
            {
                label: 'api',
                type: 'class',
                detail: 'API',
                info: 'API 模块',
                children: {
                    user: {
                        get: { label: 'get', type: 'function', detail: '(id)', info: '获取用户' },
                        list: { label: 'list', type: 'function', detail: '()', info: '列表' }
                    }
                }
            }
        ]
    },
    customObjects: {
        api: window.myAPI  // 运行时对象
    },
    customSignatures: {
        'api.request': { 
            type: 'function', 
            detail: '(url: string, options?: RequestOptions) => Promise<Response>',
            info: '发送 API 请求'
        }
    }
});

// 在 CodeMirror 中使用
// { extensions: [autocompletion(completionConfig)] }
```
三种写法（可混用）
1. 扁平 Record（与 Math 相同）
   适合路径固定、层级不深：
```javascript
customObjectCompletions: {
myApp: [
{ label: 'version', type: 'property', detail: 'string', info: '应用版本' },
{ label: 'request', type: 'function', detail: '(url) => Promise', info: '发送请求' }
],
'myApp.api': [
{ label: 'user', type: 'class', detail: 'UserAPI', info: '用户模块' },
{ label: 'post', type: 'function', detail: '(data) => void', info: '提交' }
],
'myApp.api.user': [
{ label: 'get', type: 'function', detail: '(id) => User', info: '获取用户' },
{ label: 'list', type: 'function', detail: '() => User[]', info: '用户列表' }
]
}
```
键为点号路径：在 myApp.api.user. 后弹出时，查找键 'myApp.api.user'。
2. 树形对象（推荐，层级多时更清晰）
   属性名即路径段，无需手写点号键：
```javascript
customObjectCompletions: {
  myApp: {
    version: { label: 'version', type: 'property', detail: 'string', info: '应用版本' },
    request: { label: 'request', type: 'function', detail: '(url) => Promise', info: '发送请求' },
    api: {
      post: { label: 'post', type: 'function', detail: '(data) => void', info: '提交' },
      user: {
        get: { label: 'get', type: 'function', detail: '(id) => User', info: '获取用户' },
        list: { label: 'list', type: 'function', detail: '() => User[]', info: '用户列表' }
      }
    }
  }
}
```
• myApp. → version、request、api
• myApp.api. → post、user
• myApp.api.user. → get、list
中间节点（如 api、user）会自动生成 type: 'class' 的命名空间项。
3. 数组 + children（与 Math 数组风格一致）
```javascript
customObjectCompletions: {
  myApp: [
    { label: 'version', type: 'property', detail: 'string', info: '版本' },
    {
      label: 'api',
      type: 'class',
      detail: 'API',
      info: 'API 模块',
      children: {
        user: {
          get: { label: 'get', type: 'function', detail: '(id)', info: '获取用户' },
          list: { label: 'list', type: 'function', detail: '()', info: '列表' }
        }
      }
    }
  ]
}
```
### 测试文件
路径：packages/element-ui/src/completion/tests/run-completion-tests.mjs
```bash
cd packages/element-ui
npm run test:completion          # 简要报告
npm run test:completion:verbose  # 失败时打印详情
```
当前：32/32 通过（100%），覆盖你表格中的场景及：
类别
示例
声明屏蔽
const x、var { x }、for...in/of、catch、多行声明
属性访问
const/var Math.、[].、"".、localStorage.
不误补
const x = 无全局列表；[]. 无 getItem
函数参数
function foo(a, 、(a,
### 使用说明

> 报告分两部分：ContextAnalyzer（语法上下文）与 补全集成（实际提示项）

> 可在 run-completion-tests.mjs 的 contextCases / completionCases 中继续加用例

>调试编辑器内行为：getAutocompletionConfig({ debug: true })
若还需要覆盖模板字符串、import、TypeScript 等场景，可在同一测试文件中按相同格式扩展用例。