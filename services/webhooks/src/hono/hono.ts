import { createFactory } from 'hono/factory'
import { Hono } from 'hono'
import { conninfo } from '@wwsc/lib-hono'
import { ipRestriction } from 'hono/ip-restriction'
import { csrf } from 'hono/csrf'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares'
import home from '../routes/home'
import resync from '../routes/resync'
import { app } from './factory'
import { logger } from '../middlewares'

app.use(serveEmojiFavicon('🚀'))
app.use(logger())
app.use(cors())
app.use(csrf())
app.use(trimTrailingSlash())

// app.use(
//   '*',
//   ipRestriction(conninfo('resync'), {
//     denyList: [],
//     allowList: whitelist
//   })
// )

app.route('/', home)
app.route('/resync', resync)

app.get('/onerror', async (c) => {
  c.status(422)
  throw new Error('onerror!!!')
})

app.notFound(notFound)
app.onError(onError)

export default app
