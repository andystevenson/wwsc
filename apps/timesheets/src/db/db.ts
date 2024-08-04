import { drizzle } from 'drizzle-orm/libsql'
import { eq, and, isNull } from 'drizzle-orm'
import { createClient } from '@libsql/client'
import { shifts, type InsertShift, type SelectShift } from './schema/shifts'

if (!process.env.TIMESHEETS_DATABASE_URL) {
  throw new Error('TIMESHEETS_DATABASE_URL is required')
}

const client = createClient({
  url: process.env.TIMESHEETS_DATABASE_URL!,
  authToken: '...',
})

const db = drizzle(client)

export { db, shifts, eq, and, isNull, type InsertShift, type SelectShift }
