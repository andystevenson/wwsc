import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

export const registerClosures = sqliteTable('register-closures', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  staff: text('staff').notNull(),
  from: text('from').notNull(),
  to: text('to').notNull(),
  notes: text('notes').notNull(),
  expected: real('expected').notNull(),
  counted: real('counted').notNull(),
  variance: real('variance').notNull(),
})

export type InsertRegisterClosure = typeof registerClosures.$inferInsert
export type SelectRegisterClosure = typeof registerClosures.$inferSelect
