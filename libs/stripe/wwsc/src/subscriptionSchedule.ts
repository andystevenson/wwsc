import { writeFileSync } from 'node:fs'
import { Stripe } from 'stripe'
import { stripe } from './client'

const LOGPATH = process.env.LOGPATH
if (!LOGPATH) {
  throw new TypeError('LOGPATH env var missing')
}
/**
 * List all active subscriptionSchedules
 * @returns Stripe.SubscriptionSchedule[]
 */

export async function listSubscriptionSchedules() {
  const subscriptionSchedules = await stripe.subscriptionSchedules
    .list({ limit: 100 })
    .autoPagingToArray({ limit: 10000 })
  return subscriptionSchedules
}

/**
 * Format a subscription object into its useful parts
 * @param subscription
 * @returns FormattedSubscriptionSchedule
 */

export type FormattedSubscriptionSchedule = ReturnType<
  typeof formatSubscriptionSchedule
>
export function formatSubscriptionSchedule(
  subscription: Stripe.SubscriptionSchedule
) {
  let { id, customer, created, status, phases, current_phase } = subscription
  return {
    id,
    created,
    status,
    customer,
    current_phase,
    phases
  }
}

/**
 * Get all active subscriptionSchedules
 * @returns FormattedSubscriptionSchedule[]
 */
export async function getSubscriptionSchedules() {
  let subscriptionSchedules = await listSubscriptionSchedules()
  let result = subscriptionSchedules.map((s) => formatSubscriptionSchedule(s))
  writeFileSync(
    `${LOGPATH}/all-subscription-schedules.json`,
    JSON.stringify(subscriptionSchedules, null, 2)
  )
  writeFileSync(
    `${LOGPATH}/all-subscription-schedules-formatted.json`,
    JSON.stringify(result, null, 2)
  )
  return result
}
