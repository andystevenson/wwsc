export * from 'pino'
import pretty from 'pino-pretty'
export const Levels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
] as const

export { pretty }
