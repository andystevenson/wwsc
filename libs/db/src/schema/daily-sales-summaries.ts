import { sqliteTable, real, text } from 'drizzle-orm/sqlite-core'
import type { RegisterName, Scope } from '@wwsc/sumup-pos'
import { DayOfWeek } from '@wwsc/dates'

export const dailySalesSummaries = sqliteTable('dailySalesSummaries', {
  id: text('id').primaryKey().notNull(),
  day: text('day').$type<DayOfWeek>().notNull(),
  date: text('date').$type<Date>().notNull(),
  scope: text('scope').$type<Scope>().notNull(),
  register: text('register').$type<RegisterName>().notNull(),
  quantity: real('quantity').notNull(),
  gross: real('gross').notNull(),
  discount: real('discount').notNull(),
  total: real('total').notNull(),
  vat: real('vat').notNull(),
  net: real('net').notNull(),
  cash: real('cash').notNull(),
  voucher: real('voucher').notNull(),
  fees: real('fees').notNull(),
})

export type InsertDailySalesSummary = typeof dailySalesSummaries.$inferInsert
export type SelectDailySalesSummary = typeof dailySalesSummaries.$inferSelect
