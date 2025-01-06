import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const sessions = sqliteTable('sessions', {
  id: text().primaryKey(),
  user: text()
    .notNull()
    .references(() => users.email),
  expires: integer({ mode: 'timestamp' }).notNull()
})

export type Session = typeof sessions.$inferSelect
