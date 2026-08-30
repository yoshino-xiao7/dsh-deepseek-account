# dsh-deepseek-account

DeepSeek Harness 的独立账户插件，负责：

- 在当前对话选择 DeepSeek 或无法识别的自定义 provider 时显示 API Key 所属账户余额；
- 在当前对话选择 Grok 时显示额度重置时间，选择 Codex 时显示 5 小时和每周额度重置时间；
- 在设置页展示 CNY/USD 总余额、赠送余额和充值余额；
- 打开 DeepSeek 官方平台完成网页登录与充值。

侧栏始终只展示当前对话所选 provider 的一项信息。Grok 和 Codex 数据通过它们已经存在的本地 RPC 按需读取；本插件不修改或接管两个 provider 插件的登录、模型、设置或其他能力。未安装 Grok/Codex 插件时，仅对应额度显示“来源不可用”，DeepSeek 余额和充值仍可独立使用。无法识别的自定义 provider 默认回退到 DeepSeek。

只有 DeepSeek 提供充值入口。Grok 和 Codex 仅显示额度重置时间。

## 安全边界

`DEEPSEEK_API_KEY` 只在 Host 侧通过 Harness credential service 解析。浏览器侧只能调用 loopback RPC 获取经过校验的余额快照，构建脚本会拒绝包含凭据解析或 Authorization header 的客户端产物。

充值入口固定为 `https://platform.deepseek.com/balance`，登录和付款完全发生在 DeepSeek 官方网页。

## 开发

```bash
npm run check
```

仓库开发分支为 `yukiryou/v0.1.2`。`dist/` 由构建和打包流程生成，不提交到 Git。

## 安装

正式发布后安装精确版本：

```sh
dsh plugin --profile web add dsh-deepseek-account@0.1.2
dsh web
```

英文说明见 [README.en.md](README.en.md)。
