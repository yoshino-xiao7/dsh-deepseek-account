import { createDeepSeekAccountBalance } from "../internal/account-balance.mjs"
import { registerDeepSeekAccountRpc } from "../internal/account-rpc.mjs"

export const name = "deepseek-account"
export const inject = ["credentials"]

export function apply(ctx) {
  const accountBalance = createDeepSeekAccountBalance({ credentials: ctx.credentials })
  // Connection can become ready before its HTTP carrier in newer Harness versions.
  // Own the route in both services' lifetime so server reloads register it again.
  ctx.inject(["connection", "webServer"], (connectionCtx) => {
    // Connection already owns the registration effect in this injection fiber.
    registerDeepSeekAccountRpc(connectionCtx, accountBalance)
  })
}
