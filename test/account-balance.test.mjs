import assert from "node:assert/strict"
import test from "node:test"

import { createDeepSeekAccountBalance, parseDeepSeekBalance } from "../src/internal/account-balance.mjs"

test("maps the official balance response without losing decimal strings", () => {
  assert.deepEqual(parseDeepSeekBalance({
    is_available: true,
    balance_infos: [{
      currency: "CNY",
      total_balance: "12.30",
      granted_balance: "2.30",
      topped_up_balance: "10.00",
    }],
  }, "2026-08-30T00:00:00.000Z"), {
    status: "ready",
    isAvailable: true,
    balances: [{ currency: "CNY", total: "12.30", granted: "2.30", toppedUp: "10.00" }],
    fetchedAt: "2026-08-30T00:00:00.000Z",
    stale: false,
  })
})

test("coalesces reads and never contacts the API without a credential", async () => {
  const fetchImpl = async () => { throw new Error("unexpected request") }
  const balance = createDeepSeekAccountBalance({
    credentials: { resolve: async () => undefined },
    fetchImpl,
    now: () => Date.parse("2026-08-30T00:00:00.000Z"),
  })
  const [left, right] = await Promise.all([balance.read(), balance.read()])
  assert.deepEqual(left, { status: "unavailable", reason: "credential-unconfigured" })
  assert.deepEqual(right, left)
})

test("keeps decimal balances and returns a stale snapshot after a later network failure", async () => {
  let timestamp = Date.parse("2026-08-30T00:00:00.000Z")
  let requestCount = 0
  const balance = createDeepSeekAccountBalance({
    credentials: { resolve: async () => ({ value: "test-only-key" }) },
    now: () => timestamp,
    fetchImpl: async (url, init) => {
      requestCount += 1
      assert.equal(url, "https://api.deepseek.com/user/balance")
      assert.equal(init.method, "GET")
      if (requestCount > 1) throw new Error("offline")
      return new Response(JSON.stringify({
        is_available: true,
        balance_infos: [{
          currency: "USD",
          total_balance: "4.25",
          granted_balance: "1.00",
          topped_up_balance: "3.25",
        }],
      }), { status: 200, headers: { "content-type": "application/json" } })
    },
  })

  const ready = await balance.read()
  timestamp += 31_000
  assert.deepEqual(await balance.read({ force: true }), {
    status: "unavailable",
    reason: "network",
    lastGood: { ...ready, stale: true },
  })
})
