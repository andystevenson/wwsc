import { Lucia, type User, type Session } from 'lucia'
import { BunSQLiteAdapter } from '@lucia-auth/adapter-sqlite'
import { Database } from 'bun:sqlite'
import { Staff } from '@wwsc/lib-sumup-pos'

const db = new Database(':memory:')

db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL
)`)

db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`)

const adapter = new BunSQLiteAdapter(db, {
  user: 'user',
  session: 'session',
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: Staff
  }
}

const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'session',
    expires: false, // session cookies have very long lifespan (2 years)
    attributes: {
      secure: true,
      sameSite: 'lax',
    },
  },
  getUserAttributes: (attributes) => {
    return attributes
  },
  getSessionAttributes: (attributes) => {
    return attributes
  },
})

function addSessionUser(user: Staff) {
  let statement = `
    INSERT INTO user (id, username) VALUES (?, ?)
      ON CONFLICT(id) DO NOTHING`
  db.prepare(statement).run(user.id, user.display_name)
}

export { db, lucia, addSessionUser, type User, type Session }
