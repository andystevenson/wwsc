import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  like,
  lt,
  ne,
  sql,
  SQL
} from 'drizzle-orm'
import { createClient } from '@libsql/client'
import env from '../utilities/env'
export const client = createClient({
  url: env.MEMBERSHIP_DATABASE_URL!,
  authToken: '...'
})

export { and, asc, desc, eq, gte, ilike, isNull, like, lt, ne, sql, SQL }
