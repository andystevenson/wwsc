import { and, asc, eq, gte, ilike, isNull, like, lt, ne } from 'drizzle-orm'
import { createClient } from '@libsql/client'
import env from '../utilities/env'
export const client = createClient({
  url: env.MEMBERSHIP_DATABASE_URL!,
  authToken: '...'
})

export { and, asc, eq, gte, ilike, isNull, like, lt, ne }
