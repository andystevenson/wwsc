import { drizzle } from 'drizzle-orm/libsql'
import { eq, gte, lt, and, isNull, asc } from 'drizzle-orm'
import { createClient } from '@libsql/client'
import {
  shifts,
  type InsertShift,
  type SelectShift,
  type UpdateShift,
} from './schema/shifts'

import {
  holidays,
  type InsertHoliday,
  type SelectHoliday,
  type UpdateHoliday,
} from './schema/holidays'

if (!process.env.TIMESHEETS_DATABASE_URL) {
  throw new Error('TIMESHEETS_DATABASE_URL is required')
}

const client = createClient({
  url: process.env.TIMESHEETS_DATABASE_URL!,
  authToken: '...',
})

const db = drizzle(client)

export {
  db,
  eq,
  gte,
  lt,
  and,
  asc,
  isNull,
  shifts,
  type InsertShift,
  type SelectShift,
  type UpdateShift,
  holidays,
  type InsertHoliday,
  type SelectHoliday,
  type UpdateHoliday,
}
