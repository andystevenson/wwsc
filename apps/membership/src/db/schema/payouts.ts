import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const PayoutStatus = [
  'paid',
  'pending',
  'in_transit',
  'canceled',
  'failed'
] as const

export type PayoutStatus = (typeof PayoutStatus)[number]

export const payouts = sqliteTable('payouts', {
  id: text().primaryKey().notNull(), // payout id
  date: text().notNull(),
  amount: real().notNull(),
  status: text({ enum: PayoutStatus }).default('paid')
})

export type InsertPayout = typeof payouts.$inferInsert
export type Payout = typeof payouts.$inferSelect
export type UpdatePayout = Omit<InsertPayout, 'id'>

export const insertPayoutSchema = createInsertSchema(payouts)
export const selectPayoutSchema = createSelectSchema(payouts)
export const updatePayoutSchema = createInsertSchema(payouts)
