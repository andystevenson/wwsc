import { Hono } from 'hono'
import { conninfo } from '@wwsc/lib-hono'
import { serveStatic } from 'hono/bun'
import { ipRestriction } from 'hono/ip-restriction'
import { csrf } from 'hono/csrf'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'
import home from './pages/home'
import closures from './routes/closures'

const app = new Hono()

app.use(cors())
app.use(csrf())
app.use(trimTrailingSlash())
app.use('/*', serveStatic({ root: './src/public' }))

let whitelist = JSON.parse(process.env.WHITELISTED_IPS || '[]')

app.use(
  '*',
  ipRestriction(conninfo('closures'), {
    denyList: [],
    allowList: whitelist,
  }),
)

app.route('/', home)
app.route('/closures', closures)

export default app
