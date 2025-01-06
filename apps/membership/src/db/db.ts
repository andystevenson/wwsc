import { drizzle } from 'drizzle-orm/libsql'
import schema from './schema'
import { client } from './client'
export * from './client'
export * from './functions'
export * from './schema'

const db = drizzle(client, schema)

export { db }
