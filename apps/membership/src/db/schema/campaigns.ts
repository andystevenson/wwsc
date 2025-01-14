import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql, SQL } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { dayjs, now } from '@wwsc/lib-dates'
import { users } from './users'

export const campaigns = sqliteTable('campaigns', {
  id: text().notNull().primaryKey(),
  created: text().notNull().default(now()),
  createdBy: text()
    .references(() => users.email)
    .notNull(),
  start: text().notNull().default(dayjs().format('YYYY-MM-DD')), // date
  end: text().notNull().default('9999-01-01'), // date
  description: text()
})

export type InsertCampaign = typeof campaigns.$inferInsert
export type Campaign = typeof campaigns.$inferSelect
export type UpdateCampaign = Omit<InsertCampaign, 'id'>

export const insertCampaignSchema = createInsertSchema(campaigns)
export const selectCampaignSchema = createSelectSchema(campaigns)
export const updateCampaignSchema = createInsertSchema(campaigns)
