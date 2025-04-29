import { Worker } from 'node:worker_threads'
import { createFactory } from 'hono/factory'
import type { PinoLogger } from 'hono-pino'

export type App = {
  Variables: {
    logger: PinoLogger
    worker: Worker
  }
}

const factory = createFactory<App>()
const app = factory.createApp()

export { factory, app, type PinoLogger }
