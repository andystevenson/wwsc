import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const postcodes = sqliteTable('postcodes', {
  postcode: text('postcode').primaryKey(),
  expires: text('expires').notNull(),
  result: text('result').notNull(),
})

export type InsertPostcode = typeof postcodes.$inferInsert
export type SelectPostcode = typeof postcodes.$inferSelect
