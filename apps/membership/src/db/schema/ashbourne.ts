import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { SQL, sql } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const ashbourne = sqliteTable('ashbourne', {
  memberNo: text().primaryKey().notNull(),
  id: text().notNull().default(''),
  cardNo: text().notNull().default(''),
  ashRef: text().notNull().default(''),
  memTitle: text().notNull().default(''),
  firstName: text().notNull().default(''),
  surname: text().notNull().default(''),
  name: text().generatedAlwaysAs(
    (): SQL => sql`concat(${ashbourne.firstName},' ',${ashbourne.surname})`,
    { mode: 'virtual' }
  ),
  knownAs: text().notNull().default(''),
  additionalDob: text().notNull().default(''),
  postcode: text().notNull().default(''),
  dob: text().notNull().default(''),
  lastPayDate: text().notNull().default(''),
  status: text().notNull().default(''),
  clubInfo: text().notNull().default(''),
  periodPayment: text().notNull().default(''),
  memType: text().notNull().default(''),
  joinedDate: text().notNull().default(''),
  expireDate: text().notNull().default(''),
  reviewDate: text().notNull().default(''),
  mobile: text().notNull().default(''),
  phoneNo: text().notNull().default(''),
  email: text().notNull().default(''),
  paymentNumber: text().notNull().default(''),
  paymentMonth: text().notNull().default(''),
  paymentYear: text().notNull().default(''),
  paymentDate: text().notNull().default(''),
  address: text().notNull().default(''),
  lastVisit: text().notNull().default(''),
  facilityNo: text().notNull().default(''),
  notes: text().notNull().default(''),
  marketingChannel: text().notNull().default('')
})

export type InsertAshbourneMember = typeof ashbourne.$inferInsert
export type AshbourneMember = typeof ashbourne.$inferSelect
export type UpdateAshbourneMember = Omit<InsertAshbourneMember, 'memberNo'>

export const insertAshbourneSchema = createInsertSchema(ashbourne)
export const selectAshbourneSchema = createSelectSchema(ashbourne)
export const updateAshbourneSchema = createInsertSchema(ashbourne)
