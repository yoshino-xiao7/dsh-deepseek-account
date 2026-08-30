# Changelog

## 0.1.2 - 2026-08-30

- Republish the corrected provider-aware sidebar release exclusively through the repository's GitHub Actions Trusted Publisher workflow.
- Preserve the 0.1.1 runtime behavior without additional Grok or Codex provider changes.

## 0.1.1 - 2026-08-30

- Make this plugin the sole owner of the provider-aware sidebar account card without changing Grok or Codex plugin behavior.
- Read Grok and Codex reset windows through their existing optional local RPCs; show Grok reset time and Codex five-hour and weekly reset times only.
- Keep DeepSeek balance and official top-up fully functional when Grok or Codex is not installed, and fall back to DeepSeek for unknown custom Providers.

## 0.1.0 - 2026-08-30

- Create an independent DeepSeek Harness account plugin with a loopback-only balance RPC and a credential-isolated Host boundary.
- Display CNY/USD total, granted, and topped-up balances in the sidebar and a dedicated settings page.
- Open the fixed official DeepSeek Platform balance page for web sign-in and top-up without receiving cookies, payment data, or payment authority.
- Render the DeepSeek card for DeepSeek and unknown custom Providers, hide it for Grok and Codex, and avoid balance requests while another Provider is selected.
- Bound balance response size and schema, preserve decimal strings, coalesce concurrent reads, rate-limit refreshes, and retain a marked stale snapshot after transient failure.
