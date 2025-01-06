import 'dotenv/config'
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MEMBERSHIP_PORT: string
      MEMBERSHIP_DATABASE_URL: string
      MEMBERSHIP_SESSION_KEY: string
      LOGPATH: string
      GOOGLE_ID: string
      GOOGLE_SECRET: string
      STRIPE_SECRET_KEY: string
    }
  }
}

if (!process.env.LOGPATH) {
  throw new Error('LOGPATH environment variable is required')
}

if (!process.env.MEMBERSHIP_PORT) {
  throw new Error('MEMBERSHIP_PORT environment variable is required')
}

if (!process.env.MEMBERSHIP_DATABASE_URL) {
  throw new Error('TIMESHEET_DATABASE_URL environment variable is required')
}

if (!process.env.MEMBERSHIP_SESSION_KEY) {
  throw new Error('TIMESHEET_SESSION_KEY environment variable is required')
}

if (!process.env.GOOGLE_ID) {
  throw new Error('GOOGLE_ID environment variable is required')
}

if (!process.env.GOOGLE_SECRET) {
  throw new Error('GOOGLE_SECRET environment variable is required')
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}
export default {
  LOGPATH: process.env.LOGPATH,
  MEMBERSHIP_PORT: process.env.MEMBERSHIP_PORT,
  MEMBERSHIP_DATABASE_URL: process.env.MEMBERSHIP_DATABASE_URL,
  MEMBERSHIP_SESSION_KEY: process.env.MEMBERSHIP_SESSION_KEY,
  GOOGLE_ID: process.env.GOOGLE_ID,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
}
