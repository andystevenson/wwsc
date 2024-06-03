import { type WithSession, Hono, sessionMiddleware, store } from './Hono'
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'

import login from './routes/login'
import logout from './routes/logout'
import auth from './routes/auth'

// sage imports
import user from './routes/user'
import sage from './routes/sage'

import home from './pages/home'
import sales from './pages/sales'

const app = new Hono<WithSession>()

app.use(logger())
app.use(cors())
app.use(trimTrailingSlash())
app.use('/*', serveStatic({ root: './src/public' }))
app.use(
  '*',
  sessionMiddleware({
    store,
    encryptionKey: Bun.env.SAGE_SESSION_ENCRYPTION_KEY,
    expireAfterSeconds: 15 * 60,
    cookieOptions: {
      sameSite: 'Lax',
      path: '/',
      httpOnly: true,
    },
  }),
)

app.route('/', home)
app.route('/sales', sales)
app.route('/login', login)
app.route('/logout', logout)
app.route('/auth', auth)
app.route('/user', user)
app.route('/sage', sage)

export default app
