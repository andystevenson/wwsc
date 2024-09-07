declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EVENTS_PORT: string
      EVENTS_DATABASE_URL: string
      EVENTS_SESSION_KEY: string
      WHITELISTED_IPS: string
    }
  }
}

if (!process.env.EVENTS_PORT) {
  throw new Error('EVENTS_PORT environment variable is required')
}

if (!process.env.EVENTS_DATABASE_URL) {
  throw new Error('TIMESHEET_DATABASE_URL environment variable is required')
}

if (!process.env.EVENTS_SESSION_KEY) {
  throw new Error('TIMESHEET_SESSION_KEY environment variable is required')
}

if (!process.env.WHITELISTED_IPS) {
  throw new Error('WHITELISTED_IPS environment variable is required')
}

export default {
  EVENTS_PORT: process.env.EVENTS_PORT,
  EVENTS_DATABASE_URL: process.env.EVENTS_DATABASE_URL,
  EVENTS_SESSION_KEY: process.env.TIMESHEETS_SESSION_KEY,
  WHITELISTED_IPS: process.env.WHITELISTED_IPS,
}
