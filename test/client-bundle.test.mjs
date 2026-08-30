import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"

const root = path.resolve(import.meta.dirname, "..")
const plain = (value) => JSON.parse(JSON.stringify(value))

test("registers separate DeepSeek settings and provider-aware sidebar surfaces", async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"))
  assert.equal(manifest.dsh.bundle.patch, "deepseek-account.patch.yml")
  assert.ok(manifest.dsh.client.inject.includes("@deepseek-ai/dsh-client-ui-model-selection"))
  assert.ok(manifest.dsh.client.inject.includes("@deepseek-ai/dsh-client-ui-sidebar"))

  let definition
  const source = await fs.readFile(path.join(root, "client.js"), "utf8")
  assert.doesNotMatch(source, /authorization:\s*`Bearer|credentials\.resolve/u)
  assert.match(source, /https:\/\/platform\.deepseek\.com\/balance/u)
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load(value) { definition = value } } },
    document: {
      head: { append() {} },
      createElement: () => ({ dataset: {}, remove() {}, textContent: "" }),
      querySelector: () => null,
    },
  })

  const plugin = definition.factory((id) => {
    assert.equal(id, "react")
    return { createElement() {}, Fragment: Symbol("Fragment") }
  })
  assert.equal(definition.id, "dsh-deepseek-account")
  assert.deepEqual(Array.from(plugin.inject), ["slots", "locale", "connection", "sessions", "modelDirectories"])
  assert.equal(plugin.accountProvider("llm-grok"), "grok")
  assert.equal(plugin.accountProvider("grok"), "grok")
  assert.equal(plugin.accountProvider("dsh-codex"), "codex")
  assert.equal(plugin.accountProvider("deepseek"), "deepseek")
  assert.equal(plugin.accountProvider("my-custom-provider"), "deepseek")

  const calls = []
  const client = plugin.createAccountClient({
    rpc: {
      async call(channel, endpoint, payload) {
        calls.push({ channel, endpoint, payload })
        if (channel === "/dsh-deepseek-account") {
          return {
            ok: true,
            value: {
              status: "ready",
              isAvailable: true,
              balances: [{ currency: "CNY", total: "12.30", granted: "2.30", toppedUp: "10.00" }],
              fetchedAt: "2026-08-30T00:00:00.000Z",
              stale: false,
            },
          }
        }
        throw new Error("optional provider plugin is not installed")
      },
    },
  })
  assert.deepEqual(plain(await client.read("deepseek", false)), {
    provider: "deepseek",
    status: "ready",
    isAvailable: true,
    balances: [{ currency: "CNY", total: "12.30", granted: "2.30", toppedUp: "10.00" }],
    fetchedAt: "2026-08-30T00:00:00.000Z",
    stale: false,
  })
  assert.deepEqual(plain(calls), [{
    channel: "/dsh-deepseek-account",
    endpoint: "read",
    payload: { force: false },
  }])
  assert.deepEqual(plain(await client.read("grok", false)), { provider: "grok", status: "unavailable" })
  assert.deepEqual(plain(await client.read("codex", false)), { provider: "codex", status: "unavailable" })
  assert.equal(calls.length, 3)
  assert.equal(calls[1].channel, "/grok-auth")
  assert.equal(calls[2].channel, "/dsh-codex")
  assert.equal((await client.read("deepseek", true)).status, "ready")
  assert.deepEqual(plain(calls[3]), {
    channel: "/dsh-deepseek-account",
    endpoint: "read",
    payload: { force: true },
  })

  const registrations = []
  plugin.apply({
    connection: { rpc: { call() {} } },
    effect(callback) { callback() },
    locale: { register() {}, bind: () => (key) => key },
    slots: {
      inject(_name, callback) { callback() },
      register(options, component) { registrations.push({ options, component }) },
    },
    sessions: { list: { getSnapshot: () => ({ current: undefined }), subscribe: () => () => {} } },
    modelDirectories: { directoryFor: () => { throw new Error("no active session") } },
  })

  assert.deepEqual(registrations.map(({ options }) => options.name), ["sidebar.footer.action", "settings.section"])
  assert.equal(registrations[0].options.id, "deepseek-account")
  assert.equal(registrations[0].options.order, 35)
  assert.equal(registrations[1].options.id, "deepseek-account")
  assert.equal(typeof registrations[0].component, "function")
  assert.equal(typeof registrations[1].component, "function")
})

test("projects only bounded Grok and Codex quota fields from their optional RPC results", async () => {
  let definition
  const source = await fs.readFile(path.join(root, "client.js"), "utf8")
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load(value) { definition = value } } },
    document: {
      head: { append() {} },
      createElement: () => ({ dataset: {}, remove() {}, textContent: "" }),
      querySelector: () => null,
    },
  })
  const plugin = definition.factory(() => ({ createElement() {}, Fragment: Symbol("Fragment") }))

  const grok = plugin.safeGrokQuota({
    ok: true,
    value: {
      kind: "dashboard",
      dashboard: {
        quota: {
          state: "ready",
          periodKind: "weekly",
          usedPercent: 25,
          remainingPercent: 75,
          resetsAt: "2026-09-01T00:00:00.000Z",
        },
      },
    },
  })
  assert.deepEqual(plain(grok), {
    provider: "grok",
    status: "ready",
    periodKind: "weekly",
    remainingPercent: 75,
    resetsAt: "2026-09-01T00:00:00.000Z",
  })
  assert.equal("usedPercent" in grok, false)

  const codex = plugin.safeCodexUsage({
    ok: true,
    value: {
      observedAt: Date.parse("2026-08-30T00:00:00.000Z"),
      rateLimits: [{
        limitId: "codex",
        primary: { usedPercent: 20, windowDurationMins: 300, resetsAt: Date.parse("2026-08-30T05:00:00.000Z") },
        secondary: { usedPercent: 40, windowDurationMins: 10_080, resetsAt: Date.parse("2026-09-06T00:00:00.000Z") },
      }],
    },
  })
  assert.deepEqual(plain(codex), {
    provider: "codex",
    status: "ready",
    windows: [
      { kind: "five-hour", remainingPercent: 80, resetsAt: Date.parse("2026-08-30T05:00:00.000Z") },
      { kind: "weekly", remainingPercent: 60, resetsAt: Date.parse("2026-09-06T00:00:00.000Z") },
    ],
  })
  assert.equal(JSON.stringify(codex).includes("usedPercent"), false)
})

test("renders icon-only provider identity and background-free account details", async () => {
  const source = await fs.readFile(path.join(root, "client.js"), "utf8")
  assert.match(source, /\.dsh-deepseek-account-card:hover\{background:transparent\}/u)
  assert.match(source, /\.dsh-deepseek-account-quota-window\{[^}]*background:transparent/u)
  const cases = [{
    provider: "grok",
    state: {
      provider: "grok",
      status: "ready",
      periodKind: "weekly",
      remainingPercent: 75,
      resetsAt: "2026-09-01T00:00:00.000Z",
    },
    expected: [["remaining", "75%"], ["weekly", "resetsAt"]],
    icon: "grok",
    visibleLabel: "grokQuota",
  }, {
    provider: "codex",
    state: {
      provider: "codex",
      status: "ready",
      windows: [
        { kind: "five-hour", remainingPercent: 80, resetsAt: Date.parse("2026-08-30T05:00:00.000Z") },
        { kind: "weekly", remainingPercent: 60, resetsAt: Date.parse("2026-09-06T00:00:00.000Z") },
      ],
    },
    expected: [["fiveHour", "remaining", "80%", "resetsAt"], ["weekly", "remaining", "60%", "resetsAt"]],
    icon: "codex",
    visibleLabel: "codexQuota",
  }, {
    provider: "deepseek",
    state: {
      provider: "deepseek",
      status: "ready",
      balances: [{ currency: "CNY", total: "12.30", granted: "2.30", toppedUp: "10.00" }],
      fetchedAt: "2026-08-30T00:00:00.000Z",
      stale: false,
    },
    expected: [["¥12.30"]],
    icon: "deepseek",
    visibleLabel: "balance",
  }]

  for (const { provider, state, expected, icon, visibleLabel } of cases) {
    const hookStates = [provider, state, false]
    let definition
    const React = {
      Fragment: Symbol("Fragment"),
      createElement(type, props, ...children) { return { type, props, children } },
      useCallback(callback) { return callback },
      useEffect() {},
      useState(initial) {
        const value = hookStates.length === 0 ? initial : hookStates.shift()
        return [value, () => {}]
      },
    }
    vm.runInNewContext(source, {
      window: { __ModuleLoader__: { load(value) { definition = value } } },
      document: {
        head: { append() {} },
        createElement: () => ({ dataset: {}, remove() {}, textContent: "" }),
        querySelector: () => null,
      },
    })
    const plugin = definition.factory(() => React)
    const registrations = []
    plugin.apply({
      connection: { rpc: { call() {} } },
      effect(callback) { callback() },
      locale: { register() {}, bind: () => (key) => key },
      slots: {
        inject(_name, callback) { callback() },
        register(options, component) { registrations.push({ options, component }) },
      },
      sessions: { list: { getSnapshot: () => ({ current: undefined }), subscribe: () => () => {} } },
      modelDirectories: { directoryFor: () => { throw new Error("no active session") } },
    })

    const sidebar = registrations.find(({ options }) => options.name === "sidebar.footer.action")
    const tree = sidebar.component({ wide: true, ...sidebar.options.inject() })
    const icons = findElements(tree, "svg")
    assert.equal(icons.length, 1, `${provider} must render one provider icon`)
    assert.equal(icons[0].props["data-provider-icon"], icon)
    const copy = findElementsByClass(tree, "dsh-deepseek-account-copy")
    assert.equal(copy.length, 1)
    assert.doesNotMatch(textContent(copy[0]), new RegExp(visibleLabel), `${provider} must not repeat its identity beside the icon`)
    assert.match(tree.props["aria-label"], new RegExp(visibleLabel), `${provider} must retain an accessible label`)
    const lines = provider === "codex"
      ? findElementsByClass(tree, "dsh-deepseek-account-quota-window").map(textContent)
      : findElements(tree, "small").map(textContent)
    assert.equal(lines.length, expected.length, `${provider} must render every quota line separately`)
    expected.forEach((parts, index) => parts.forEach((part) => assert.match(lines[index], new RegExp(part))))
    if (provider === "codex") {
      assert.equal(findElementsByClass(tree, "dsh-deepseek-account-quota-period").length, 2)
      assert.equal(findElementsByClass(tree, "dsh-deepseek-account-quota-remaining").length, 2)
      assert.equal(findElementsByClass(tree, "dsh-deepseek-account-quota-reset").length, 2)
    }
  }
})

test("refreshes once when the current conversation finishes", async () => {
  let definition
  const source = await fs.readFile(path.join(root, "client.js"), "utf8")
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load(value) { definition = value } } },
    document: {
      head: { append() {} },
      createElement: () => ({ dataset: {}, remove() {}, textContent: "" }),
      querySelector: () => null,
    },
  })
  const plugin = definition.factory(() => ({ createElement() {}, Fragment: Symbol("Fragment") }))
  let snapshot = {
    current: "session-a",
    byId: { "session-a": { running: false } },
  }
  const listeners = new Set()
  const list = {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  }
  const refreshes = []
  const stop = plugin.subscribeCurrentConversationCompletion(list, (sessionId) => refreshes.push(sessionId))
  const publish = (next) => {
    snapshot = next
    for (const listener of listeners) listener()
  }

  publish({ current: "session-a", byId: { "session-a": { running: false } } })
  publish({ current: "session-a", byId: { "session-a": { running: true } } })
  publish({ current: "session-a", byId: { "session-a": { running: true } } })
  publish({ current: "session-a", byId: { "session-a": { running: false } } })
  publish({ current: "session-a", byId: { "session-a": { running: false } } })
  assert.deepEqual(refreshes, ["session-a"])

  publish({ current: "session-b", byId: { "session-b": { running: false } } })
  publish({ current: "session-b", byId: { "session-b": { running: true } } })
  publish({ current: "session-b", byId: { "session-b": { running: false } } })
  assert.deepEqual(refreshes, ["session-a", "session-b"])

  stop()
  publish({ current: "session-b", byId: { "session-b": { running: true } } })
  publish({ current: "session-b", byId: { "session-b": { running: false } } })
  assert.deepEqual(refreshes, ["session-a", "session-b"])
})

test("replaces only the DeepSeek account settings gear and restores it on cleanup", async () => {
  let definition
  let observer
  const source = await fs.readFile(path.join(root, "client.js"), "utf8")
  const created = []
  const document = {
    createElementNS(_namespace, tagName) {
      const element = fakeElement(tagName)
      created.push(element)
      return element
    },
    body: undefined,
    head: { append() {} },
    createElement: () => ({ dataset: {}, remove() {}, textContent: "" }),
    querySelector: () => null,
  }
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load(value) { definition = value } } },
    document,
    MutationObserver: class {
      constructor(callback) { this.callback = callback; observer = this }
      observe() {}
      disconnect() { this.disconnected = true }
    },
  })
  const plugin = definition.factory(() => ({ createElement() {}, Fragment: Symbol("Fragment") }))
  const deepseek = fakeNavButton("DeepSeek 账户")
  const unrelated = fakeNavButton("通用设置")
  document.body = {
    querySelectorAll(selector) { return selector === "button" ? [deepseek.button, unrelated.button] : [] },
  }

  const cleanup = plugin.installSettingsNavIcon()
  assert.equal(deepseek.original.hidden, true)
  assert.equal(deepseek.original.style.getPropertyValue("display"), "none")
  assert.equal(deepseek.original.style.getPropertyPriority("display"), "important")
  assert.equal(deepseek.button.inserted.dataset.dshDeepseekAccountNavIcon, "")
  assert.equal(unrelated.original.hidden, false, "an unrelated settings row must retain its icon")
  assert.equal(unrelated.button.inserted, undefined)
  assert.equal(created.filter(({ tagName }) => tagName === "svg").length, 1)
  assert.equal(created.filter(({ tagName }) => tagName === "path").length, 1)
  observer.callback()
  assert.equal(created.filter(({ tagName }) => tagName === "svg").length, 1, "a repeated scan must not add another icon")

  const replacement = deepseek.replaceOriginal()
  observer.callback()
  assert.equal(replacement.hidden, true, "a host re-render must not restore the gear")
  assert.equal(replacement.style.getPropertyValue("display"), "none")
  assert.equal(replacement.style.getPropertyPriority("display"), "important")
  assert.equal(created.filter(({ tagName }) => tagName === "svg").length, 1, "a host re-render must retain one whale icon")

  cleanup()
  assert.equal(observer.disconnected, true)
  assert.equal(deepseek.original.hidden, false)
  assert.equal(deepseek.original.style.getPropertyValue("display"), "")
  assert.equal(replacement.hidden, false)
  assert.equal(replacement.style.getPropertyValue("display"), "")
  assert.equal(deepseek.button.inserted, undefined)
})

test("keeps the sidebar mounted while a provider switch still holds the previous ready state", async () => {
  const source = await fs.readFile(path.join(root, "client.js"), "utf8")

  for (const provider of ["deepseek", "codex"]) {
    const hookStates = [
      provider,
      { provider: "grok", status: "ready", periodKind: "weekly", resetsAt: "2026-09-01T00:00:00.000Z" },
      false,
    ]
    let definition
    const React = {
      Fragment: Symbol("Fragment"),
      createElement(type, props, ...children) { return { type, props, children } },
      useCallback(callback) { return callback },
      useEffect() {},
      useState(initial) {
        const value = hookStates.length === 0 ? initial : hookStates.shift()
        return [value, () => {}]
      },
    }
    vm.runInNewContext(source, {
      window: { __ModuleLoader__: { load(value) { definition = value } } },
      document: {
        head: { append() {} },
        createElement: () => ({ dataset: {}, remove() {}, textContent: "" }),
        querySelector: () => null,
      },
    })
    const plugin = definition.factory(() => React)
    const registrations = []
    plugin.apply({
      connection: { rpc: { call() {} } },
      effect(callback) { callback() },
      locale: { register() {}, bind: () => (key) => key },
      slots: {
        inject(_name, callback) { callback() },
        register(options, component) { registrations.push({ options, component }) },
      },
      sessions: { list: { getSnapshot: () => ({ current: undefined }), subscribe: () => () => {} } },
      modelDirectories: { directoryFor: () => { throw new Error("no active session") } },
    })

    const sidebar = registrations.find(({ options }) => options.name === "sidebar.footer.action")
    assert.doesNotThrow(
      () => sidebar.component({ wide: true, ...sidebar.options.inject() }),
      `switching from Grok to ${provider} must not unmount the sidebar`,
    )
  }
})

function findElements(node, type) {
  if (node === null || node === undefined || typeof node !== "object") return []
  const own = node.type === type ? [node] : []
  return own.concat((node.children ?? []).flatMap((child) => findElements(child, type)))
}

function findElementsByClass(node, className) {
  if (node === null || node === undefined || typeof node !== "object") return []
  const classes = typeof node.props?.className === "string" ? node.props.className.split(/\s+/u) : []
  const own = classes.includes(className) ? [node] : []
  return own.concat((node.children ?? []).flatMap((child) => findElementsByClass(child, className)))
}

function textContent(node) {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  return (node.children ?? []).map(textContent).join("")
}

function fakeElement(tagName) {
  const styles = new Map()
  return {
    tagName,
    dataset: {},
    hidden: false,
    attributes: {},
    children: [],
    style: {
      getPropertyValue(name) { return styles.get(name)?.value ?? "" },
      getPropertyPriority(name) { return styles.get(name)?.priority ?? "" },
      setProperty(name, value, priority = "") { styles.set(name, { value, priority }) },
      removeProperty(name) { styles.delete(name) },
    },
    setAttribute(name, value) { this.attributes[name] = value },
    removeAttribute(name) { delete this.attributes[name] },
    append(...children) { this.children.push(...children) },
    after() {},
    remove() {
      if (this.dataset.dshDeepseekAccountNavIcon !== undefined) this.removed = true
    },
  }
}

function fakeNavButton(label) {
  const original = fakeElement("svg")
  let currentOriginal = original
  const button = {
    inserted: undefined,
    isConnected: true,
    querySelector(selector) {
      if (selector === "[data-dsh-deepseek-account-nav-icon]") return this.inserted
      if (selector === "svg" || selector === "svg:not([data-dsh-deepseek-account-nav-icon])") return currentOriginal
      return undefined
    },
    querySelectorAll(selector) {
      return selector === "span" ? [{ textContent: label }] : []
    },
  }
  original.after = (element) => {
    button.inserted = element
    element.remove = () => { button.inserted = undefined }
  }
  return {
    button,
    original,
    replaceOriginal() {
      currentOriginal = fakeElement("svg")
      currentOriginal.after = original.after
      return currentOriginal
    },
  }
}
