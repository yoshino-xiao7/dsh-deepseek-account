import assert from "node:assert/strict"
import test from "node:test"

import { DEEPSEEK_ACCOUNT_RPC_CHANNEL, registerDeepSeekAccountRpc } from "../src/internal/account-rpc.mjs"

test("registers a loopback-only bounded balance reader", async () => {
  let registration
  registerDeepSeekAccountRpc({ connection: { rpc: { handle: (...args) => { registration = args } } } }, {
    read: async ({ force }) => ({ status: "ready", force }),
  })
  assert.equal(registration[0], DEEPSEEK_ACCOUNT_RPC_CHANNEL)
  assert.deepEqual(registration[2], { authority: "loopback" })
  await assert.doesNotReject(async () => {
    assert.deepEqual(await registration[1]("read", { force: true }), {
      ok: true,
      value: { status: "ready", force: true },
    })
  })
  assert.deepEqual(await registration[1]("read", { force: "yes" }), { ok: false, error: "invalid-request" })
})
