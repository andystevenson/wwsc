import {
  type AnySQLiteColumn,
  sqliteTable,
  text,
  integer
} from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { memberships } from './memberships'
import { members } from './members'
import { CollectionMethods } from './payments'

export const CollectionBehaviours = [
  'keep_as_draft',
  'mark_uncollectable',
  'void'
] as const
export type CollectionBehaviour = (typeof CollectionBehaviours)[number]

export const SubscriptionStatus = [
  'active',
  'incomplete',
  'incomplete_expired',
  'trialing',
  'past_due',
  'unpaid',
  'paused',
  'canceled'
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
  status: text({ enum: SubscriptionStatus }).default('active').notNull(),
  started: text(), // date
  phaseStart: text(), // date | null
  phaseEnd: text(), // date | null
  cancelAt: text(), // date | null
  canceledAt: text(), // date | null
  cancelAtPeriodEnd: integer({ mode: 'boolean' }).default(false).notNull(), // boolean
  reason: text(), // reason for cancellation | null
  collectionPaused: integer({ mode: 'boolean' }).default(false).notNull(), // boolean
  collectionBehavior: text({ enum: CollectionBehaviours }), // behavior when collection paused
  collectionResumes: text(), // date | null
  ends: text().notNull(), // date | null ... when the subscription ends | ended
  includedIn: text().references((): AnySQLiteColumn => subscriptions.id)
})

export type InsertSubscription = typeof subscriptions.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type UpdateSubscription = Omit<InsertSubscription, 'id'>

export const insertSubscriptionSchema = createInsertSchema(subscriptions)
export const selectSubscriptionSchema = createSelectSchema(subscriptions)
export const updateSubscriptionSchema = createInsertSchema(subscriptions)
