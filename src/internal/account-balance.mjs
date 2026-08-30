const AUTOMATIC_TTL_MS = 5 * 60 * 1000
const MANUAL_TTL_MS = 30 * 1000
const MAX_RESPONSE_BYTES = 32 * 1024
const API_URL = "https://api.deepseek.com/user/balance"

export function createDeepSeekAccountBalance({ credentials, fetchImpl = fetch, now = Date.now }) {
  if (typeof credentials?.resolve !== "function" || typeof fetchImpl !== "function" || typeof now !== "function") {
    throw new TypeError("Invalid DeepSeek account balance dependencies")
  }
  let lastGood
  let attemptedAt = 0
  let inFlight

  return Object.freeze({
    read({ force = false } = {}) {
      const ttl = force ? MANUAL_TTL_MS : AUTOMATIC_TTL_MS
      if (lastGood !== undefined && now() - attemptedAt < ttl) return Promise.resolve(lastGood)
      if (inFlight !== undefined) return inFlight
      attemptedAt = now()
      inFlight = load().finally(() => { inFlight = undefined })
      return inFlight
    },
  })

  async function load() {
    const credential = await credentials.resolve("DEEPSEEK_API_KEY")
    if (credential === undefined) return unavailable("credential-unconfigured")
    try {
      const response = await fetchImpl(API_URL, {
        method: "GET",
        redirect: "error",
        headers: { accept: "application/json", authorization: `Bearer ${credential.value}` },
        signal: AbortSignal.timeout(5_000),
      })
      if (response.status === 401 || response.status === 403) return unavailable("credential-unauthorized")
      if (response.status === 429) return unavailable("rate-limited")
      if (!response.ok) return unavailable(response.status >= 500 ? "network" : "invalid-response")
      const parsed = parseDeepSeekBalance(JSON.parse(await readBoundedBody(response)), new Date(now()).toISOString())
      if (parsed === undefined) return unavailable("invalid-response")
      lastGood = parsed
      return parsed
    } catch {
      return unavailable("network")
    }
  }

  function unavailable(reason) {
    return lastGood === undefined
      ? Object.freeze({ status: "unavailable", reason })
      : Object.freeze({ status: "unavailable", reason, lastGood: Object.freeze({ ...lastGood, stale: true }) })
  }
}

export function parseDeepSeekBalance(value, fetchedAt) {
  if (!isRecord(value) || typeof value.is_available !== "boolean" || !Array.isArray(value.balance_infos) || value.balance_infos.length > 2) return undefined
  const balances = []
  const currencies = new Set()
  for (const item of value.balance_infos) {
    if (!isRecord(item) || (item.currency !== "CNY" && item.currency !== "USD") || currencies.has(item.currency)) return undefined
    const parts = [item.total_balance, item.granted_balance, item.topped_up_balance]
    if (!parts.every(validDecimal)) return undefined
    currencies.add(item.currency)
    balances.push(Object.freeze({
      currency: item.currency,
      total: item.total_balance,
      granted: item.granted_balance,
      toppedUp: item.topped_up_balance,
    }))
  }
  if (typeof fetchedAt !== "string" || !Number.isFinite(Date.parse(fetchedAt))) return undefined
  return Object.freeze({
    status: "ready",
    isAvailable: value.is_available,
    balances: Object.freeze(balances),
    fetchedAt,
    stale: false,
  })
}

async function readBoundedBody(response) {
  const declared = Number(response.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) throw new Error("response too large")
  const reader = response.body?.getReader()
  if (reader === undefined) return ""
  const decoder = new TextDecoder()
  let length = 0
  let body = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > MAX_RESPONSE_BYTES) {
      await reader.cancel()
      throw new Error("response too large")
    }
    body += decoder.decode(value, { stream: true })
  }
  return body + decoder.decode()
}

function validDecimal(value) {
  return typeof value === "string" && value.length <= 64 && /^\d+(?:\.\d+)?$/u.test(value)
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
