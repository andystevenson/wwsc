import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'
import type { PaymentMethod } from '@wwsc/lib-sumup-pos'

export const paymentSummaries = sqliteTable('paymentSummaries', {
  id: text('id').primaryKey().notNull(),
  date: text('date').notNull(),
  type: text('type').$type<PaymentMethod>().notNull(),
  count: integer('count').notNull(),
  total_before_discount: real('total_before_discount').notNull(),
  discount: real('discount').notNull(),
  total: real('total').notNull(),
  vat: real('vat').notNull(),
  net: real('net').notNull(),
  fees: real('fees').notNull(),
  refunds: real('refunds').notNull(),
})

export type InsertPaymentSummary = typeof paymentSummaries.$inferInsert
export type SelectPaymentSummary = typeof paymentSummaries.$inferSelect
