import os from 'node:os'
import { factory, protectedPage, sessionMiddleware } from './hono-factory'
import { HTTPException } from 'hono/http-exception'
import { serveStatic } from 'hono/bun'
import { ipRestriction } from 'hono/ip-restriction'
import { csrf } from 'hono/csrf'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'
import home from './pages/home'
import user from './pages/user'
import upload from './pages/upload'
import uploadHolidays from './pages/upload-holidays'
import auth from './routes/auth'
import shift from './routes/shift'
import history from './routes/history'
import reports from './routes/reports'
import holidays from './routes/holidays'
import { autoClockout } from './db/functions/autoClockout'
import { conninfo } from '@wwsc/lib-hono'

const app = factory.createApp()

app.use(cors())
app.use(csrf())
app.use(trimTrailingSlash())
app.use('/*', serveStatic({ root: './src/public' }))

let hostname = os.hostname()

if (hostname !== 'ajs.local') {
  // ignore localhost
  let whitelist = JSON.parse(process.env.WHITELISTED_IPS || '[]')

  app.use(
    '*',
    ipRestriction(conninfo('timesheets'), {
      denyList: [],
      allowList: whitelist
    })
  )
}

app.use('*', sessionMiddleware)

app.use('/user', protectedPage)
app.use('/upload', protectedPage)
app.use('/upload-holidays', protectedPage)

app.route('/', home)
app.route('/user', user)
app.route('/upload', upload)
app.route('/upload-holidays', uploadHolidays)
app.route('/auth', auth)
app.route('/shift', shift)
app.route('/history', history)
app.route('/reports', reports)
app.route('/holidays', holidays)

// app.onError(() => {
//   // if (err instanceof HTTPException) {
//   //   // Get the custom response
//   //   return err.getResponse()
//   // }
//   //...
// })

await autoClockout()
export default app
