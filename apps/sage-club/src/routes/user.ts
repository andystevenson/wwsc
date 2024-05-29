import { getUser, refreshToken, Token } from '@wwsc/lib-sage'

import { Hono, type WithSession } from '../Hono'

const user = new Hono<WithSession>()

user.get('/', async (c) => {
  const session = c.get('session')
  let token = session.get('token') as Token
  if (!token) return c.redirect('/')

  const user = await getUser(token.access_token)
  session.set('user', user)
  console.log('user', user)

  // update the refresh token each time a user request is made
  token = await refreshToken(token)
  session.set('token', token)

  return c.json(user)
})

export default user
