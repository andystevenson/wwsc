import { parentPort } from 'node:worker_threads'
import { Stripe } from 'stripe'
import { stripe, relevantSubscription } from '@lib/stripe/wwsc'
import { memberExists, subscriptionExists, paymentExists, type ID } from '../db'

import { createCustomer } from '../sync/createCustomer'
import { createSubscription } from '../sync/createSubscription'
import { createInvoice } from '../sync/createInvoice'
import type { ResyncRequest, ResyncResponse } from '../types'

import { dayjs } from '@wwsc/lib-dates'
import { send } from 'node:process'

let restarting = false
let updates: string[] = []
type Create = { wwsc: boolean; id: string }
let creates: Create[] = []
let started = 0
let ended = 0

parentPort?.on('message', async (message: ResyncRequest) => {
  if (message.action === 'restart') {
    await processRestart()
  }
})

function sendMessage(message: string) {
  parentPort?.postMessage({ action: 'message', result: `resync: ${message}` })
}

async function processRestart() {
  let response: ResyncResponse | undefined
  try {
    sendMessage('restarting...')
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
    action: 'restart',
    result: response
  })
  updates = []
  creates = []
  sendMessage('restart fully completed')
}

async function restart() {
  if (restarting) return
  restarting = true
  started = dayjs().valueOf()
  for await (const customer of stripe.customers.list()) {
    await auditCustomer(customer)
  }
  ended = dayjs().valueOf()
  restarting = false
}

async function auditCustomer(customer: Stripe.Customer) {
  let count = 0
  let { metadata, name, id } = customer
  let options: Stripe.SubscriptionListParams = {
    status: 'all',
    customer: id
  }

  let { wwsc } = metadata
  sendMessage(`auditing customer: ${id} ${name} ${wwsc}`)
  for await (const subscription of stripe.subscriptions.list(options)) {
    await auditSubscription(subscription)
    count++
  }

  if (count === 0 && wwsc === 'true') {
    let exists = await memberExists(id)
    if (!exists) creates.push({ id, wwsc: true })
  }
}

async function auditSubscription(subscription: Stripe.Subscription) {
  // relevance is basically if it is active and after the end of 2023
  let relevant = await relevantSubscription(subscription)
  sendMessage(`auditing subscription: ${subscription.id}, ${relevant}`)
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
      creates.push({ id: customerId, wwsc: false })
    }
    creates.push({ id, wwsc: true })

    await auditInvoices(subscription, updates, creates)
  }

  await triggerCreates(creates)
  await triggerUpdates(updates)
}

async function auditInvoices(
  subscription: Stripe.Subscription,
  updates: string[],
  creates: Create[]
) {
  let { id } = subscription
  for await (let invoice of stripe.invoices.list({ subscription: id })) {
    let { id } = invoice
    let iExists = await paymentExists(id)
    if (iExists) {
      updates.push(id)
    }
    if (!iExists) {
      creates.push({ id, wwsc: true })
    }
  }
}

export async function triggerUpdates(ids: string[]) {
  let metadata = { resync: dayjs().toISOString() }
  return Promise.all(
    ids.map((id) => {
      if (id.startsWith('cus_')) {
        sendMessage(`updating customer: ${id}`)
        return stripe.customers.update(id, { metadata })
      }
      if (id.startsWith('sub_')) {
        sendMessage(`updating subscription: ${id}`)
        return stripe.subscriptions.update(id, { metadata })
      }
      if (id.startsWith('in_')) {
        sendMessage(`updating invoice: ${id}`)
        return stripe.invoices.update(id, { metadata })
      }
      return Promise.resolve()
    })
  )
}

export async function triggerCreates(ids: Create[]) {
  for (let { id, wwsc } of ids) {
    if (id.startsWith('in_')) {
      let invoice = await stripe.invoices.retrieve(id)
      sendMessage(`creating invoice: ${id}`)
      await createInvoice(invoice)
    }

    if (id.startsWith('sub_')) {
      let subscription = await stripe.subscriptions.retrieve(id)
      sendMessage(`creating subscription: ${id}`)
      await createSubscription(subscription)
    }

    if (id.startsWith('cus_')) {
      let customer = await stripe.customers.retrieve(id)
      sendMessage(`creating customer: ${id}`)
      if (!customer.deleted) await createCustomer(customer, wwsc)
    }
  }
}
