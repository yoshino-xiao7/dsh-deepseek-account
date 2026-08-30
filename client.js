/* global document, window */

window.__ModuleLoader__.load({
  id: "dsh-deepseek-account",
  factory: (require) => {
    const module = { exports: {} }
    const React = require("react")
    const namespace = "settings.deepseekAccount"
    const deepSeekChannel = "/dsh-deepseek-account"
    const grokChannel = "/grok-auth"
    const codexChannel = "/dsh-codex"
    const topUpUrl = "https://platform.deepseek.com/balance"
    const providerIconPaths = Object.freeze({
      grok: "M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815",
      codex: "M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z",
      deepseek: "M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z",
    })
    const dictionaries = {
      zh: {
        nav: "DeepSeek 账户", title: "DeepSeek 账户", description: "查看当前 API Key 所属账户余额，并前往 DeepSeek 官方平台充值。",
        balance: "账户余额", total: "总余额", granted: "赠送余额", toppedUp: "充值余额", refresh: "刷新", refreshing: "刷新中…",
        topUp: "登录并充值", officialNote: "登录和付款仅在 DeepSeek 官方网页完成；插件不读取网页 Cookie，也不会代为提交付款。",
        updated: "数据更新时间", loading: "正在读取余额…", unavailable: "暂时无法读取余额。", unconfigured: "请先在模型设置中配置 DeepSeek API Key。",
        unauthorized: "当前 API Key 无效或已失效。", rateLimited: "查询过于频繁，请稍后重试。", stale: "当前展示上一次成功读取的余额。",
        grokQuota: "Grok 额度", codexQuota: "Codex 额度", fiveHour: "5 小时", weekly: "每周", monthly: "每月", currentPeriod: "当前周期", remaining: "剩余", resetsAt: "重置", resetUnknown: "重置时间不可用", sourceUnavailable: "额度来源不可用",
      },
      en: {
        nav: "DeepSeek account", title: "DeepSeek account", description: "View the balance of the account associated with the current API key and open the official DeepSeek Platform to top up.",
        balance: "Account balance", total: "Total", granted: "Granted", toppedUp: "Topped up", refresh: "Refresh", refreshing: "Refreshing…",
        topUp: "Sign in and top up", officialNote: "Sign-in and payment happen only on the official DeepSeek website. The plugin never reads web cookies or submits payment.",
        updated: "Updated", loading: "Reading balance…", unavailable: "The balance is temporarily unavailable.", unconfigured: "Configure a DeepSeek API key in model settings first.",
        unauthorized: "The current API key was rejected.", rateLimited: "Too many balance requests. Try again later.", stale: "Showing the last successfully verified balance.",
        grokQuota: "Grok quota", codexQuota: "Codex quota", fiveHour: "5-hour", weekly: "Weekly", monthly: "Monthly", currentPeriod: "Current period", remaining: "Remaining", resetsAt: "Resets", resetUnknown: "Reset time unavailable", sourceUnavailable: "Quota source unavailable",
      },
    }

    function createAccountClient(connection) {
      return Object.freeze({
        async read(provider, force, signal) {
          try {
            if (provider === "grok") {
              return safeGrokQuota(await connection.rpc.call(grokChannel, "dashboard", {}, signal))
                ?? { provider, status: "unavailable" }
            }
            if (provider === "codex") {
              return safeCodexUsage(await connection.rpc.call(codexChannel, "usage", {}, signal))
                ?? { provider, status: "unavailable" }
            }
            const result = await connection.rpc.call(deepSeekChannel, "read", { force: force === true }, signal)
            if (!plainRecord(result) || result.ok !== true) return { provider: "deepseek", status: "unavailable" }
            const snapshot = safeSnapshot(result.value)
            return snapshot === undefined
              ? { provider: "deepseek", status: "unavailable" }
              : { provider: "deepseek", ...snapshot }
          } catch {
            return { provider, status: "unavailable" }
          }
        },
      })
    }

    function safeGrokQuota(result) {
      if (!plainRecord(result) || result.ok !== true || !plainRecord(result.value) || result.value.kind !== "dashboard") return undefined
      if (!plainRecord(result.value.dashboard)) return undefined
      const quota = result.value.dashboard.quota
      if (!plainRecord(quota) || quota.state !== "ready") return undefined
      const periodKind = quota.periodKind === "weekly" || quota.periodKind === "monthly" ? quota.periodKind : "current"
      const remainingPercent = projectedRemainingPercent(quota.remainingPercent, quota.usedPercent)
      if ((quota.remainingPercent !== undefined || quota.usedPercent !== undefined) && remainingPercent === undefined) return undefined
      if (quota.resetsAt !== undefined && !validTime(quota.resetsAt)) return undefined
      return {
        provider: "grok",
        status: "ready",
        periodKind,
        ...(remainingPercent === undefined ? {} : { remainingPercent }),
        ...(quota.resetsAt === undefined ? {} : { resetsAt: quota.resetsAt }),
      }
    }

    function safeCodexUsage(result) {
      if (!plainRecord(result) || result.ok !== true || !plainRecord(result.value) || !Array.isArray(result.value.rateLimits) || result.value.rateLimits.length > 16) return undefined
      const limit = result.value.rateLimits.find((candidate) => plainRecord(candidate) && candidate.limitId === "codex")
        ?? result.value.rateLimits.find(plainRecord)
      if (!plainRecord(limit)) return undefined
      const windows = [limit.primary, limit.secondary]
        .map(safeCodexWindow)
        .filter((window) => window !== undefined)
        .sort((left, right) => ({ "five-hour": 0, weekly: 1 })[left.kind] - ({ "five-hour": 0, weekly: 1 })[right.kind])
      if (windows.length === 0) return undefined
      return { provider: "codex", status: "ready", windows }
    }

    function safeCodexWindow(value) {
      if (!plainRecord(value) || typeof value.usedPercent !== "number" || !Number.isFinite(value.usedPercent) || value.usedPercent < 0 || value.usedPercent > 100) return undefined
      const kind = value.windowDurationMins === 300 ? "five-hour" : value.windowDurationMins === 10_080 ? "weekly" : undefined
      if (kind === undefined || !validTimestamp(value.resetsAt)) return undefined
      return { kind, remainingPercent: projectedRemainingPercent(undefined, value.usedPercent), resetsAt: value.resetsAt }
    }

    function safeSnapshot(value) {
      if (!plainRecord(value)) return undefined
      if (value.status === "ready") return safeReady(value)
      if (value.status !== "unavailable" || !["credential-unconfigured", "credential-unauthorized", "rate-limited", "network", "invalid-response"].includes(value.reason)) return undefined
      const lastGood = value.lastGood === undefined ? undefined : safeReady(value.lastGood)
      if (value.lastGood !== undefined && lastGood === undefined) return undefined
      return lastGood === undefined ? { status: "unavailable", reason: value.reason } : { status: "unavailable", reason: value.reason, lastGood }
    }

    function safeReady(value) {
      if (!plainRecord(value) || value.status !== "ready" || typeof value.isAvailable !== "boolean" || typeof value.stale !== "boolean" || !validTime(value.fetchedAt) || !Array.isArray(value.balances) || value.balances.length > 2) return undefined
      const balances = []
      const currencies = new Set()
      for (const item of value.balances) {
        if (!plainRecord(item) || (item.currency !== "CNY" && item.currency !== "USD") || currencies.has(item.currency)) return undefined
        if (![item.total, item.granted, item.toppedUp].every(validDecimal)) return undefined
        currencies.add(item.currency)
        balances.push({ currency: item.currency, total: item.total, granted: item.granted, toppedUp: item.toppedUp })
      }
      return { status: "ready", isAvailable: value.isAvailable, balances, fetchedAt: value.fetchedAt, stale: value.stale }
    }

    function useAccount(client, provider = "deepseek", enabled = true) {
      const [state, setState] = React.useState({ provider, status: "loading" })
      const [busy, setBusy] = React.useState(false)
      const refresh = React.useCallback(async (force = false) => {
        setBusy(true)
        try { setState(await client.read(provider, force)) }
        catch { setState({ provider, status: "unavailable" }) }
        finally { setBusy(false) }
      }, [client, provider])
      React.useEffect(() => {
        if (!enabled) return undefined
        let active = true
        const controller = new AbortController()
        setState({ provider, status: "loading" })
        setBusy(true)
        void client.read(provider, false, controller.signal).then((value) => {
          if (active) setState(value)
        }).finally(() => {
          if (active) setBusy(false)
        })
        return () => { active = false; controller.abort() }
      }, [client, enabled, provider])
      return { state, busy, refresh }
    }

    function useActiveAccountProvider(ctx) {
      const [provider, setProvider] = React.useState("deepseek")
      React.useEffect(() => {
        let stopDirectory = () => {}
        let active = true
        const publish = (directory) => {
          const selected = directory?.store.getSnapshot().current?.provider
          if (selected === undefined || !active) return
          setProvider(accountProvider(selected))
        }
        const bind = () => {
          stopDirectory()
          stopDirectory = () => {}
          const sessionId = ctx.sessions.list.getSnapshot().current
          if (sessionId === undefined) {
            setProvider("deepseek")
            return
          }
          let directory
          try { directory = ctx.modelDirectories.directoryFor(sessionId) } catch { return }
          publish(directory)
          stopDirectory = directory.store.subscribe(() => publish(directory))
          if (directory.store.getSnapshot().current === null) void directory.load().catch(() => {})
        }
        const stopSessions = ctx.sessions.list.subscribe(bind)
        bind()
        return () => { active = false; stopSessions(); stopDirectory() }
      }, [ctx])
      return provider
    }

    function accountProvider(selected) {
      return selected === "llm-grok" || selected === "grok" ? "grok" : selected === "dsh-codex" ? "codex" : "deepseek"
    }

    function shownSnapshot(state) { return state.status === "ready" ? state : state.lastGood }
    function mainBalance(snapshot) { return snapshot?.balances.find((item) => item.currency === "CNY") ?? snapshot?.balances[0] }
    function money(balance) { return balance === undefined ? "—" : `${balance.currency === "CNY" ? "¥" : "$"}${balance.total}` }

    function resetTime(value) { return value === undefined ? undefined : new Date(value).toLocaleString() }
    function percentText(value) { return String(Math.round(value * 10) / 10) }

    function sidebarPresentation(provider, state, t) {
      if (provider === "grok") {
        if (state.status !== "ready") return { label: t("grokQuota"), lines: [t(state.status === "loading" ? "loading" : "sourceUnavailable")] }
        const periodLabel = t(state.periodKind === "weekly" ? "weekly" : state.periodKind === "monthly" ? "monthly" : "currentPeriod")
        const reset = resetTime(state.resetsAt)
        return {
          label: t("grokQuota"),
          lines: [
            state.remainingPercent === undefined ? t("sourceUnavailable") : `${t("remaining")} ${percentText(state.remainingPercent)}%`,
            `${periodLabel} · ${reset === undefined ? t("resetUnknown") : `${t("resetsAt")} ${reset}`}`,
          ],
        }
      }
      if (provider === "codex") {
        const windows = state.status === "ready" ? state.windows : []
        const lines = windows.map((window) => `${t(window.kind === "five-hour" ? "fiveHour" : "weekly")} · ${t("remaining")} ${percentText(window.remainingPercent)}% · ${t("resetsAt")} ${resetTime(window.resetsAt)}`)
        return { label: t("codexQuota"), lines: lines.length === 0 ? [t(state.status === "loading" ? "loading" : "sourceUnavailable")] : lines }
      }
      return { label: t("balance"), lines: [money(mainBalance(shownSnapshot(state)))] }
    }

    function ProviderIcon({ provider }) {
      return React.createElement("svg", {
        className: "dsh-deepseek-account-provider-icon",
        "data-provider-icon": provider,
        viewBox: "0 0 24 24",
        fill: "currentColor",
        fillRule: "evenodd",
        focusable: "false",
        "aria-hidden": "true",
      }, React.createElement("path", { d: providerIconPaths[provider] ?? providerIconPaths.deepseek }))
    }

    function SidebarBalance({ wide, ctx, client, t }) {
      const provider = useActiveAccountProvider(ctx)
      const { state, busy, refresh } = useAccount(client, provider)
      const currentState = state.provider === provider ? state : { provider, status: "loading" }
      const presentation = sidebarPresentation(provider, currentState, t)
      return React.createElement("button", {
        type: "button", className: wide ? "dsh-deepseek-account-card" : "dsh-deepseek-account-rail",
        disabled: busy, onClick: () => void refresh(true), "aria-label": `${presentation.label} ${presentation.lines.join(" · ")}`,
      }, wide
        ? React.createElement(React.Fragment, null,
          React.createElement("span", { className: "dsh-deepseek-account-symbol", "aria-hidden": "true" }, ProviderIcon({ provider })),
          React.createElement("span", { className: "dsh-deepseek-account-copy" }, React.createElement("span", null, presentation.label),
            ...presentation.lines.map((line, index) => React.createElement("small", { key: `${provider}-${index}` }, line))),
          React.createElement("span", { "aria-hidden": "true" }, busy ? "…" : "↻"))
        : ProviderIcon({ provider }))
    }

    function AccountSettings({ client, t }) {
      const { state, busy, refresh } = useAccount(client, "deepseek")
      const shown = shownSnapshot(state)
      const reason = state.status === "unavailable" ? ({
        "credential-unconfigured": "unconfigured", "credential-unauthorized": "unauthorized", "rate-limited": "rateLimited",
      }[state.reason] ?? "unavailable") : undefined
      return React.createElement("section", { className: "dsh-deepseek-account-page" },
        React.createElement("h2", null, t("title")), React.createElement("p", { className: "dsh-deepseek-account-description" }, t("description")),
        React.createElement("article", { className: "dsh-deepseek-account-panel" },
          React.createElement("div", { className: "dsh-deepseek-account-head" }, React.createElement("h3", null, t("balance")),
            React.createElement("button", { type: "button", disabled: busy, onClick: () => void refresh(true) }, busy ? t("refreshing") : t("refresh"))),
          shown === undefined ? React.createElement("p", null, state.status === "loading" ? t("loading") : t(reason))
            : React.createElement("div", { className: "dsh-deepseek-account-balances" }, shown.balances.map((balance) =>
              React.createElement("div", { className: "dsh-deepseek-account-balance", key: balance.currency },
                React.createElement("strong", null, `${balance.currency === "CNY" ? "¥" : "$"}${balance.total}`),
                React.createElement("span", null, `${t("granted")} ${balance.granted}`),
                React.createElement("span", null, `${t("toppedUp")} ${balance.toppedUp}`)))),
          state.status === "unavailable" && shown !== undefined && React.createElement("p", { className: "dsh-deepseek-account-warning" }, t("stale")),
          shown?.fetchedAt && React.createElement("small", null, `${t("updated")}：${new Date(shown.fetchedAt).toLocaleString()}`)),
        React.createElement("article", { className: "dsh-deepseek-account-panel" },
          React.createElement("a", { className: "dsh-deepseek-account-topup", href: topUpUrl, target: "_blank", rel: "noreferrer" }, t("topUp")),
          React.createElement("p", null, t("officialNote"))))
    }

    function installStyle() {
      if (document.querySelector('style[data-dsh-deepseek-account]')) return () => {}
      const style = document.createElement("style")
      style.dataset.dshDeepseekAccount = ""
      style.textContent = ".dsh-deepseek-account-card{display:grid;width:100%;min-height:48px;margin:3px 0;padding:4px 3px;border:0;border-radius:8px;grid-template-columns:22px minmax(0,1fr) 16px;align-items:center;gap:10px;color:inherit;background:transparent;cursor:pointer;font:inherit;text-align:left}.dsh-deepseek-account-card:hover,.dsh-deepseek-account-rail:hover{background:var(--dsw-alias-interactive-bg-hover)}.dsh-deepseek-account-symbol{font-weight:650;text-align:center}.dsh-deepseek-account-copy{display:flex;min-width:0;flex-direction:column}.dsh-deepseek-account-copy small{overflow:hidden;color:var(--dsw-alias-label-tertiary);font-size:11px;text-overflow:ellipsis;white-space:nowrap}.dsh-deepseek-account-rail{display:grid;width:36px;height:36px;margin:4px auto;border:0;border-radius:8px;place-items:center;color:inherit;background:transparent;cursor:pointer;font-size:10px;font-weight:650}.dsh-deepseek-account-page{box-sizing:border-box;width:min(860px,100%);padding:8px 4px 40px;color:var(--dsw-alias-label-primary)}.dsh-deepseek-account-page h2{margin:0}.dsh-deepseek-account-description{color:var(--dsw-alias-label-secondary)}.dsh-deepseek-account-panel{margin-top:14px;padding:18px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-1)}.dsh-deepseek-account-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.dsh-deepseek-account-head h3{margin:0}.dsh-deepseek-account-head button,.dsh-deepseek-account-topup{min-height:34px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:0 13px;color:inherit;background:transparent;font:inherit}.dsh-deepseek-account-balances{display:grid;margin-top:14px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.dsh-deepseek-account-balance{display:flex;flex-direction:column;gap:5px;padding:14px;border-radius:12px;background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-interactive-bg-hover))}.dsh-deepseek-account-balance strong{font-size:22px}.dsh-deepseek-account-balance span,.dsh-deepseek-account-panel p,.dsh-deepseek-account-panel small{color:var(--dsw-alias-label-secondary);font-size:12px}.dsh-deepseek-account-warning{color:var(--dsw-alias-state-warn-label)!important}.dsh-deepseek-account-topup{display:inline-flex;align-items:center;color:#fff;text-decoration:none;background:var(--dsw-alias-state-business-primary)}"
      style.textContent += ".dsh-deepseek-account-provider-icon{display:block;width:18px;height:18px;margin:auto}.dsh-deepseek-account-copy{gap:2px}.dsh-deepseek-account-copy small{overflow:visible;line-height:1.35;overflow-wrap:anywhere;text-overflow:clip;white-space:normal}"
      document.head.append(style)
      return () => style.remove()
    }

    const inject = ["slots", "locale", "connection", "sessions", "modelDirectories"]
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(namespace, dictionaries), "deepseek-account: dictionaries")
      ctx.effect(() => installStyle(), "deepseek-account: styles")
      const t = ctx.locale.bind(namespace)
      const client = createAccountClient(ctx.connection)
      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action", id: "deepseek-account", order: 35, label: t("balance"),
        inject: () => ({ ctx, client, t }),
      }, SidebarBalance))
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section", id: "deepseek-account", order: 44, label: () => t("nav"), locale: namespace,
        inject: () => ({ client, t }),
      }, AccountSettings))
    }

    module.exports.inject = inject
    module.exports.apply = apply
    module.exports.accountProvider = accountProvider
    module.exports.createAccountClient = createAccountClient
    module.exports.safeCodexUsage = safeCodexUsage
    module.exports.safeGrokQuota = safeGrokQuota
    module.exports.safeSnapshot = safeSnapshot
    return module.exports
  },
})

function plainRecord(value) { return typeof value === "object" && value !== null && !Array.isArray(value) }
function validDecimal(value) { return typeof value === "string" && value.length <= 64 && /^\d+(?:\.\d+)?$/u.test(value) }
function validTime(value) { return typeof value === "string" && Number.isFinite(Date.parse(value)) }
function validTimestamp(value) { return Number.isSafeInteger(value) && value >= 0 && Number.isFinite(new Date(value).getTime()) }
function projectedRemainingPercent(remainingPercent, usedPercent) {
  const value = remainingPercent === undefined ? (typeof usedPercent === "number" ? 100 - usedPercent : undefined) : remainingPercent
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : undefined
}
