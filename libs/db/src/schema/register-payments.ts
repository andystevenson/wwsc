import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { registerClosures } from './register-closures'

export const registerPayments = sqliteTable('register-payments', {
  id: integer('id').primaryKey(),
  closure: text('closure')
    .notNull()
    .references(() => registerClosures.id, { onDelete: 'cascade' }),
  method: text('name').notNull(),
  expected: real('expected').notNull(),
  counted: real('counted').notNull(),
})

export type InsertRegisterPayment = typeof registerPayments.$inferInsert
export type SelectRegisterPayment = typeof registerPayments.$inferSelect
