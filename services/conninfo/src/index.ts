import { Hono } from 'hono'
import { getConnInfo } from 'hono/bun'
import { ipRestriction } from 'hono/ip-restriction'
import { conninfo } from '@wwsc/lib-hono'
const app = new Hono()

let whitelist = JSON.parse(process.env.WHITELISTED_IPS || '[]')

app.use(
  '*',
  ipRestriction(conninfo('conninfo'), {
    denyList: [],
    allowList: whitelist,
  }),
)
app.get('/', (c) => {
  let raw = c.req.raw.headers
  const conninfo = getConnInfo(c) // info is `ConnInfo`
  return c.json({ raw, conninfo })
})

const port = process.env.CONNINFO_PORT
if (!port) {
  console.error('CONNINFO_PORT not set')
  process.exit(1)
}

console.log(`conninfo on port ${port}`)
const server = Bun.serve({ port, fetch: app.fetch })

function requestIP() {
  return
}
