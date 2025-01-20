import { Stripe } from 'stripe'
import { Worker } from 'node:worker_threads'
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

// setup the resync worker
// in a restart scenarion that's all we want to be doing
let restart = true
let worker = new Worker('./src/resync/resync.ts', {
  workerData: { path: './src/resync/resync.ts' }
})

worker.on('message', (message: ResyncResponse) => {
  console.log('main thread message:', message)
  if (message.action === 'restart') {
    console.log('resync completed', message.result)
    restart = false
  }
})

worker.on('error', (error) => {
  console.error('worker error:', error)
})

worker.on('exit', (code) => {
  console.log('worker exited with code:', code)
  worker.terminate()
})

if (restart) {
  worker.postMessage({ action: 'restart' })
}

let interval = process.env.WEBHOOK_SYNC_INTERVAL
  ? +process.env.WEBHOOK_SYNC_INTERVAL
  : 100

// so events will queue up sequentially and not potentially overlap
let processing = false

setInterval(async () => {
  if (processing) {
    console.warn('already processing events...')
    return
  }

  if (events.length === 0) {
    return
  }

  let event = events.shift()
  if (!event) return

  let handler = handlers.get(event.type)
  if (!handler) {
    console.log('no event handler for', event.type, event.object.object)
    return
  }

  try {
    await handler(event)

    // as long as we're not in a restart scenario
    // schedule audits for the object affected by the event
    if (!restart) {
      worker.postMessage({
        action: 'audit',
        type: event.object.object,
        id: event.object.id
      })
    }

    processing = false
  } catch (error) {
    console.error('error processing event', event.type, event.object.object)
    console.error(error)
    processing = false
  }
}, interval)
