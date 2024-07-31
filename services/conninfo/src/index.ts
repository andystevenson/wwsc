import { Hono } from 'hono'
import { getConnInfo } from 'hono/bun'
const app = new Hono()

app.get('/', (c) => {
  const info = getConnInfo(c) // info is `ConnInfo`
  return c.json(info)
})

const port = process.env.CONNINFO_PORT
if (!port) {
  console.error('CONNINFO_PORT not set')
  process.exit(1)
}

const server = Bun.serve({ port, fetch: app.fetch })
