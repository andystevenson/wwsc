import 'dotenv/config'
import type { Config } from 'drizzle-kit'

export default {
  dialect: 'sqlite',
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TIMESHEETS_DATABASE_URL!,
    // authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
} satisfies Config
