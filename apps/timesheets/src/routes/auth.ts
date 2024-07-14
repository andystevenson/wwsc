import env from '../utilities/env'
import { type WithSession, Hono } from '../Hono'
import { getToken } from '@wwsc/lib-sage'

const auth = new Hono<WithSession>()

auth.get('/callback', async (c) => {
  const code = c.req.query('code')

  if (!code) return c.redirect('/')

  const session = c.get('session')
  session.set('callback', c.req.queries())
  let token = await getToken(code)
  session.set('token', token)

  return c.redirect('/')
})

export default auth
