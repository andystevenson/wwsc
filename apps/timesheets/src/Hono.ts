import { Hono } from 'hono'
import { createFactory } from 'hono/factory'
import { Session, sessionMiddleware } from 'hono-sessions'
import { BunSqliteStore } from 'hono-sessions/bun-sqlite-store'
import { Database } from 'bun:sqlite'
import { refreshToken, getUser, type User, type Token } from '@wwsc/lib-sage'

const db = new Database('./db.sqlite')
const store = new BunSqliteStore(db)

export type WithSession = {
  Variables: {
    session: Session
    session_key_rotation: boolean
    token: Token
    access_token: string
    user: User
  }
}

const factory = createFactory<WithSession>()

/**
 * refresh, is used to ensure there is always an up-to-date valid token before each call to a
 * sage api endpoint.
 */
const refresh = factory.createMiddleware(async (c, next) => {
  console.log('refresh')
  const session = c.get('session')
  let token = session.get('token') as Token
  if (!token) return c.redirect('/')

  // update the refresh token each time a user request is made
  token = (await refreshToken(token)) as Token
  session.set('token', token)
  c.set('token', token)
  c.set('access_token', token.access_token)
  const user = await getUser(token.access_token)
  session.set('user', user)
  c.set('user', user)
  await next()
})

export { Hono, Session, sessionMiddleware, store, factory, refresh }
