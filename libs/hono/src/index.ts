import { Context } from 'hono'

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

export { conninfo }