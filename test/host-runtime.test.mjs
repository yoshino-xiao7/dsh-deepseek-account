import assert from "node:assert/strict"
import path from "node:path"
import { pathToFileURL } from "node:url"
import test from "node:test"

import * as plugin from "../src/host/index.mjs"

// Point at an isolated install or a bundled Harness node_modules directory.
const runtime = process.env.DSH_TEST_NODE_MODULES

test("registers the balance route when the web server starts after Connection", { skip: !runtime }, async () => {
  const load = (name) => import(pathToFileURL(path.join(runtime, "@deepseek-ai", name, "lib/index.js")))
  const { Context } = await load("cordis")
  const { HostConnectionService } = await load("dsh-client-connection")
  const ctx = new Context()
  const routes = new Map()
  ctx.provide("credentials", { resolve: async () => undefined })
  new HostConnectionService(ctx, [], { isAuthenticated: () => true })
  const fiber = ctx.plugin(plugin)
  const settle = async () => {
    await fiber.await()
    // Cordis schedules dependency fiber activation on the next event-loop turn.
    await new Promise((resolve) => setImmediate(resolve))
  }
  let stopServer
  try {
    await settle()
    assert.equal(routes.size, 0)
    const startServer = () => ctx.provide("webServer", {
      register(route) {
        assert.equal(routes.has(route.path), false, "route must have a single owner")
        routes.set(route.path, route)
        return () => { routes.delete(route.path) }
      },
    })
    stopServer = startServer()
    await settle()
    assert.ok(routes.has("/dsh-deepseek-account"), "DeepSeek balance RPC must be available after webServer starts")

    await stopServer()
    await settle()
    assert.equal(routes.size, 0, "stop must remove the old server's route")
    stopServer = startServer()
    await settle()
    assert.ok(routes.has("/dsh-deepseek-account"), "server restart must restore the balance route")
    await fiber.dispose()
    assert.equal(routes.size, 0, "plugin unload must remove its route")
  } finally {
    await fiber.dispose()
    await stopServer?.()
  }
})
