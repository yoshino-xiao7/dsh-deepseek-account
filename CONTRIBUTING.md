# Contributing

感谢你帮助维护 `dsh-deepseek-account`。小而可验证的改动最容易审查和发布；较大的功能或接口调整请先开 Issue 对齐范围。

参与本项目即表示你同意遵守 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。一般使用问题请先看 [SUPPORT.md](SUPPORT.md)，安全问题必须按 [SECURITY.md](SECURITY.md) 私下报告。

## 开发环境

- Node.js `>=22.19.0 <25`
- npm（使用仓库提交的 `package-lock.json`）
- 不需要真实 DeepSeek、Grok 或 Codex 账户即可运行自动化测试

```sh
git clone https://github.com/yoshino-xiao7/dsh-deepseek-account.git
cd dsh-deepseek-account
npm ci --ignore-scripts --omit=peer
npm run check
npm run pack:check
```

不要为了本地开发提交 `node_modules/`、`dist/`、`*.tgz`、日志或真实账户响应。

## 开始修改

1. 搜索现有 Issue，避免重复工作。
2. 对新功能、兼容性调整或较大重构先开 Issue；小型文档和明确的缺陷修复可直接提交 PR。
3. 从最新 `main` 创建以 `yukiryou/` 开头的描述性分支，例如 `yukiryou/fix-stale-balance-label`。
4. 阅读 [架构说明](docs/ARCHITECTURE.md)，在现有 seam 上修改，避免把 Host 凭据逻辑带入浏览器。

## 改动原则

- Host 是唯一允许解析 `DEEPSEEK_API_KEY` 和构造 Authorization header 的模块。
- 浏览器只消费经过投影的数据；不要透传上游 DeepSeek、Grok 或 Codex 响应。
- Grok/Codex 是可选 adapter。它们缺失或 RPC 不兼容时，DeepSeek 功能必须继续工作。
- 金额保持十进制字符串，不要转换为 JavaScript `number`。
- 不要扩大固定充值 URL，也不要新增读取 Cookie、密码或支付资料的能力。
- 不要随意放宽响应大小、缓存、限频、loopback 权限或 schema 校验。
- 不新增生产依赖，除非现有平台能力无法安全完成需求；PR 中必须说明理由、体积和供应链影响。
- 用户可见行为同时更新中英文 README、界面文案、测试和 `CHANGELOG.md`。

## 测试要求

先运行最小相关测试，再运行完整检查：

```sh
node --test test/account-balance.test.mjs
node --test test/account-rpc.test.mjs
node --test test/client-bundle.test.mjs
npm run check
npm run pack:check
```

缺陷修复应加入能在修复前失败的聚焦测试。涉及接口的改动至少覆盖：

- 正常结果与畸形响应；
- 凭据缺失、未授权、限频和网络失败；
- 可选 Provider 插件缺失；
- 浏览器产物不包含 Host 凭据逻辑；
- Linux、macOS、Windows 可重复构建。

自动化测试不得访问真实账户或真实付款流程。若你自愿进行真实账户验证，只在 PR 中记录已脱敏的步骤和结论，不上传 Key、Cookie、完整余额、账户截图或付款信息。

## Pull Request

PR 请保持单一目的，并填写模板中的：

- 问题与改动范围；
- 用户可见行为和兼容性影响；
- 安全/隐私影响；
- 实际执行的验证命令；
- 未验证的真实账户或平台路径。

提交前检查 diff，确认没有生成物、无关格式化或隐私数据。维护者可能要求拆分过大的 PR，或要求为外部 RPC 变化补充兼容回归。

## 发布

贡献者不需要发布权限，也不要在本地执行 `npm publish`。版本、发布说明、npm Trusted Publisher、GitHub Release 和发布后验证由维护者按 [docs/MAINTAINING.md](docs/MAINTAINING.md) 完成。
