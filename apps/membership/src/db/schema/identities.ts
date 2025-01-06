import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { members } from './members'
import { stripe } from '../../stripe'

export const identities = sqliteTable('identities', {
  id: text()
    .primaryKey()
    .references(() => members.id),
  card: text(), // card number
  memberNo: text(), // legacy ashbourne member number
  sumup: text() // customer record on sumup
})

export type InsertIdentity = typeof identities.$inferInsert
export type Identity = typeof identities.$inferSelect
export type UpdateIdentity = Omit<InsertIdentity, 'id'>

export const insertIdentitySchema = createInsertSchema(identities)
export const selectIdentitySchema = createSelectSchema(identities)
export const updateIdentitySchema = createInsertSchema(identities)
