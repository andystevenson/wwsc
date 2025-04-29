import { Stripe } from 'stripe'
import { Worker } from 'node:worker_threads'
import { PinoLogger } from 'hono-pino'
import type {
  Webhook,
  WebhookQueue,
  WebhookEvent,
  ResyncRequest,
  ResyncResponse
} from '../types'
import { customerCreated } from '../events/customerCreated'
import { customerUpdated } from '../events/customerUpdated'
import { customerDeleted } from '../events/customerDeleted'
import { subscriptionCreated } from '../events/subscriptionCreated'
import { subscriptionUpdated } from '../events/subscriptionUpdated'
import { subscriptionDeleted } from '../events/subscriptionDeleted'
import { subscriptionPaused } from '../events/subscriptionPaused'
import { subscriptionResumed } from '../events/subscriptionResumed'
import { subscriptionTrialWillEnd } from '../events/subscriptionTrialWillEnd'
import { invoiceCreated } from '../events/invoiceCreated'
import { invoiceFinalized } from '../events/invoiceFinalized'
import { invoiceFinalizationFailed } from '../events/invoiceFinalizationFailed'
import { invoicePaid } from '../events/invoicePaid'
import { invoicePaymentActionRequired } from '../events/invoicePaymentActionRequired'
import { invoicePaymentFailed } from '../events/invoicePaymentFailed'
import { invoiceUpcoming } from '../events/invoiceUpcoming'
import { invoiceUpdated } from '../events/invoiceUpdated'
import { invoicePaymentSucceeded } from '../events/invoicePaymentSucceeded'

let handlers = new Map<Stripe.Event.Type, Webhook>([
  ['customer.created', customerCreated],
  ['customer.updated', customerUpdated],
  ['customer.deleted', customerDeleted],
  ['customer.subscription.created', subscriptionCreated],
  ['customer.subscription.updated', subscriptionUpdated],
  ['customer.subscription.deleted', subscriptionDeleted],
  ['customer.subscription.paused', subscriptionPaused],
  ['customer.subscription.resumed', subscriptionResumed],
  ['customer.subscription.trial_will_end', subscriptionTrialWillEnd],
  ['invoice.created', invoiceCreated],
  ['invoice.updated', invoiceUpdated],
  ['invoice.finalized', invoiceFinalized],
  ['invoice.finalization_failed', invoiceFinalizationFailed],
  ['invoice.paid', invoicePaid],
  ['invoice.payment_action_required', invoicePaymentActionRequired],
  ['invoice.payment_failed', invoicePaymentFailed],
  ['invoice.payment_succeeded', invoicePaymentSucceeded],
  ['invoice.upcoming', invoiceUpcoming],
  ['invoice.updated', invoiceUpdated]
])
let events: WebhookQueue = []

export function queue(event: WebhookEvent) {
  events.push(event)
}

export async function start(logger: PinoLogger) {
  let state = {
    restart: true,
    processing: false
  }
  // setup the resync worker
  // in a restart scenarion that's all we want to be doing
  let worker = new Worker('./src/resync/resync.ts', {
    workerData: { path: './src/resync/resync.ts' }
  })

  worker.on('message', (message: ResyncResponse) => {
    if (message.action === 'restart') {
      state.restart = false
      logger.info(`resync worker completed ...`)
      logger.info(JSON.stringify(message.result, null, 2))
    }

    if (message.action === 'message') {
      logger.info(message.result)
    }
  })

  worker.on('error', (error) => {
    logger.error('resync worker error:', error)
  })

  worker.on('exit', (code) => {
    logger.info('resync worker exited:', code)
    worker.terminate()
  })

  if (state.restart) {
    worker.postMessage({ action: 'restart' })
  }

  let interval = process.env.WEBHOOK_SYNC_INTERVAL
    ? +process.env.WEBHOOK_SYNC_INTERVAL
    : 100

  setInterval(async () => {
    let event: WebhookEvent | undefined
    if (state.restart) {
      logger.debug(
        `restart is still running...${state.restart} ${events.length} events queued`
      )
      return
    }

    if (state.processing) {
      logger.info('still processing events...')
      return
    }

    if (events.length === 0) {
      return
    }

    try {
      state.processing = true
      event = events.shift()
      if (!event) {
        state.processing = false
        return
      }

      let handler = handlers.get(event.type)
      if (!handler) {
        logger.debug(`no event handler for ${event.type} ${event.object.id}`)
        state.processing = false
        return
      }

      await handler(event)
      logger.info(`✅ event processed ${event.type} ${event.object.id}`)
      state.processing = false
    } catch (error) {
      let type = event ? event.type : ''
      let id = event?.object.id || ''
      logger.error(`🤬 error processing event ${type} ${id}`)
      if (error instanceof Error) logger.error(error.message)
      state.processing = false
    }
  }, interval)

  return worker
}
