# dsh-deepseek-account

An independent DeepSeek Harness account plugin that:

- shows the balance associated with the configured DeepSeek API key when the current conversation selects DeepSeek or an unknown custom Provider;
- presents CNY/USD total, granted, and topped-up balances in a dedicated settings page;
- opens the official DeepSeek Platform for web sign-in and top-up.

The sidebar component returns no content for Grok or Codex, allowing those Provider plugins to display their own usage limits. This plugin never receives web cookies or payment details and never submits a payment.

## Security boundary

`DEEPSEEK_API_KEY` is resolved only by the Host through the Harness credential service. The browser can request only a validated balance snapshot through a loopback-only RPC. The build fails if the client artifact contains credential resolution or an Authorization header.

The top-up destination is fixed to `https://platform.deepseek.com/balance`; sign-in and payment happen entirely on the official DeepSeek website.

## Installation

After the formal release, install the exact version:

```sh
dsh plugin --profile web add dsh-deepseek-account@0.1.0
dsh web
```

## Development

```sh
npm run check
```

The release branch is `yukiryou/v0.1.0`. `dist/` is generated during build and packaging and is not committed.
