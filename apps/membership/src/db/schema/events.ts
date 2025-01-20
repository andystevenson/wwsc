import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { nanoid } from 'nanoid'
import { now } from '@wwsc/lib-dates'
import { members } from './members'

export const EventTypes = [
  'joined',
  'cancelled',
  'suspended',
  'upgraded',
  'visited',
  'reviewed',
  'paid',
  'payment-failed',
  'updated',
  'deleted',
  'notes'
] as const

export const events = sqliteTable('events', {
  id: text()
    .primaryKey()
    .notNull()
    .$default(() => `event-${nanoid()}`),
  date: text().notNull().default(now()),
  type: text({ enum: EventTypes }).notNull().default('joined'),
  member: text().references(() => members.id)
})

export type InsertEvent = typeof events.$inferInsert
export type Event = typeof events.$inferSelect
export type UpdateEvent = Omit<InsertEvent, 'id'>

export const insertEventSchema = createInsertSchema(events)
export const selectEventSchema = createSelectSchema(events)
export const updateEventSchema = createInsertSchema(events)
