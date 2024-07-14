import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { people } from './people'

export const emails = sqliteTable('emails', {
  id: integer('id').primaryKey(),
  email: text('title').notNull(),
  context: text('context'),
  person: integer('person')
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
})

export type InsertEmail = typeof emails.$inferInsert
export type SelectEmail = typeof emails.$inferSelect
