import { writeFileSync } from 'node:fs'
import { Stripe } from 'stripe'
import { stripe } from './client'
import env from './env'
import kebabCase from 'lodash.kebabcase'

const LOGPATH = env.LOGPATH

/**
 * List all active prices
 * @returns Stripe.Price[]
 */
export async function listActivePrices() {
  const prices = await stripe.prices
    .list({ limit: 100, active: true, expand: ['data.product'] })
    .autoPagingToArray({ limit: 10000 })
  return prices
}

/**
 * List all prices
 * @returns Stripe.Price[]
 */
export async function listAllPrices() {
  const prices = await stripe.prices
    .list({ limit: 100, expand: ['data.product'] })
    .autoPagingToArray({ limit: 10000 })
  return prices
}

/**
 * Format a price object into its useful parts
 * @param price
 * @returns FormattedPrice
 */

export type FormattedPrice = ReturnType<typeof formatPrice>
export function formatPrice(price: Stripe.Price) {
  let {
    id,
    active,
    nickname,
    lookup_key,
    unit_amount,
    currency,
    recurring,
    metadata,
    product
  } = price
  let amount = unit_amount ? unit_amount / 100 : 0
  let interval = recurring?.interval || ''
  let intervals = recurring?.interval_count || 0
  let p: Stripe.Product = product as Stripe.Product
  return {
    id,
    active,
    nickname,
    lookup_key,
    product: p.id,
    name: p.name.startsWith('+')
      ? p.name.toLowerCase()
      : kebabCase(p.name.toLowerCase()),
    amount,
    currency,
    interval,
    intervals,
    metadata
  }
}

/**
 * Get all active prices
 * @returns FormattedPrice[]
 */
export async function getActivePrices() {
  let prices = await listActivePrices()
  let result = prices.map((s) => formatPrice(s))
  writeFileSync(
    `${LOGPATH}/active-prices.json`,
    JSON.stringify(prices, null, 2)
  )
  writeFileSync(
    `${LOGPATH}/active-prices-formatted.json`,
    JSON.stringify(result, null, 2)
  )
  return result
}

/**
 * Get all prices
 * @returns FormattedPrice[]
 */
export async function getAllPrices() {
  let prices = await listAllPrices()
  let result = prices.map((s) => formatPrice(s))
  writeFileSync(`${LOGPATH}/all-prices.json`, JSON.stringify(prices, null, 2))
  writeFileSync(
    `${LOGPATH}/all-prices-formatted.json`,
    JSON.stringify(result, null, 2)
  )
  return result
}
