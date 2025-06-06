import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { campaigns } from './campaigns'
import { memberships, Categories } from './memberships'

export const campaignMemberships = sqliteTable(
  'campaignMemberships',
  {
    campaign: text()
      .references(() => campaigns.id)
      .notNull(),
    category: text({ enum: Categories }).notNull(),
    membership: text()
      .references(() => memberships.id)
      .notNull()
  },
  (table) => {
    return {
      key: primaryKey({
        columns: [table.campaign, table.category, table.membership]
      })
    }
  }
)

export type InsertCampaignMembership = typeof campaignMemberships.$inferInsert
export type CampaignMembership = typeof campaignMemberships.$inferSelect
export type UpdateCampaignMembership = Omit<InsertCampaignMembership, 'id'>

export const insertCampaignMembershipSchema =
  createInsertSchema(campaignMemberships)
export const selectCampaignMembershipSchema =
  createSelectSchema(campaignMemberships)
export const updateCampaignMembershipSchema =
  createInsertSchema(campaignMemberships)
