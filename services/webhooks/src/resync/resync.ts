import { workerData, parentPort } from 'node:worker_threads'
import { Stripe } from 'stripe'
import { stripe, relevantSubscription } from '@lib/stripe/wwsc'
import {
  db,
  subscriptions,
  members,
  memberExists,
  subscriptionExists,
  paymentExists
} from '../db'

import { createCustomer } from '../sync/createCustomer'
import { createSubscription } from '../sync/createSubscription'
import { createInvoice } from '../sync/createInvoice'
import type { ResyncRequest, ResyncResponse } from '../types'

import { dayjs } from '@wwsc/lib-dates'

let restarting = false
let updates: string[] = []
let creates: string[] = []
let started = 0
let ended = 0

parentPort?.on('message', async (message: ResyncRequest) => {
  console.log('worker message:', message)
  if (message.action === 'restart') {
    let response: ResyncResponse | undefined
    try {
      await restart()
      response = {
        action: 'restart',
        result: {
          completed: true,
          creates: creates.length,
          updates: updates.length,
          elapsed: ended - started
        }
      }
    } catch (error) {
      restarting = false
      response = {
        action: 'restart',
        result: { completed: false, error }
      }
    }

    parentPort?.postMessage({
      type: 'restart',
      result: response
    })
    updates = []
    creates = []
  }
})

async function restart() {
  if (restarting) return
  restarting = true
  started = dayjs().valueOf()
  console.log('restarting...')

  for await (const customer of stripe.customers.list()) {
    let count = 0
    let { metadata, name, id } = customer
    let { wwsc } = metadata
    console.log('auditing customer:', id, name, wwsc)
    for await (const subscription of stripe.subscriptions.list({
      status: 'all',
      customer: customer.id
    })) {
      await auditSubscription(subscription)
      count++
    }

    if (count === 0 && wwsc === 'true') creates.push(customer.id)
  }
  ended = dayjs().valueOf()
  restarting = false
  console.log('restart completed')
}

async function auditSubscription(subscription: Stripe.Subscription) {
  // relevance is basically if it is active and after the end of 2023
  let relevant = await relevantSubscription(subscription)
  console.log('auditing subscription:', subscription.id, relevant)
  if (!relevant) return

  let { id } = subscription
  let exists = await subscriptionExists(id)
  let customerId = exists ? exists.member : null

  if (exists && customerId) {
    // the subscription and customer exists, check the payments
    await auditInvoices(subscription, updates, creates)

    // trigger updates on the subscription and customer + all the invoices
    updates.push(id)
    updates.push(customerId)
  }

  if (!exists) {
    // the subscription does not exist, create it
    // first check if the customer exists and if not create that first

    customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id

    let cExists = await memberExists(customerId)
    if (!cExists) {
      creates.push(customerId)
    }
    creates.push(id)

    await auditInvoices(subscription, updates, creates)
  }

  await triggerCreates(creates)
  await triggerUpdates(updates)
}

async function auditInvoices(
  subscription: Stripe.Subscription,
  updates: string[],
  creates: string[]
) {
  let { id } = subscription
  for await (let invoice of stripe.invoices.list({ subscription: id })) {
    let { id } = invoice
    let iExists = await paymentExists(id)
    if (iExists) {
      updates.push(id)
    }
    if (!iExists) {
      creates.push(id)
    }
  }
}

export async function triggerUpdates(ids: string[]) {
  let metadata = { resync: dayjs().toISOString() }
  return Promise.all(
    ids.map((id) => {
      if (id.startsWith('cus_')) {
        console.log('resync updating customer:', id)
        return stripe.customers.update(id, { metadata })
      }
      if (id.startsWith('sub_')) {
        console.log('resync updating subscription:', id)
        return stripe.subscriptions.update(id, { metadata })
      }
      if (id.startsWith('in_')) {
        console.log('resync updating invoice:', id)
        return stripe.invoices.update(id, { metadata })
      }
      return Promise.resolve()
    })
  )
}

export async function triggerCreates(ids: string[]) {
  for (let id of ids) {
    if (id.startsWith('in_')) {
      let invoice = await stripe.invoices.retrieve(id)
      console.log('resync creating invoice:', id)
      await createInvoice(invoice)
    }

    if (id.startsWith('sub_')) {
      let subscription = await stripe.subscriptions.retrieve(id)
      console.log('resync creating subscription:', id)
      await createSubscription(subscription)
    }

    if (id.startsWith('cus_')) {
      let customer = await stripe.customers.retrieve(id)
      console.log('resync creating subscription:', id)
      if (!customer.deleted) await createCustomer(customer)
    }
  }
}
