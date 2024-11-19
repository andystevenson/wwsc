import { env, Stripe, stripe, writeFileSync } from "./client";

/**
 * List all active subscriptions
 * @returns Stripe.Subscription[]
 */

export async function listActiveSubscriptions() {
  const subscriptions = await stripe.subscriptions
    .list({
      status: "active",
      expand: ["data.customer", "data.default_payment_method", "data.schedule"],
    })
    .autoPagingToArray({ limit: 10000 });
  return subscriptions;
}

/**
 * Format a subscription object into its useful parts
 * @param subscription
 * @returns FormattedSubscription
 */

export type FormattedSubscription = ReturnType<typeof formatSubscription>;
export function formatSubscription(subscription: Stripe.Subscription) {
  let {
    id,
    customer,
    created,
    status,
    cancel_at,
    cancellation_details,
    current_period_start,
    current_period_end,
    items,
    metadata: config,
    schedule,
  } = subscription;
  let address = null;
  let name = null;
  let email = null;
  let customerConfig = null;
  if (typeof customer === "object" && "address" in customer) {
    address = customer.address;
    name = customer.name;
    email = customer.email;
    customerConfig = customer.metadata;
  }

  let amount = 0;
  let interval = "";
  let count = 0;
  let nickname = null;
  let lookup_key = null;
  let price = null;
  let product = null;
  let type = null;
  let priceConfig = null;
  if (items.data.length > 0) {
    if (items.data.length > 1) {
      console.warn(
        `Subscription ${id} has more than one item. Using the first one.`,
      );
    }
    let item = items.data[0].price;
    let {
      id: priceId,
      nickname: priceNickname,
      unit_amount,
      recurring,
      product: priceProduct,
      type: priceType,
      metadata: priceMetadata,
    } = item;
    price = priceId;
    nickname = priceNickname;
    amount = unit_amount ? unit_amount / 100 : 0;
    interval = recurring?.interval || "";
    count = recurring?.interval_count || 0;
    product = priceProduct;
    lookup_key = item.lookup_key;
    type = priceType;
    priceConfig = priceMetadata;
  }

  return {
    id,
    created,
    name,
    email,
    address,
    customerConfig,
    status,
    cancel_at,
    cancellation_details,
    current_period_start,
    current_period_end,
    price,
    type,
    amount,
    nickname,
    lookup_key,
    interval,
    count,
    product,
    priceConfig,
    schedule,
    config,
  };
}

/**
 * Get all active subscriptions
 * @returns FormattedSubscription[]
 */
export async function getActiveSubscriptions() {
  let subscriptions = await listActiveSubscriptions();
  let result = subscriptions.map((s) => formatSubscription(s));
  writeFileSync(
    `${env.LOGPATH}/active-subscriptions.json`,
    JSON.stringify(subscriptions, null, 2),
  );
  writeFileSync(
    `${env.LOGPATH}/active-subscriptions-formatted.json`,
    JSON.stringify(result, null, 2),
  );
  return result;
}

export async function updateSubscriptionMetadata(
  id: string,
  metadata: Record<string, string>,
) {
  return await stripe.subscriptions.update(id, { metadata });
}
