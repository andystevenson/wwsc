import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const events = sqliteTable('events', {
  id: text('id')
    .primaryKey()
    .$default(() => `event_${nanoid()}`),
  name: text('name').unique().notNull(),
  type: text('type', {
    enum: [
      'function',
      'event',
      'baby-shower',
      'christening',
      'wedding',
      'party',
      'meeting',
      'fitness-class',
      'funeral',
    ],
  }).notNull(),
  status: text('status', { enum: ['enquiry', 'booking', 'cancelled'] }).default(
    'enquiry',
  ),
  date: text('date').notNull(),
  start: text('start'),
  end: text('end'),
  notes: text('notes').default(''),
})

export type Event = typeof events.$inferInsert
export type SelectEvent = typeof events.$inferSelect
export type UpdateEvent = Omit<Event, 'id'>
