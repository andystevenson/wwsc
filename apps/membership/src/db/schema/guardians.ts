import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const guardians = sqliteTable(
  'guardians',
  {
    member: text().notNull(),
    name: text().notNull().default(''),
    mobile: text().notNull().default(''),
    email: text().notNull().default('')
  },
  (table) => {
    let key = primaryKey({ columns: [table.member, table.name] })
    return { key }
  }
)

export type InsertGuardian = typeof guardians.$inferInsert
export type Guardian = typeof guardians.$inferSelect
export type UpdateGuardian = Omit<InsertGuardian, 'member'>

export const insertGuardianSchema = createInsertSchema(guardians)
export const selectGuardianSchema = createSelectSchema(guardians)
export const updateGuardianSchema = createInsertSchema(guardians)
