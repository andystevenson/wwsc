import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const shifts = sqliteTable('shifts', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  uid: text('uid').notNull(),
  username: text('username').notNull(),
  day: text('day').notNull(),
  start: text('start').notNull(),
  end: text('end'),
  duration: text('duration'),
  nobreaks: integer('nobreaks', { mode: 'boolean' }).default(false).notNull(),
  supervisor: integer('supervisor', { mode: 'boolean' })
    .default(false)
    .notNull(),
  notes: text('notes').default(''),
  approved: integer('approved', { mode: 'boolean' }).default(false).notNull(),
  by: text('by'),
  clockedout: text('clockedout', { enum: ['no', 'user', 'auto', 'superuser'] })
    .default('no')
    .notNull(),
})

export type InsertShift = typeof shifts.$inferInsert
export type SelectShift = typeof shifts.$inferSelect
export type UpdateShift = Omit<InsertShift, 'id'>
