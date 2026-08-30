export const DEEPSEEK_ACCOUNT_RPC_CHANNEL = "/dsh-deepseek-account"

export function registerDeepSeekAccountRpc(ctx, accountBalance) {
  if (typeof ctx?.connection?.rpc?.handle !== "function" || typeof accountBalance?.read !== "function") {
    throw new TypeError("Invalid DeepSeek account RPC dependencies")
  }
  return ctx.connection.rpc.handle(
    DEEPSEEK_ACCOUNT_RPC_CHANNEL,
    async (endpoint, payload) => {
      if (endpoint !== "read" || !isRecord(payload) || Reflect.ownKeys(payload).some((key) => key !== "force")) {
        return { ok: false, error: "invalid-request" }
      }
      if (payload.force !== undefined && typeof payload.force !== "boolean") {
        return { ok: false, error: "invalid-request" }
      }
      return { ok: true, value: await accountBalance.read({ force: payload.force === true }) }
    },
    { authority: "loopback" },
  )
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
