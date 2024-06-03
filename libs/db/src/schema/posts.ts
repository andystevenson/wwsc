import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .default(sql<string>`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

export type InsertPost = typeof posts.$inferInsert
export type SelectPost = typeof posts.$inferSelect
