import { sqliteTable, real, text } from 'drizzle-orm/sqlite-core'
import type { DayOfWeek } from '@wwsc/lib-sumup-pos'

export const salesCategories = sqliteTable('salesCategories', {
  id: text('id').primaryKey().notNull(),
  day: text('day').$type<DayOfWeek>().notNull(),
  date: text('date').notNull(),
  scope: text('scope').notNull(),
  name: text('name').notNull(),
  quantity: real('quantity').notNull(),
  gross: real('gross').notNull(),
  discount: real('discount').notNull(),
  total: real('total').notNull(),
  vat: real('vat').notNull(),
  net: real('net').notNull(),
  cash: real('cash').notNull(),
  sumup: real('sumup').notNull(),
  card: real('card').notNull(),
  voucher: real('voucher').notNull(),
  fees: real('fees').notNull(),
})

export type InsertSalesCategory = typeof salesCategories.$inferInsert
export type SelectSalesCategory = typeof salesCategories.$inferSelect
