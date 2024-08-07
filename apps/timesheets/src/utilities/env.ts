declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TIMESHEETS_PORT: string
      TIMESHEETS_DATABASE_URL: string
      TIMESHEETS_DATABASE_SYNC_URL: string
      TIMESHEETS_DATABASE_AUTH_TOKEN: string
      TIMESHEETS_SESSION_KEY: string
      GOODTILL_BASE_URL: string
      GOODTILL_SUBDOMAIN: string
      GOODTILL_USERNAME: string
      GOODTILL_PASSWORD: string
      WHITELISTED_IPS: string
    }
  }
}

if (!process.env.TIMESHEETS_PORT) {
  throw new Error('TIMESHEETS_PORT environment variable is required')
}

if (!process.env.TIMESHEETS_DATABASE_URL) {
  throw new Error('TIMESHEET_DATABASE_URL environment variable is required')
}

if (!process.env.TIMESHEETS_SESSION_KEY) {
  throw new Error('TIMESHEET_SESSION_KEY environment variable is required')
}
if (!process.env.GOODTILL_BASE_URL) {
  throw new Error('GOODTILL_BASE_URL environment variable is required')
}

if (!process.env.GOODTILL_SUBDOMAIN) {
  throw new Error('GOODTILL_SUBDOMAIN environment variable is required')
}

if (!process.env.GOODTILL_USERNAME) {
  throw new Error('GOODTILL_USERNAME environment variable is required')
}

if (!process.env.GOODTILL_PASSWORD) {
  throw new Error('GOODTILL_PASSWORD environment variable is required')
}

if (!process.env.WHITELISTED_IPS) {
  throw new Error('WHITELISTED_IPS environment variable is required')
}

export default {
  TIMESHEETS_PORT: process.env.TIMESHEETS_PORT,
  TIMESHEETS_DATABASE_URL: process.env.TIMESHEETS_DATABASE_URL,
  TIMESHEETS_DATABASE_SYNC_URL: process.env.TIMESHEETS_DATABASE_SYNC_URL,
  TIMESHEETS_DATABASE_AUTH_TOKEN: process.env.TIMESHEETS_DATABASE_AUTH_TOKEN,
  TIMESHEETS_SESSION_KEY: process.env.TIMESHEETS_SESSION_KEY,
  GOODTILL_BASE_URL: process.env.GOODTILL_BASE_URL,
  GOODTILL_SUBDOMAIN: process.env.GOODTILL_SUBDOMAIN,
  GOODTILL_USERNAME: process.env.GOODTILL_USERNAME,
  GOODTILL_PASSWORD: process.env.GOODTILL_PASSWORD,
  WHITELISTED_IPS: process.env.WHITELISTED_IPS,
}
