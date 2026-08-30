# Maintaining

本文面向拥有仓库分诊或发布权限的维护者。贡献者开发流程见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## Issue triage

1. 先确认问题属于本插件，而不是 DeepSeek 官方账户/付款、Harness 平台或 Grok/Codex 插件。
2. 删除或隐藏意外公开的凭据、Cookie、账户和付款资料；不要在 Issue 中引用或复制。
3. 记录插件、Harness、Node.js、操作系统、当前 Provider 和可选插件版本。
4. 用最小的本地 adapter/fixture 复现，不要求报告者提供真实 Key。
5. 将真实账户验证与自动化验证分开记录，避免把构建或隔离测试描述成端到端成功。

## Compatibility policy

- `package.json#engines` 和 peer dependency 范围是支持矩阵的来源。
- Harness 或可选 Provider RPC 升级前，先用公开接口和脱敏 fixture 验证，再调整版本范围。
- 不认识的 Provider 当前回退 DeepSeek；改变它需要明确的兼容性说明。
- Grok/Codex 必须保持可选，它们缺失时 DeepSeek 仍可工作。
- 稳定版只承诺最新版本获得安全修复；破坏性变化需要在 README、CHANGELOG 和发布说明中突出。

## Pull Request review

合并前确认：

- 改动位于正确模块，Host 凭据逻辑没有进入客户端；
- RPC 输入输出仍然是最小投影，loopback authority 未被放宽；
- 错误、缺失可选插件和旧快照路径有聚焦测试；
- 中英文用户文档和界面文案同步；
- `npm run check` 与 `npm run pack:check` 通过；
- diff 不包含 `dist/`、tarball、日志、真实响应或秘密信息；
- 分支以 `yukiryou/` 开头，并通过受保护的 `main` 合并。

## Release preparation

每个版本只发布 `main` 上一个明确的提交和该工作流生成的固定 tarball。

1. 在发布 PR 中更新 `package.json`、`package-lock.json`、`CHANGELOG.md` 和 `docs/releases/v<version>.md`。
2. 发布说明以中文摘要、精确安装命令、分组变更和兼容性/验证限制开头；完整英文放入 `<details>`。
3. 在干净依赖环境运行：

   ```sh
   npm ci --ignore-scripts --omit=peer
   npm run check
   npm run pack:check
   ```

4. 合并到 `main`，记下完整 commit SHA，并等待 CI 全部通过。
5. 确认 npm 上不存在目标版本；版本一旦存在不可覆盖，也不要重建“同版本修正版”。
6. 确认 npm Trusted Publisher 仍绑定本仓库的 `.github/workflows/release.yml`，GitHub `npm-release` environment 的保护规则仍生效。

## Trusted release

在 GitHub Actions 手动运行 `Release` workflow：

- Branch：`main`
- `version`：不带 `v` 的精确版本，必须与 `package.json` 相同
- `publish`：只有准备正式发布时才选择 `true`

`publish: true` 的同一次 workflow run 会：

1. 验证 `main` 和版本；
2. 测试、构建并只打包一次候选 tarball；
3. 保存 SHA-256、SRI 和文件清单；
4. 在受保护环境中冻结 tag 和草稿 Release；
5. 通过 npm Trusted Publisher OIDC 发布；
6. 等待 Registry 可见，下载并逐字节比较 tarball；
7. 在隔离目录安装并执行 `npm audit signatures`；
8. 公开已经验证的 GitHub Release。

常规版本不得使用本地 `npm publish`、长期 npm token 或 `NPM_BOOTSTRAP_TOKEN`。bootstrap token 只属于首个包版本的历史兼容路径。

## Post-release verification

在一个全新临时目录中核对 Registry 元数据和可安装性：

```sh
npm view dsh-deepseek-account@<version> version dist.integrity dist.tarball
npm pack dsh-deepseek-account@<version>
npm install --ignore-scripts --legacy-peer-deps --no-audit --no-fund dsh-deepseek-account@<version>
node --input-type=module -e 'import("dsh-deepseek-account").then((m) => console.log(m.name))'
```

同时确认 tag、GitHub Release asset、workflow provenance 和 npm 包指向同一版本。不要在包含真实用户配置的 profile 中做发布 smoke test。

Registry 发布后短时间内查询不到版本通常是传播延迟。先等待并重新读取；若 workflow 的验证 job 失败，优先重跑同一次 workflow 中失败的 job，复用原候选工件。绝不能为同一个不可变版本再次发布不同 tarball。

## Release evidence

在 Release 或维护记录中保留：

- `main` commit SHA 和 tag；
- workflow run；
- 候选 tarball SHA-256/SRI 与文件清单；
- Registry tarball 的逐字节比较；
- npm signature/provenance 结果；
- GitHub Release asset；
- 隔离安装/import 结果；
- 明确未执行的真实账户、浏览器和付款路径。

发布成功不等于真实账户验收。真实余额查询只能在维护者自有测试账户、最小权限和无秘密输出的前提下单独执行；付款不属于自动化发布验证。
