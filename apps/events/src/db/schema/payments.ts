import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const payments = sqliteTable('payments', {
  id: text('id')
    .primaryKey()
    .$default(() => `payments_${nanoid()}`),
  towards: text('towards', { enum: ['roomhire', 'food'] }).notNull(),
  date: text('date').notNull(),
  amount: real('food').default(0),
  method: text('method', { enum: ['cash', 'card', 'bacs'] }).default('cash'),
  type: text('type', { enum: ['deposit', 'balance', 'part', 'full'] }).default(
    'full',
  ),
  notes: text('notes').default(''),
  ref: text('ref'), // reference id in sumup or stripe
})

export type Pricing = typeof payments.$inferInsert
export type SelectPricing = typeof payments.$inferSelect
export type UpdatePricing = Omit<Pricing, 'id'>
