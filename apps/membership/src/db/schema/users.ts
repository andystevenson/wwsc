import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const UserAccess = ['owner', 'admin', 'user'] as const

export const users = sqliteTable('users', {
  email: text().notNull().primaryKey(),
  name: text().notNull(),
  access: text({ enum: UserAccess }).notNull().default('user'),
  googleId: text(),
  image: text() // URL
})

export type InsertUser = typeof users.$inferInsert
export type User = typeof users.$inferSelect
export type UpdateUser = Omit<InsertUser, 'id'>

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const updateUserSchema = createInsertSchema(users)
