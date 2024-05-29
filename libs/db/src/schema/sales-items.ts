import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core'
import { sales } from './sales'
import type { RegisterName } from '@wwsc/lib-sumup-pos'

export const salesItems = sqliteTable('salesItems', {
  id: text('id').primaryKey().notNull(),
  sales_id: text('sales_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  register: text('register').$type<RegisterName>().notNull(),
  staff: text('staff').notNull(),
  product: text('product').notNull(),
  category: text('category').notNull(),
  parent_category: text('parent_category').notNull(),
  quantity: real('quantity').notNull(),
  unit_price: real('unit_price').notNull(),
  item_notes: text('item_notes').notNull(),
  created_at: text('created_at').$type<Date>().notNull(),
  updated_at: text('updated_at').$type<Date>().notNull(),
  gross: real('gross').notNull(),
  discount: real('discount').notNull(),
  total: real('total').notNull(),
  vat: real('vat').notNull(),
  net: real('net').notNull(),
  cash: real('cash').notNull(),
  sumup: real('sumup').notNull(),
  card: real('card').notNull(),
  voucher: real('voucher').notNull(),
})

export type InsertSalesItem = typeof salesItems.$inferInsert
export type SelectSalesItem = typeof salesItems.$inferSelect
