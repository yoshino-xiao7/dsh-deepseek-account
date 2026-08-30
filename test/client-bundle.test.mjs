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

test("projects only Grok and Codex reset windows from their existing optional RPC results", async () => {
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
    resetsAt: "2026-09-01T00:00:00.000Z",
  })
  assert.equal("remainingPercent" in grok, false)

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
      { kind: "five-hour", resetsAt: Date.parse("2026-08-30T05:00:00.000Z") },
      { kind: "weekly", resetsAt: Date.parse("2026-09-06T00:00:00.000Z") },
    ],
  })
  assert.equal(JSON.stringify(codex).includes("usedPercent"), false)
})
