import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import type { RegisterName } from '@wwsc/lib-sumup-pos'

export const sales = sqliteTable('sales', {
  id: text('id').primaryKey().notNull(),
  register: text('register').$type<RegisterName>().notNull(),
  staff: text('staff').notNull(),
  time: text('time').$type<Date>().notNull(),
  total_before_discount: real('total_before_discount').notNull(),
  discount: real('discount').notNull(),
  total: real('total').notNull(),
  vat: real('vat').notNull(),
  net: real('net').notNull(),
  fees: real('fees').notNull(),
  refunds: real('refunds').notNull(),
  payments_mismatch: real('payments_mismatch').notNull(),
})

export type InsertSale = typeof sales.$inferInsert
export type SelectSale = typeof sales.$inferSelect
