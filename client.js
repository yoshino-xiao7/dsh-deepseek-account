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
    const dictionaries = {
      zh: {
        nav: "DeepSeek 账户", title: "DeepSeek 账户", description: "查看当前 API Key 所属账户余额，并前往 DeepSeek 官方平台充值。",
        balance: "账户余额", total: "总余额", granted: "赠送余额", toppedUp: "充值余额", refresh: "刷新", refreshing: "刷新中…",
        topUp: "登录并充值", officialNote: "登录和付款仅在 DeepSeek 官方网页完成；插件不读取网页 Cookie，也不会代为提交付款。",
        updated: "数据更新时间", loading: "正在读取余额…", unavailable: "暂时无法读取余额。", unconfigured: "请先在模型设置中配置 DeepSeek API Key。",
        unauthorized: "当前 API Key 无效或已失效。", rateLimited: "查询过于频繁，请稍后重试。", stale: "当前展示上一次成功读取的余额。",
        grokQuota: "Grok 额度", codexQuota: "Codex 额度", fiveHour: "5 小时", weekly: "每周", resetsAt: "重置", resetUnknown: "重置时间不可用", sourceUnavailable: "额度来源不可用",
      },
      en: {
        nav: "DeepSeek account", title: "DeepSeek account", description: "View the balance of the account associated with the current API key and open the official DeepSeek Platform to top up.",
        balance: "Account balance", total: "Total", granted: "Granted", toppedUp: "Topped up", refresh: "Refresh", refreshing: "Refreshing…",
        topUp: "Sign in and top up", officialNote: "Sign-in and payment happen only on the official DeepSeek website. The plugin never reads web cookies or submits payment.",
        updated: "Updated", loading: "Reading balance…", unavailable: "The balance is temporarily unavailable.", unconfigured: "Configure a DeepSeek API key in model settings first.",
        unauthorized: "The current API key was rejected.", rateLimited: "Too many balance requests. Try again later.", stale: "Showing the last successfully verified balance.",
        grokQuota: "Grok quota", codexQuota: "Codex quota", fiveHour: "5-hour", weekly: "Weekly", resetsAt: "Resets", resetUnknown: "Reset time unavailable", sourceUnavailable: "Quota source unavailable",
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
      if (quota.resetsAt !== undefined && !validTime(quota.resetsAt)) return undefined
      return {
        provider: "grok",
        status: "ready",
        periodKind,
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
      return { kind, resetsAt: value.resetsAt }
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

    function sidebarPresentation(provider, state, t) {
      if (provider === "grok") {
        const reset = state.status === "ready" ? resetTime(state.resetsAt) : undefined
        return { label: t("grokQuota"), symbol: "G", summary: reset === undefined ? t(state.status === "loading" ? "loading" : "sourceUnavailable") : `${t("resetsAt")} ${reset}` }
      }
      if (provider === "codex") {
        const windows = state.status === "ready" ? state.windows : []
        const summary = windows.map((window) => `${t(window.kind === "five-hour" ? "fiveHour" : "weekly")} ${t("resetsAt")} ${resetTime(window.resetsAt)}`).join(" · ")
        return { label: t("codexQuota"), symbol: "C", summary: summary || t(state.status === "loading" ? "loading" : "sourceUnavailable") }
      }
      return { label: t("balance"), symbol: "¥", summary: money(mainBalance(shownSnapshot(state))) }
    }

    function SidebarBalance({ wide, ctx, client, t }) {
      const provider = useActiveAccountProvider(ctx)
      const { state, busy, refresh } = useAccount(client, provider)
      const presentation = sidebarPresentation(provider, state, t)
      return React.createElement("button", {
        type: "button", className: wide ? "dsh-deepseek-account-card" : "dsh-deepseek-account-rail",
        disabled: busy, onClick: () => void refresh(true), "aria-label": `${presentation.label} ${presentation.summary}`,
      }, wide
        ? React.createElement(React.Fragment, null,
          React.createElement("span", { className: "dsh-deepseek-account-symbol", "aria-hidden": "true" }, presentation.symbol),
          React.createElement("span", { className: "dsh-deepseek-account-copy" }, React.createElement("span", null, presentation.label), React.createElement("small", null, presentation.summary)),
          React.createElement("span", { "aria-hidden": "true" }, busy ? "…" : "↻"))
        : React.createElement("span", null, presentation.symbol))
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
