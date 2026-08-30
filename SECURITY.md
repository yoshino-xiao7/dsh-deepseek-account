# Security Policy

## Supported versions

安全修复面向 npm 上最新的稳定版本。旧版本通常不会回补；若问题影响多个版本，公告会明确受影响范围和升级版本。

## Reporting a vulnerability

请通过本仓库的 GitHub Security Advisories 私下报告，不要先创建公开 Issue、Discussion 或 Pull Request。

报告中可以包含：

- 受影响的插件、Harness 和 Node.js 版本；
- 不包含秘密信息的最小复现步骤；
- 预期影响和已知缓解方式；
- 脱敏后的日志或响应结构。

请勿提交 API Key、OAuth code、Cookie、密码、完整账户余额、支付资料、私钥或可直接利用生产账户的 PoC。维护者不会要求你把这些内容粘贴到 Issue 或聊天中。

维护者会确认报告、评估影响，并在修复可用后协调披露。由于本项目由社区维护，无法承诺固定 SLA；高风险报告会优先处理。

## Security boundary

- `DEEPSEEK_API_KEY` 仅由 Host 侧 Harness credential service 解析。
- Host 到浏览器的 `/dsh-deepseek-account` RPC 只允许 loopback，并对请求和响应做严格投影。
- 浏览器不会收到 API Key、Authorization header 或原始上游响应。
- 上游余额响应限制为 32 KiB；金额保持十进制字符串。
- Grok/Codex 数据来自可选插件的本地 RPC，本插件只投影重置时间。
- 充值入口固定为 `https://platform.deepseek.com/balance`；登录和付款完全发生在 DeepSeek 官方网页，本插件没有支付权限。

构建和测试是纵深防御，不代表真实账户、浏览器会话或付款流程已经通过安全审计。版本级验证限制记录在 `docs/releases/`。
