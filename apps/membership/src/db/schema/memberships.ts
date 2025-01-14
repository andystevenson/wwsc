import {
  type AnySQLiteColumn,
  integer,
  real,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core'
import { SQL, sql } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { dayjs, now } from '@wwsc/lib-dates'

export const Categories = [
  'hockey',
  'cricket',
  'social',
  'family',
  '+classes',
  'adult',
  'off-peak',
  'over-65',
  'young-adult',
  'student',
  'aged-16-18',
  'aged-12-15',
  'aged-5-11',
  'junior', // do not use
  'teens', // do not use
  // non-paying memberships
  'under-5',
  'honorary',
  'coach',
  'staff',
  'professional',
  'astro',
  'subcontractor',
  'guest-of',
  // test memberships types for debugging
  'test'
] as const

export type Category = (typeof Categories)[number]

export const Intervals = ['month', 'year'] as const
export type Interval = (typeof Intervals)[number]

export const MembershipStatuses = ['active', 'suspended', 'withdrawn'] as const
export type MembershipStatus = (typeof MembershipStatuses)[number]

export const memberships = sqliteTable('memberships', {
  id: text().primaryKey().notNull(),
  category: text({ enum: Categories }).notNull(),
  status: text({ enum: MembershipStatuses }).notNull().default('active'),
  description: text().default(''),
  effectiveDate: text().notNull().default(dayjs().format('YYYY-MM-DD')), // date
  interval: text({ enum: Intervals }).notNull().default('month'),
  intervals: integer({ mode: 'number' }).notNull().default(1),
  iterations: integer({ mode: 'number' }).notNull().default(1),
  price: real().notNull().default(0),
  paying: integer({ mode: 'boolean' }).generatedAlwaysAs(
    (): SQL =>
      sql`${memberships.category} NOT IN ('under-5', 'honorary', 'coach', 'staff', 'professional', 'astro', 'subcontractor', 'guest-of', 'test')`,
    { mode: 'virtual' }
  ),
  sports: integer({ mode: 'boolean' }).generatedAlwaysAs(
    (): SQL =>
      sql`${memberships.category} NOT IN ('social', 'staff', 'subcontractor', 'guest-of', 'astro')`,
    { mode: 'virtual' }
  ),
  then: text().references((): AnySQLiteColumn => memberships.id)
})

export type InsertMembership = typeof memberships.$inferInsert
export type Membership = typeof memberships.$inferSelect
export type UpdateMembership = Omit<InsertMembership, 'id'>

export const insertMembershipSchema = createInsertSchema(memberships)
export const selectMembershipSchema = createSelectSchema(memberships)
export const updateMembershipSchema = createInsertSchema(memberships)
