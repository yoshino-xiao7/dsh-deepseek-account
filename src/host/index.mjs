import { createDeepSeekAccountBalance } from "../internal/account-balance.mjs"
import { registerDeepSeekAccountRpc } from "../internal/account-rpc.mjs"

export const name = "deepseek-account"
export const inject = ["credentials"]

export function apply(ctx) {
  const accountBalance = createDeepSeekAccountBalance({ credentials: ctx.credentials })
  ctx.inject(["connection"], (connectionCtx) => registerDeepSeekAccountRpc(connectionCtx, accountBalance))
}
