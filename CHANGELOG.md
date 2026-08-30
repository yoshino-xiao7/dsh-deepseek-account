# Changelog

## 0.1.0 - 2026-08-30

- Create an independent DeepSeek Harness account plugin with a loopback-only balance RPC and a credential-isolated Host boundary.
- Display CNY/USD total, granted, and topped-up balances in the sidebar and a dedicated settings page.
- Open the fixed official DeepSeek Platform balance page for web sign-in and top-up without receiving cookies, payment data, or payment authority.
- Render the DeepSeek card for DeepSeek and unknown custom Providers, hide it for Grok and Codex, and avoid balance requests while another Provider is selected.
- Bound balance response size and schema, preserve decimal strings, coalesce concurrent reads, rate-limit refreshes, and retain a marked stale snapshot after transient failure.
