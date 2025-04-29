import pino from 'pino'

let WWSC_LOG_LEVEL = process.env.WWSC_LOG_LEVEL || 'info'

export const logger = pino({
  name: 'webhooks-resync',
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.NODE_ENV !== 'production'
})
