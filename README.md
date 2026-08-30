# dsh-deepseek-account

DeepSeek Harness 的独立账户插件，负责：

- 在当前对话选择 DeepSeek 或无法识别的自定义 provider 时显示 API Key 所属账户余额；
- 在设置页展示 CNY/USD 总余额、赠送余额和充值余额；
- 打开 DeepSeek 官方平台完成网页登录与充值。

选择 Grok 或 Codex 时，本插件的侧栏卡片返回空内容，由对应 provider 插件展示自己的使用额度。插件不接收网页 Cookie 或支付资料，也不会代替用户提交付款。

## 安全边界

`DEEPSEEK_API_KEY` 只在 Host 侧通过 Harness credential service 解析。浏览器侧只能调用 loopback RPC 获取经过校验的余额快照，构建脚本会拒绝包含凭据解析或 Authorization header 的客户端产物。

充值入口固定为 `https://platform.deepseek.com/balance`，登录和付款完全发生在 DeepSeek 官方网页。

## 开发

```bash
npm run check
```

仓库开发分支为 `yukiryou/v0.1.0`。`dist/` 由构建和打包流程生成，不提交到 Git。

## 安装

正式发布后安装精确版本：

```sh
dsh plugin --profile web add dsh-deepseek-account@0.1.0
dsh web
```

英文说明见 [README.en.md](README.en.md)。
