import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const origanizers = sqliteTable('origanizers', {
  id: text('id')
    .primaryKey()
    .$default(() => `organizer_${nanoid()}`),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  postcode: text('postcode'),
  address: text('address'),
  notes: text('notes').default(''),
})

export type Organizer = typeof origanizers.$inferInsert
export type SelectOrganizer = typeof origanizers.$inferSelect
export type UpdateOrganizer = Omit<Organizer, 'id'>
