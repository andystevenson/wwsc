import app from './hono/hono'
import env from './utilities/env'

Bun.serve({
  port: env.WWSC_WEBHOOKS_PORT,
  fetch: app.fetch
})
