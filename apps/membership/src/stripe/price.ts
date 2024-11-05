import { env, Stripe, stripe, writeFileSync } from "./client";

/**
 * List all active prices
 * @returns Stripe.Price[]
 */
export async function listActivePrices() {
  const prices = await stripe.prices
    .list({ limit: 100, active: true })
    .autoPagingToArray({ limit: 10000 });
  return prices;
}

/**
 * List all prices
 * @returns Stripe.Price[]
 */
export async function listAllPrices() {
  const prices = await stripe.prices
    .list({ limit: 100 })
    .autoPagingToArray({ limit: 10000 });
  return prices;
}

/**
 * Format a price object into its useful parts
 * @param price
 * @returns FormattedPrice
 */
export type FormattedPrice = ReturnType<typeof formatPrice>;
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
  } = price;
  let amount = unit_amount ? unit_amount / 100 : 0;
  let interval = recurring?.interval || "";
  let iterations = recurring?.interval_count || 0;
  return {
    id,
    active,
    nickname,
    lookup_key,
    amount,
    currency,
    interval,
    iterations,
    metadata,
  };
}

/**
 * Get all active prices
 * @returns FormattedPrice[]
 */
export async function getActivePrices() {
  let prices = await listActivePrices();
  let result = prices.map((s) => formatPrice(s));
  writeFileSync(
    `${env.LOGPATH}/active-prices.json`,
    JSON.stringify(prices, null, 2),
  );
  writeFileSync(
    `${env.LOGPATH}/active-prices-formatted.json`,
    JSON.stringify(result, null, 2),
  );
  return result;
}

/**
 * Get all prices
 * @returns FormattedPrice[]
 */
export async function getAllPrices() {
  let prices = await listAllPrices();
  let result = prices.map((s) => formatPrice(s));
  writeFileSync(
    `${env.LOGPATH}/all-prices.json`,
    JSON.stringify(prices, null, 2),
  );
  writeFileSync(
    `${env.LOGPATH}/all-prices-formatted.json`,
    JSON.stringify(result, null, 2),
  );
  return result;
}
