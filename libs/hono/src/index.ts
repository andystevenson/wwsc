import { Hono, Context } from 'hono'
import { Page, Meta, type Tags } from './Page'

function conninfo(app: string) {
  return function (c: Context) {
    let forwarded = c.req.header('x-forwarded-for')
    let host = c.req.header('x-forwarded-host')
    let proto = c.req.header('x-forwarded-proto')
    console.log('conninfo', { forwarded, host, proto })
    if (!forwarded || !host || !proto || !host.startsWith(`${app}.`)) {
      return ''
    }

    return forwarded
  }
}

export { Hono, type Context, Page, Meta, type Tags, conninfo }
