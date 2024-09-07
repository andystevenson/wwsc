import { sessionMiddleware, factory, protectedPage } from './hono-factory'
import { serveStatic } from 'hono/bun'
import { ipRestriction } from 'hono/ip-restriction'
import { csrf } from 'hono/csrf'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'
import home from './pages/home'
import views from './routes/views'
import { conninfo } from '@wwsc/lib-hono'

const app = factory.createApp()

app.use(cors())
app.use(csrf())
app.use(trimTrailingSlash())
app.use('/*', serveStatic({ root: './src/public' }))

let whitelist = JSON.parse(process.env.WHITELISTED_IPS || '[]')

app.use(
  '*',
  ipRestriction(conninfo('events'), {
    denyList: [],
    allowList: whitelist,
  }),
)
app.use('*', sessionMiddleware)

app.route('/', home)
app.route('/views', views)

export default app
