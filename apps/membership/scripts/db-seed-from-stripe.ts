import { stripe, Stripe } from '../src/stripe'
import {
  db,
  ashbourne,
  members,
  subscriptions,
  eq,
  formatStripeAddress,
  syncStripeCustomer,
  syncStripeSubscription,
  syncStripeInvoices
} from '../src/db'
import type { AshbourneMember } from '../src/db'
import { dayjs } from '@wwsc/lib-dates'

type SubscriptionData = {
  member: AshbourneMember | null
  customers: Stripe.Customer[]
  subscriptions: Stripe.Subscription[]
}

type Tracker = Map<string, SubscriptionData>

let tracker: Tracker = new Map()

async function main() {
  for await (let customer of stripe.customers.list()) {
    let { metadata, name, address } = customer

    if (!name) throw new TypeError(`no name, ${customer.id}`)

    let { memberNo } = metadata
    console.log('customer', customer.name)

    let member: AshbourneMember | null = null
    if (memberNo) {
      let [found] = await db
        .select()
        .from(ashbourne)
        .where(eq(ashbourne.memberNo, memberNo))

      if (!found)
        throw new TypeError(`member not found in ashbourne ${memberNo}`)

      console.log('member', found.name, memberNo)
      member = found
    }

    let list = await relevantSubscriptions(customer)
    if (list.length === 0) continue

    // add to tracker
    let tracked = tracker.get(name)
    if (tracked) {
      tracked.customers.push(customer)
      tracked.subscriptions.push(...list)
      continue
    }

    tracker.set(name, {
      member,
      customers: [customer],
      subscriptions: list
    })
  }

  // process tracker, normalises tracked customers into a flat list
  let list = await processTracker()
  console.log('tracker processed', list.length)

  // first pass syncs customers and subscriptions
  for (let data of list) {
    let { member, customers, subscriptions } = data
    let customer = customers[0]
    console.log('syncing', customer.name)
    await syncStripeCustomer(customer)
    for (let subscription of subscriptions) {
      await syncStripeSubscription(customer, subscription)
    }
  }

  // second pass links customers and subscriptions
  for (let data of list) {
    let { customers, subscriptions } = data
    let customer = customers[0]
    for (let subscription of subscriptions) {
      await syncStripeLinks(customer, subscription)
    }
  }

  // third pass syncs invoices
  for (let data of list) {
    let { customers, subscriptions } = data
    let customer = customers[0]
    console.log('syncing invoices', customer.name)
    await syncStripeInvoices(customer, subscriptions)
  }
}

async function processTracker() {
  let complex = 0
  let list: SubscriptionData[] = []
  console.log('processing tracker', tracker.size)
  for (let [name, data] of tracker) {
    let { member, customers, subscriptions } = data
    if (customers.length === 1) {
      list.push(data)
      continue
    }

    if (customers.length > 1) {
      complex++
      console.log(
        'processing',
        name,
        member?.memberNo,
        customers.length,
        subscriptions.length
      )
      list.push(...rationaliseCustomers(data))
    }
  }

  list.forEach((data) => {
    if (data.customers.length > 1) {
      console.error(
        'not expected',
        data.customers.length,
        data.customers[0].name
      )
    }
  })
  return list
}

function rationaliseCustomers(data: SubscriptionData) {
  let { member, customers, subscriptions } = data
  if (customers.length === 1) return [data]

  let identities = new Set<string>()

  for (let customer of customers) {
    let { name, email, address, phone } = customer
    let key = `${name}-${email}-${formatStripeAddress(address)}-${phone}`
    identities.add(key)
  }

  if (identities.size === 1) {
    console.log('rationalised compatible', member?.memberNo, customers[0].name)
    let customer = selectBestCustomer(data)
    data.customers = [customer]
    return [data]
  }

  console.log(
    'rationalising incompatible',
    member?.memberNo,
    customers[0].name,
    customers.length
  )

  let multiple: SubscriptionData[] = []
  for (let customer of customers) {
    let newData: SubscriptionData = {
      member: data.member,
      customers: [customer],
      subscriptions: []
    }
    for (let subscription of subscriptions) {
      if (subscription.customer === customer.id) {
        newData.subscriptions.push(subscription)
      }
    }
    multiple.push(newData)
  }

  return multiple
}

function selectBestCustomer(data: SubscriptionData) {
  let sorted = data.subscriptions.toSorted((a, b) => b.created - a.created)
  let count = data.customers.length
  if (count === 1) return data.customers[0]

  // hopefully the first one always
  let best =
    typeof sorted[0].customer === 'string'
      ? sorted[0].customer
      : sorted[0].customer.id

  let statuses = new Map<string, Set<string>>()
  for (let subscription of sorted) {
    let { customer, status } = subscription
    let id = typeof customer === 'string' ? customer : customer.id

    let list = statuses.get(status) || new Set<string>()
    list.add(id)
    statuses.set(status, list)
  }

  // if there is only one active subscription, use the customer attached to it
  let actives = statuses.get('active')
  if (actives && actives.size === 1) {
    let candidate = actives.values().next().value
    best = candidate ? candidate : best
  }

  let finalSelection = data.customers.find((c) => c.id === best)
  if (!finalSelection)
    throw new TypeError(`no best customer found for ${data.member?.memberNo}`)

  let { id, name, email } = finalSelection
  console.log('selected best', id, name, email)
  return finalSelection
}

let d2024 = dayjs('2023-12-31')
async function relevantSubscriptions(customer: Stripe.Customer) {
  let list = await stripe.subscriptions.list({
    status: 'all',
    customer: customer.id
  })

  return list.data.filter((sub) => {
    let { canceled_at } = sub
    if (!canceled_at) return true

    let cancelDate = dayjs.unix(canceled_at)
    return cancelDate.isAfter(d2024)
  })
}

export async function syncStripeLinks(
  customer: Stripe.Customer,
  subscription: Stripe.Subscription
) {
  let { metadata: cmetadata } = customer
  let linkedWith = cmetadata['linked-with'] || null
  let { metadata: smetadata } = subscription
  let includedIn = smetadata['included-in'] || null

  if (linkedWith && linkedWith.split(',').length === 1) {
    let [found] = await db
      .select()
      .from(members)
      .where(eq(members.id, customer.id))

    if (!found) {
      throw new TypeError(
        `linked customer not found in members ${customer.name} ${customer.id}`
      )
    }

    await db
      .update(members)
      .set({ linkedWith })
      .where(eq(members.id, customer.id))
  }

  if (includedIn) {
    let [found] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscription.id))

    if (!found) {
      throw new TypeError(
        `subscription not found in subscriptions ${subscription.id}`
      )
    }

    await db
      .update(subscriptions)
      .set({ includedIn })
      .where(eq(subscriptions.id, subscription.id))
  }
}

let run = process.argv[2] === 'run'
if (run) await main()
