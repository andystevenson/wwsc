import { drizzle } from 'drizzle-orm/libsql'
import { eq, gte, lt, and, isNull, asc } from 'drizzle-orm'
import { createClient } from '@libsql/client'

export * from './schema/events'

if (!process.env.TIMESHEETS_DATABASE_URL) {
  throw new Error('TIMESHEETS_DATABASE_URL is required')
}

const client = createClient({
  url: process.env.TIMESHEETS_DATABASE_URL!,
  authToken: '...',
})

const db = drizzle(client)

export { db, eq, gte, lt, and, asc, isNull }
