import { Hono, Context } from 'hono'
import { createFactory } from 'hono/factory'
import { Session, sessionMiddleware } from 'hono-sessions'
import { BunSqliteStore } from 'hono-sessions/bun-sqlite-store'
import { Database } from 'bun:sqlite'

const db = new Database('file:/var/lib/wwsc/timesheets-sessions.db')
const store = new BunSqliteStore(db)

export type WithSession = {
  Variables: {
    session: Session
    session_key_rotation: boolean
  }
}

const factory = createFactory<WithSession>()

const protectedPage = factory.createMiddleware(async (c, next) => {
  let session = c.get('session')
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  let user = session.get('user')
  if (!user) {
    console.error('unauthorized')
    return c.redirect('/')
  }

  await next()
})

export {
  Hono,
  type Session,
  type Context,
  sessionMiddleware,
  store,
  factory,
  protectedPage,
}
