# dsh-deepseek-account

[![CI](https://github.com/yoshino-xiao7/dsh-deepseek-account/actions/workflows/ci.yml/badge.svg)](https://github.com/yoshino-xiao7/dsh-deepseek-account/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/dsh-deepseek-account.svg)](https://www.npmjs.com/package/dsh-deepseek-account)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An independent account plugin for DeepSeek Harness. It uses one sidebar entry to show account information for the Provider selected by the current conversation and provides an official top-up entry for DeepSeek.

> This plugin only reads account status and opens an official page. It never reads web cookies, account passwords, or payment details, and it never signs in or pays on a user's behalf.

[中文](README.md) · [Contributing](CONTRIBUTING.md) · [Architecture](docs/ARCHITECTURE.md) · [Security](SECURITY.md)

## Capabilities and boundaries

| Current Provider | Sidebar content | Data source | Provider plugin required |
| --- | --- | --- | --- |
| DeepSeek | DeepSeek icon and balance for the configured API key | Official DeepSeek `/user/balance` | No |
| Grok | Grok icon, remaining percentage, current period, and reset time | Existing local RPC from the Grok plugin | Yes |
| Codex | ChatGPT icon plus remaining percentages and reset times for the five-hour and weekly windows | Existing local RPC from the Codex plugin | Yes |
| Unknown custom Provider | Falls back to the DeepSeek icon and balance | Official DeepSeek `/user/balance` | No |

The sidebar always shows exactly one item for the Provider selected by the current conversation. Grok and Codex are optional data sources; this plugin does not take over their authentication, models, settings, or other behavior. If an optional plugin is missing, its quota source is shown as unavailable while DeepSeek balance and top-up remain independent.

Only DeepSeek has a top-up entry. Grok uses the remaining percentage supplied by its optional plugin, falling back to the supplied used percentage when needed. Codex converts the used percentages supplied by its optional plugin into remaining percentages. The plugin retains only the projected percentages and reset windows needed for display, not the upstream usage objects.

## Installation

Requirements:

- Node.js `>=22.19.0 <25`
- DeepSeek Harness in the `0.1.1-rc.2` line
- `DEEPSEEK_API_KEY` configured in Harness model settings when reading a DeepSeek balance

Install the current stable version:

```sh
dsh plugin --profile web add dsh-deepseek-account@0.1.6
dsh web
```

In the current conversation's Web UI:

1. The sidebar footer identifies the current account source with its Provider icon and shows account details without decorative backgrounds; click it to refresh, or let it refresh once automatically after each conversation turn finishes.
2. The settings navigation replaces the generic gear in place with the DeepSeek whale icon; the “DeepSeek account” page shows CNY/USD total, granted, and topped-up balances.
3. “Sign in and top up” opens only `https://platform.deepseek.com/balance` in a new page.

When another entry such as the official Cordis Plugin also occupies the sidebar footer, this plugin stacks the footer actions vertically so multiple full-width entries cannot push each other outside the sidebar.

Continue to pin an exact version when upgrading so pre-release dependencies cannot drift:

```sh
dsh plugin --profile web add dsh-deepseek-account@<version>
dsh web
```

## Common states

| UI message | Meaning | Suggested action |
| --- | --- | --- |
| Configure an API key | Harness credential service did not resolve `DEEPSEEK_API_KEY` | Configure it in model settings; never post the key in an issue or log |
| API key rejected | DeepSeek returned 401/403 | Replace or reconfigure the key |
| Too many requests | DeepSeek returned 429 | Wait before retrying; do not refresh repeatedly |
| Showing the last verified balance | The current request failed and the plugin retained a marked stale snapshot | Check the network, retry later, and note the timestamp |
| Quota source unavailable | The Grok/Codex plugin is absent, stopped, or exposes an incompatible local RPC | Check that plugin; DeepSeek remains unaffected |

Automatic DeepSeek reads are cached for up to five minutes, forced refreshes for 30 seconds, and concurrent reads are coalesced into one request. After each conversation turn, the plugin observes the current session's running-to-idle edge and refreshes the current Provider without polling.

## Security design

- `DEEPSEEK_API_KEY` is resolved only on the Host through the Harness credential service.
- The browser receives only a strictly projected balance snapshot over a loopback-only RPC.
- Upstream responses are limited to 32 KiB and monetary values remain decimal strings.
- The build rejects client artifacts containing credential resolution or an Authorization header.
- The top-up destination is fixed to the official DeepSeek page; the plugin has no payment authority.

Report vulnerabilities privately according to [SECURITY.md](SECURITY.md). Never put real credentials, cookies, balances, or payment data in public issues, screenshots, or test fixtures.

## Development and contribution

```sh
git clone https://github.com/yoshino-xiao7/dsh-deepseek-account.git
cd dsh-deepseek-account
npm ci --ignore-scripts --omit=peer
npm run check
npm run pack:check
```

`npm run check` runs the Node.js tests followed by a deterministic build. `dist/` is generated and must not be committed. CI exercises the same interfaces on Node.js 22/24 and Linux, macOS, and Windows.

Read these before changing the project:

- [CONTRIBUTING.md](CONTRIBUTING.md) for branches, tests, pull requests, and change boundaries
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the Host, loopback RPC, browser, and optional-Provider seams
- [docs/MAINTAINING.md](docs/MAINTAINING.md) for triage, compatibility, and trusted releases
- [SUPPORT.md](SUPPORT.md) to choose the right support channel

## Project status

Automated checks cover response projection, caching/rate limiting, RPC authority, absent optional plugins, Provider selection, client credential isolation, cross-platform builds, and package contents.

These checks are not real-account acceptance. Maintainers do not put real API keys in CI and do not automate web sign-in or payment. Version-specific verification scope is recorded under [docs/releases](docs/releases) and in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
