import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import vm from "node:vm"

const root = path.resolve(import.meta.dirname, "..")

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
  assert.equal(plugin.accountProvider("grok"), "grok")
  assert.equal(plugin.accountProvider("dsh-codex"), "codex")
  assert.equal(plugin.accountProvider("deepseek"), "deepseek")
  assert.equal(plugin.accountProvider("my-custom-provider"), "deepseek")

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
