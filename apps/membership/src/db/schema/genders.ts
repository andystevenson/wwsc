import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { members } from './members'

export const GenderTypes = ['male', 'female', 'other', 'unknown'] as const
export type GenderType = (typeof GenderTypes)[number]

export const genders = sqliteTable('genders', {
  id: text()
    .primaryKey()
    .references(() => members.id),
  gender: text({ enum: GenderTypes }).notNull().default('unknown'),
  other: text()
})

export type InsertGender = typeof genders.$inferInsert
export type Gender = typeof genders.$inferSelect
export type UpdateGender = Omit<InsertGender, 'id'>

export const insertGenderSchema = createInsertSchema(genders)
export const selectGenderSchema = createSelectSchema(genders)
export const updateGenderSchema = createInsertSchema(genders)
