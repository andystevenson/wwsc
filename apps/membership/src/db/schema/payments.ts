import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { members } from './members'

export const PaymentStatuses = [
  'draft',
  'open',
  'paid',
  'uncollectible',
  'void'
] as const

export const CollectionMethods = [
  'charge_automatically',
  'send_invoice'
] as const

export type CollectionMethod = (typeof CollectionMethods)[number]

export type PaymentStatus = (typeof PaymentStatuses)[number]

export const payments = sqliteTable('payments', {
  id: text().primaryKey().notNull(), // invoice id
  date: text(),
  amount: real().notNull(),
  status: text({ enum: PaymentStatuses }).default('open'),
  type: text().default('card'),
  collection: text({ enum: CollectionMethods }).default('charge_automatically'),
  name: text(),
  email: text(),
  phone: text(),
  url: text(), // stripe invoice url
  pdf: text(), // stripe invoice pdf
  receipt: text(), // stripe receipt url
  refunded: real().default(0),
  attempts: integer().default(0),
  member: text().references(() => members.id)
})

export type InsertPayment = typeof payments.$inferInsert
export type Payment = typeof payments.$inferSelect
export type UpdatePayment = Omit<InsertPayment, 'id'>

export const insertPaymentSchema = createInsertSchema(payments)
export const selectPaymentSchema = createSelectSchema(payments)
export const updatePaymentSchema = createInsertSchema(payments)
