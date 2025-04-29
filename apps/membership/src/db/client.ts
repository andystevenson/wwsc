import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  isNull,
  isNotNull,
  like,
  lt,
  lte,
  gt,
  ne,
  inArray,
  notInArray,
  sql,
  SQL,
  getTableColumns
} from 'drizzle-orm'
import { createClient } from '@libsql/client'
import env from '../utilities/env'
export const client = createClient({
  url: env.MEMBERSHIP_DATABASE_URL!,
  authToken: '...'
})

export {
  and,
  asc,
  desc,
  eq,
  ilike,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  like,
  lt,
  lte,
  gt,
  gte,
  ne,
  sql,
  SQL,
  getTableColumns
}
