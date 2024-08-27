import { sqliteTable, real, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { shifts } from './shifts'

export const holidays = sqliteTable('holidays', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  shiftId: text('shift_id').references(() => shifts.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  type: text('type', {
    enum: ['bfwd', 'acc', 'taken', 'paid', 'bhol'],
  }).notNull(),
  date: text('date').notNull(),
  hours: real('hours').notNull(),
  notes: text('notes').default(''),
})

export type InsertHoliday = typeof holidays.$inferInsert
export type SelectHoliday = typeof holidays.$inferSelect
export type UpdateHoliday = Omit<InsertHoliday, 'id'>
