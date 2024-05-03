import 'dotenv/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './db/db.js'
import { migrate } from 'drizzle-orm/libsql/migrator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

;(async () => {
  await migrate(db, { migrationsFolder: resolve(__dirname, '../migrations') })
})()
