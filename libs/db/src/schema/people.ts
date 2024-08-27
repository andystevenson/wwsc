import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const people = sqliteTable('people', {
  id: integer('id').primaryKey(),
  firstname: text('name').notNull(),
  surname: text('surname').notNull(),
  gender: text('gender', { enum: ['male', 'female'] }),
  dob: text('dob').$type<Date>().notNull(),
})

export type InsertPerson = typeof people.$inferInsert
export type SelectPerson = typeof people.$inferSelect
