import { env, Stripe, stripe, writeFileSync } from './client'
import { dayjs } from '@wwsc/lib-dates'

/**
 * List all active subscriptions
 * @returns Stripe.Subscription[]
 */

export async function listActiveSubscriptions() {
  const subscriptions = await stripe.subscriptions
    .list({
      // status: "active",
      // passing nothing returns all subscriptions not cancelled
      expand: ['data.customer', 'data.default_payment_method', 'data.schedule']
    })
    .autoPagingToArray({ limit: 10000 })
  return subscriptions
}

export async function listAllSubscriptions() {
  const subscriptions = await stripe.subscriptions
    .list({
      status: 'all',
      expand: ['data.customer', 'data.default_payment_method', 'data.schedule']
    })
    .autoPagingToArray({ limit: 10000 })
  return subscriptions
}
/**
 * Format a subscription object into its useful parts
 * @param subscription
 * @returns FormattedSubscription
 */

export type FormattedSubscription = ReturnType<typeof formatSubscription>
export function formatSubscription(subscription: Stripe.Subscription) {
  let {
    id,
    customer,
    created,
    status,
    cancel_at,
    canceled_at,
    cancel_at_period_end,
    cancellation_details,
    current_period_start,
    current_period_end,
    items,
    metadata: config,
    schedule
  } = subscription

  let amount = 0
  let interval = ''
  let intervals = 0
  let nickname = null
  let lookup_key = null
  let price = null
  let product = null
  let type = null
  let priceConfig = null
  if (items.data.length > 0) {
    if (items.data.length > 1) {
      console.warn(
        `Subscription ${id} has more than one item. Using the first one.`
      )
    }
    let item = items.data[0].price
    let {
      id: priceId,
      nickname: priceNickname,
      unit_amount,
      recurring,
      product: priceProduct,
      type: priceType,
      metadata: priceMetadata
    } = item
    price = priceId
    nickname = priceNickname
    amount = unit_amount ? unit_amount / 100 : 0
    interval = recurring?.interval || ''
    intervals = recurring?.interval_count || 0
    product = priceProduct
    lookup_key = item.lookup_key
    type = priceType
    priceConfig = priceMetadata
  }

  return {
    id,
    created,
    customer: formatCustomer(customer as Stripe.Customer),
    status,
    cancel:
      cancel_at && canceled_at
        ? {
            at: dayjs.unix(cancel_at).format(),
            period_end: cancel_at_period_end,
            canceled: dayjs.unix(canceled_at),
            ...cancellation_details
          }
        : null,
    current_period_start,
    current_period_end,
    price,
    type,
    amount,
    nickname,
    lookup_key,
    interval,
    intervals,
    product,
    priceConfig,
    schedule,
    config
  }
}

/**
 * Get all active subscriptions
 * @returns FormattedSubscription[]
 */
export async function getActiveSubscriptions() {
  let subscriptions = await listActiveSubscriptions()
  let result = subscriptions.map((s) => formatSubscription(s))
  writeFileSync(
    `${env.LOGPATH}/active-subscriptions.json`,
    JSON.stringify(subscriptions, null, 2)
  )
  writeFileSync(
    `${env.LOGPATH}/active-subscriptions-formatted.json`,
    JSON.stringify(result, null, 2)
  )
  return result
}

export async function getAllSubscriptions() {
  let subscriptions = await listAllSubscriptions()
  writeFileSync(
    `${env.LOGPATH}/all-subscriptions.json`,
    JSON.stringify(subscriptions, null, 2)
  )

  return subscriptions
}

export async function updateSubscriptionMetadata(
  id: string,
  metadata: Record<string, string>
) {
  return await stripe.subscriptions.update(id, { metadata })
}

export function formatSchedule(schedule: Stripe.SubscriptionSchedule) {}

export function formatCustomer(customer: Stripe.Customer) {
  let { id, email, name, address, metadata } = customer
  return { id, email, name, address, metadata }
}
