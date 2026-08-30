# Architecture

本文描述维护者需要长期保持的模块接口和安全 seam。实现较小，但凭据、可选 Provider 和浏览器注入之间的职责不能混合。

## 数据流

```text
Harness credential service
          │ resolve DEEPSEEK_API_KEY (Host only)
          ▼
account-balance module ── HTTPS GET ──> api.deepseek.com/user/balance
          │ projected snapshot
          ▼
loopback RPC /dsh-deepseek-account
          │ validated snapshot
          ▼
browser account client ──> sidebar + DeepSeek settings
          │
          ├── optional /grok-auth RPC  ──> remaining % + current reset window
          └── optional /dsh-codex RPC  ──> remaining % + 5-hour/weekly reset windows

current session list ── running true→false ──> one forced account refresh
```

充值是独立路径：浏览器只打开固定的 `https://platform.deepseek.com/balance`。插件不参与该网页的登录、Cookie 或付款请求。

## Modules and interfaces

### Host entry

`src/host/index.mjs` 是 npm 包的 Host 入口。它的接口只有 Harness 插件约定的 `name`、`inject` 和 `apply(ctx)`，负责组合 credential adapter、余额模块与 connection adapter，不包含浏览器 UI。

### Account balance module

`src/internal/account-balance.mjs` 隐藏 DeepSeek 请求、缓存、并发合并、错误分类和响应投影。它的接口是：

```js
const balance = createDeepSeekAccountBalance({ credentials, fetchImpl?, now? })
await balance.read({ force? })
```

可注入的 `fetchImpl` 和 `now` 是内部测试 seam，不应暴露到插件配置。关键不变量：

- 没有凭据时不访问网络；
- 自动读取缓存 5 分钟，强制读取缓存 30 秒；
- 同一时间只有一个上游请求；
- 响应最大 32 KiB，仅接受 CNY/USD 和有限长度的十进制字符串；
- 失败时可以返回已明确标记为 `stale` 的最后成功快照；
- 401/403、429、网络和无效响应保持不同错误原因。

### Loopback RPC adapter

`src/internal/account-rpc.mjs` 在 `/dsh-deepseek-account` 注册唯一的 `read` endpoint，只接受可选布尔值 `force`。authority 必须保持 `loopback`。不要在这里增加通用代理、任意 URL、任意 header 或原始响应透传。

### Browser module

`client.js` 是 Harness 客户端加载器模块。它负责：

- 识别当前会话 Provider；
- 调用 DeepSeek、Grok 或 Codex 的本地 RPC；
- 再次校验所有跨 RPC 数据；
- 注册侧栏与设置页；
- 监听当前会话的运行结束边沿，并刷新一次当前 Provider；
- 在 Harness 尚未提供 settings section 图标接口时，只对中英文“DeepSeek 账户”导航行挂载可清理的鲸鱼图标；
- 注册中英文文案和局部样式。

客户端只依赖投影后的账户状态。`scripts/build.mjs` 会复制确定性产物，并拒绝包含 `DEEPSEEK_API_KEY`、credential resolution 或 Authorization header 特征的客户端文件。

完成刷新只观察 `ctx.sessions.list` 已公开的 `current` 与 `running` 状态。同一会话仅在 `true → false` 时触发；初始空闲、重复空闲通知和切换到另一个空闲会话都不能触发。不要为此增加定时轮询或读取完整对话日志。

设置导航图标 adapter 只匹配插件拥有的中英文 label，保留并隐藏 Harness 原图标，重复 DOM 通知不得重复挂载；插件卸载时必须断开观察并恢复原图标。Harness 将来提供正式 section 图标接口后，应删除这个临时 adapter。

### Optional Provider adapters

Grok 的 `/grok-auth` 和 Codex 的 `/dsh-codex` 是外部、可选 seam。它们不是本插件拥有的接口，因此：

- 调用失败必须降级为 `unavailable`；
- 只投影显示所需的剩余百分比与重置窗口，不保留上游原始用量对象或其他账户数据；
- 不以 npm 依赖或 Host 注入的方式接管对应插件；
- 外部 RPC 变化时，通过投影函数和契约测试适配，不能让变化扩散到 UI。

## Provider selection

当前映射是：

- `llm-grok`、`grok` → Grok；
- `dsh-codex` → Codex；
- 其他值（包括未知自定义 Provider）→ DeepSeek。

侧栏图标使用同一映射：Grok 标识、ChatGPT/OpenAI Blossom、DeepSeek 鲸鱼；图形内联在客户端产物中并继承当前主题颜色，不发起额外网络请求。

改变默认回退属于用户可见兼容性变化，必须先开 Issue，并同步 README、界面文案、测试、CHANGELOG 和发布说明。

## Test surface

测试应从模块接口验证行为：

| Test | Interface covered |
| --- | --- |
| `account-balance.test.mjs` | 上游投影、凭据缺失、缓存/并发和旧快照 |
| `account-rpc.test.mjs` | loopback 权限、endpoint 与请求 schema |
| `client-bundle.test.mjs` | manifest、客户端凭据隔离、Provider 映射、可选 RPC 和 UI 注册 |

新增行为优先扩展相应接口测试。只有确实存在第二个 adapter 时才新增 seam；不要为假设中的未来实现扩大公共接口。

## Package layout

```text
src/host/           Host 入口
src/internal/       Host 内部深模块和 RPC adapter
client.js           浏览器模块源文件
scripts/build.mjs   确定性构建和凭据边界检查
test/               接口测试
dist/               生成物，不提交
docs/releases/      固定版本的双语发布说明
```
