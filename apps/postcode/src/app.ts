import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { trimTrailingSlash } from 'hono/trailing-slash'

const app = new Hono()

app.use(logger())
app.use(cors())
app.use(trimTrailingSlash())
app.use(prettyJSON())

app.get('/', (c) => c.json({ hello: 'world' }))
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

export default app
