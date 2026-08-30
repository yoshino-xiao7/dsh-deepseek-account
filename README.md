# dsh-deepseek-account

[![CI](https://github.com/yoshino-xiao7/dsh-deepseek-account/actions/workflows/ci.yml/badge.svg)](https://github.com/yoshino-xiao7/dsh-deepseek-account/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/dsh-deepseek-account.svg)](https://www.npmjs.com/package/dsh-deepseek-account)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

DeepSeek Harness 的独立账户插件：在一个侧栏入口中展示当前对话所选 Provider 的账户信息，并为 DeepSeek 提供官方充值入口。

> 插件只负责“查看”和“跳转”。它不会读取网页 Cookie、账户密码或付款资料，也不会代替用户登录或付款。

[English](README.en.md) · [贡献指南](CONTRIBUTING.md) · [架构说明](docs/ARCHITECTURE.md) · [安全策略](SECURITY.md)

## 能力与边界

| 当前 Provider | 侧栏显示 | 数据来源 | 是否需要对应插件 |
| --- | --- | --- | --- |
| DeepSeek | DeepSeek 图标、API Key 所属账户余额 | DeepSeek 官方 `/user/balance` | 否 |
| Grok | Grok 图标、剩余额度百分比、当前周期与重置时间 | Grok 插件已有的本地 RPC | 是 |
| Codex | ChatGPT 图标、5 小时和每周的剩余额度百分比与重置时间 | Codex 插件已有的本地 RPC | 是 |
| 无法识别的自定义 Provider | 回退显示 DeepSeek 图标和余额 | DeepSeek 官方 `/user/balance` | 否 |

侧栏始终只显示当前对话所选 Provider 的一项信息。Grok 和 Codex 只是可选数据源；本插件不接管它们的登录、模型、设置或其他能力。缺少可选插件时，对应额度显示“来源不可用”，DeepSeek 余额和充值仍可独立使用。

只有 DeepSeek 提供充值入口。Grok 直接采用可选插件返回的剩余百分比，缺失时可由其已用百分比换算；Codex 将可选插件返回的已用百分比换算成剩余百分比。插件只保留显示所需的百分比和重置窗口，不保留上游原始用量对象。

## 安装

运行环境：

- Node.js `>=22.19.0 <25`
- DeepSeek Harness `0.1.1-rc.2` 系列
- 已在 Harness 模型设置中配置 `DEEPSEEK_API_KEY`（仅查看 DeepSeek 余额时需要）

安装当前稳定版本：

```sh
dsh plugin --profile web add dsh-deepseek-account@0.1.5
dsh web
```

打开当前对话的 Web 界面后：

1. 侧栏底部以 Provider 图标标识当前账户来源，直接显示无额外底色的账户信息；点击可手动刷新，每轮对话结束后也会主动刷新一次。
2. 设置导航用 DeepSeek 鲸鱼图标原位替换通用齿轮；“DeepSeek 账户”页面可查看 CNY/USD 的总余额、赠送余额和充值余额。
3. “登录并充值”只会在新页面打开 `https://platform.deepseek.com/balance`。

升级时继续使用精确版本，避免预发布阶段的依赖漂移：

```sh
dsh plugin --profile web add dsh-deepseek-account@<version>
dsh web
```

## 常见状态

| 界面提示 | 含义 | 建议 |
| --- | --- | --- |
| 请先配置 API Key | Harness credential service 未解析到 `DEEPSEEK_API_KEY` | 在模型设置中配置，不要把 Key 发到 Issue 或日志 |
| API Key 无效或已失效 | DeepSeek 返回 401/403 | 更换或重新配置 Key |
| 查询过于频繁 | DeepSeek 返回 429 | 稍后再试，不要连续刷新 |
| 展示上一次成功读取的余额 | 当前请求失败，插件保留了已标记的旧快照 | 检查网络后重试，并留意数据时间 |
| 额度来源不可用 | Grok/Codex 插件未安装、未运行或其本地 RPC 不兼容 | 检查对应插件；DeepSeek 功能不受影响 |

DeepSeek 自动读取最多缓存 5 分钟，强制刷新最多每 30 秒发起一次上游请求；并发读取会合并为一次请求。每轮对话结束时，插件会监听当前会话由运行变为空闲的边沿并刷新当前 Provider，不使用定时轮询。

## 安全设计

- `DEEPSEEK_API_KEY` 只在 Host 侧通过 Harness credential service 解析。
- 浏览器侧只能通过 loopback RPC 获取经过严格投影的余额快照。
- 单次上游响应限制为 32 KiB，金额始终按十进制字符串处理。
- 构建会拒绝包含凭据解析或 Authorization header 的客户端产物。
- 充值地址固定为 DeepSeek 官方页面；插件没有支付权限。

漏洞请按 [安全策略](SECURITY.md) 私下报告。不要在公开 Issue、截图或测试夹具中提交真实凭据、Cookie、账户余额或付款信息。

## 开发与贡献

```sh
git clone https://github.com/yoshino-xiao7/dsh-deepseek-account.git
cd dsh-deepseek-account
npm ci --ignore-scripts --omit=peer
npm run check
npm run pack:check
```

`npm run check` 依次运行 Node.js 测试和确定性构建；`dist/` 是生成物，不提交到 Git。CI 在 Node.js 22/24 和 Linux、macOS、Windows 上验证同一组接口。

开始修改前请阅读：

- [CONTRIBUTING.md](CONTRIBUTING.md)：分支、测试、PR 和提交边界
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)：Host、loopback RPC、浏览器和可选 Provider 的 seam
- [docs/MAINTAINING.md](docs/MAINTAINING.md)：分诊、兼容性和可信发布流程
- [SUPPORT.md](SUPPORT.md)：问题应该发到哪里

## 项目状态

自动化验证覆盖响应投影、缓存/限频、RPC 权限、缺失可选插件、Provider 识别、客户端凭据隔离、跨平台构建和包内容。

这些检查不等于真实账户验收：维护者不会在 CI 中使用真实 API Key，也不会自动执行网页登录或付款。版本级验证范围记录在 [docs/releases](docs/releases) 和 [CHANGELOG.md](CHANGELOG.md) 中。

## 许可证

[MIT](LICENSE)
