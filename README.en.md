# dsh-deepseek-account

An independent DeepSeek Harness account plugin that:

- shows the balance associated with the configured DeepSeek API key when the current conversation selects DeepSeek or an unknown custom Provider;
- shows the reset time for Grok usage and the five-hour and weekly reset times for Codex usage when either Provider is selected;
- presents CNY/USD total, granted, and topped-up balances in a dedicated settings page;
- opens the official DeepSeek Platform for web sign-in and top-up.

The sidebar shows exactly one item for the Provider selected by the current conversation. Grok and Codex data is read on demand through their existing local RPCs; this plugin does not change or take over either Provider plugin's authentication, models, settings, or other behavior. If either optional plugin is absent, only that Provider's quota source is unavailable while DeepSeek balance and top-up continue to work independently. Unknown custom Providers fall back to DeepSeek.

Only DeepSeek has a top-up entry. Grok and Codex show reset times only.

## Security boundary

`DEEPSEEK_API_KEY` is resolved only by the Host through the Harness credential service. The browser can request only a validated balance snapshot through a loopback-only RPC. The build fails if the client artifact contains credential resolution or an Authorization header.

The top-up destination is fixed to `https://platform.deepseek.com/balance`; sign-in and payment happen entirely on the official DeepSeek website.

## Installation

After the formal release, install the exact version:

```sh
dsh plugin --profile web add dsh-deepseek-account@0.1.2
dsh web
```

## Development

```sh
npm run check
```

The release branch is `yukiryou/v0.1.2`. `dist/` is generated during build and packaging and is not committed.
