import {
  type AnySQLiteColumn,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { memberships } from './memberships'
import { members } from './members'
import { CollectionMethods } from './payments'

export const SubscriptionScope = ['individual', 'family', 'club'] as const

export type Scope = (typeof SubscriptionScope)[number]
export const SubscriptionStatus = [
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'paused'
] as const
export type Status = (typeof SubscriptionStatus)[number]

export const subscriptions = sqliteTable('subscriptions', {
  id: text().primaryKey().notNull(),
  member: text()
    .references(() => members.id)
    .notNull(),
  membership: text()
    .references(() => memberships.id)
    .notNull(),
  payment: text({ enum: CollectionMethods })
    .default('charge_automatically')
    .notNull(),
  scope: text({ enum: SubscriptionScope }).default('individual').notNull(),
  status: text({ enum: SubscriptionStatus }).default('active').notNull(),
  started: text(), // date
  phaseStart: text(), // date | null
  phaseEnd: text(), // date | null
  canceled: text(), // date | null (might be a future cancellation date)
  includedIn: text().references((): AnySQLiteColumn => subscriptions.id)
})

export type InsertSubscription = typeof subscriptions.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type UpdateSubscription = Omit<InsertSubscription, 'id'>

export const insertSubscriptionSchema = createInsertSchema(subscriptions)
export const selectSubscriptionSchema = createSelectSchema(subscriptions)
export const updateSubscriptionSchema = createInsertSchema(subscriptions)
