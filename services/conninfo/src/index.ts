import { Hono } from 'hono'
import { getConnInfo } from 'hono/bun'
const app = new Hono()

app.get('/', (c) => {
  const info = getConnInfo(c) // info is `ConnInfo`
  return c.json(info)
})

const port = 7654
const server = Bun.serve({ port, fetch: app.fetch })
