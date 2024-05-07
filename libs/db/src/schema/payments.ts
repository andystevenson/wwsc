import { sqliteTable, real, text } from 'drizzle-orm/sqlite-core'
import { sales } from './sales'
import type { PaymentMethod, CardBrand, EntryMode } from '@wwsc/sumup-pos'

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey().notNull(),
  sales_id: text('sales_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  method: text('method').$type<PaymentMethod>().notNull(),
  time: text('time').$type<Date>().notNull(),
  amount: real('amount').notNull(),
  fees: real('fees').notNull(),
  card: text('card').$type<CardBrand>(),
  entry: text('entry').$type<EntryMode>().notNull(),
  transaction_code: text('transaction_code').notNull(),
})

export type InsertPayment = typeof payments.$inferInsert
export type SelectPayment = typeof payments.$inferSelect
