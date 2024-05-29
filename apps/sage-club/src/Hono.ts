import { Hono } from 'hono'

import { Session, sessionMiddleware, CookieStore } from 'hono-sessions'
import { BunSqliteStore } from 'hono-sessions/bun-sqlite-store'
import { Database } from 'bun:sqlite'

const db = new Database('./db.sqlite')
const store = new BunSqliteStore(db)

export type WithSession = {
  Variables: {
    session: Session
    session_key_rotation: boolean
  }
}

export { Hono, Session, sessionMiddleware, CookieStore, store }
