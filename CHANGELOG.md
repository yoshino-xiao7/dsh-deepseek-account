# Changelog

## 0.1.6 - 2026-08-30

- Replace the Harness settings gear with exactly one DeepSeek whale icon even when shell CSS overrides `hidden` or the settings row re-renders in place.
- Remove visible Provider quota headings and decorative sidebar backgrounds while retaining accessible labels and complete account details.

## 0.1.5 - 2026-08-30

- Group Codex five-hour and weekly quota data into compact visual blocks with stronger percentage hierarchy and secondary reset-time rows.
- Refresh the selected Provider once when the current conversation transitions from running to idle, without polling or duplicate idle refreshes.
- Replace the generic gear beside the DeepSeek account settings entry with the DeepSeek whale icon, restoring the original shell icon when the plugin unloads.

## 0.1.4 - 2026-08-30

- Show the remaining Grok quota percentage with its current reset window.
- Show both Codex five-hour and weekly remaining percentages and reset times on separate, wrapping sidebar lines.
- Replace the generic sidebar letters with provider-specific Grok, ChatGPT/OpenAI, and DeepSeek icons.

## 0.1.3 - 2026-08-30

- Keep the sidebar mounted while switching from a ready Provider to DeepSeek, an unknown Provider fallback, or Codex, instead of rendering the previous Provider's incompatible state shape.
- Preserve Grok and Codex plugin ownership without changing their authentication, models, settings, or RPC behavior.
- Refactor the bilingual README and add architecture, maintenance, support, conduct, issue, and pull-request guidance for community ownership.

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
