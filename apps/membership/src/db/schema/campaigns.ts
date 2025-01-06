import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { now } from '@wwsc/lib-dates'
import { users } from './users'

export const campaigns = sqliteTable('campaigns', {
  id: text().notNull().primaryKey(),
  created: text().notNull().default(now()),
  createdBy: text()
    .references(() => users.email)
    .notNull(),
  start: text().notNull().default(now()),
  end: text(), // date | null
  description: text()
})

export type InsertCampaign = typeof campaigns.$inferInsert
export type Campaign = typeof campaigns.$inferSelect
export type UpdateCampaign = Omit<InsertCampaign, 'id'>

export const insertCampaignSchema = createInsertSchema(campaigns)
export const selectCampaignSchema = createSelectSchema(campaigns)
export const updateCampaignSchema = createInsertSchema(campaigns)
