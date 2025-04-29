import { pinoLogger } from 'hono-pino'
import { pino, transport } from '@lib/pino'
import { env } from '../utilities/env'

export function logger() {
  const production = env.NODE_ENV === 'production'
  const level = env.WWSC_LOG_LEVEL || 'info'
  const destination = `${env.LOGPATH}/wwsc-webhooks`
  const mkdir = true

  const file = {
    target: 'pino-roll',
    options: {
      level,
      file: destination,
      frequency: 'daily',
      extension: '.log',
      dateFormat: 'yyyy-MM-dd',
      mkdir
    }
  }

  const pretty = { target: 'pino-pretty', options: { level } }

  let transports = production ? [file] : [file, pretty]

  return pinoLogger({
    pino: pino(
      transport({
        targets: transports
      })
    ),
    http: {
      reqId: () => crypto.randomUUID(),
      onReqLevel: (c) => level,
      onReqMessage: (c) => 'requested',
      onReqBindings: (c) => ({}),
      onResLevel: (c) => level,
      onResMessage: (c) => 'responded',
      onResBindings: (c) => ({}),
      responseTime: true
    }
  })
}

export default logger
