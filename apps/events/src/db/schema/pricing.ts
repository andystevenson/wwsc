import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const pricing = sqliteTable('pricing', {
  id: text('id')
    .primaryKey()
    .$default(() => `pricing_${nanoid()}`),
  roomhire: real('roomhire').default(0),
  food: real('food').default(0),
  notes: text('notes').default(''),
})

export type Pricing = typeof pricing.$inferInsert
export type SelectPricing = typeof pricing.$inferSelect
export type UpdatePricing = Omit<Pricing, 'id'>
