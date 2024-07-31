import { sessionMiddleware, store, factory, protectedPage } from './Hono'
import { HTTPException } from 'hono/http-exception'
import { serveStatic } from 'hono/bun'
import { ipRestriction } from 'hono/ip-restriction'
import { getConnInfo } from 'hono/bun'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'
import home from './pages/home'
import user from './pages/user'
import auth from './routes/auth'
import shift from './routes/shift'
import history from './routes/history'
import { autoClockout } from './db/functions/autoClockout'

const app = factory.createApp()

app.use(cors())
app.use(trimTrailingSlash())
app.use('/*', serveStatic({ root: './src/public' }))
app.use(
  '*',
  ipRestriction(getConnInfo, {
    denyList: [],
    allowList: ['127.0.0.1', '::1'],
  }),
)

app.use(
  '*',
  sessionMiddleware({
    store,
    encryptionKey: process.env.TIMESHEET_SESSION_KEY,
    // expireAfterSeconds: 60 * 60 * 24 * 7,
    cookieOptions: {
      sameSite: 'Lax',
      path: '/',
      httpOnly: true,
    },
  }),
)

app.use('/user', protectedPage)

app.route('/', home)
app.route('/user', user)
app.route('/auth', auth)
app.route('/shift', shift)
app.route('/history', history)

// app.onError(() => {
//   // if (err instanceof HTTPException) {
//   //   // Get the custom response
//   //   return err.getResponse()
//   // }
//   //...
// })

await autoClockout()
export default app
