import { Stripe } from 'stripe'
import {
  db,
  eq,
  subscriptions,
  membershipFromLookupKey,
  subscriptionExists
} from '../db'
import type { UpdateSubscription, CollectionBehaviour } from '../db'
import { dayjs } from '@wwsc/lib-dates'
import { lookupKeyFromPrice } from '@lib/stripe/wwsc'

export async function updateSubscription(subscription: Stripe.Subscription) {
  let exists = await subscriptionExists(subscription.id)
  if (!exists) return

  let { customer } = subscription
  let customerId = typeof customer === 'string' ? customer : customer.id

  let {
    id,
    status,
    current_period_start,
    current_period_end,
    cancel_at,
    canceled_at,
    cancel_at_period_end,
    cancellation_details,
    pause_collection,
    items,
    start_date,
    collection_method,
    metadata
  } = subscription

  let { price } = items.data[0]
  let { id: priceId, lookup_key, recurring } = price

  let started = dayjs.unix(start_date).format('YYYY-MM-DD')
  let phaseStart = dayjs.unix(current_period_start).format('YYYY-MM-DD')
  let phaseEnd = dayjs.unix(current_period_end).format('YYYY-MM-DD')
  let cancelAt = cancel_at ? dayjs.unix(cancel_at).format('YYYY-MM-DD') : null
  let canceledAt = canceled_at
    ? dayjs.unix(canceled_at).format('YYYY-MM-DD')
    : null
  let cancelAtPeriodEnd = cancel_at_period_end ? true : false
  let reason = cancellation_details
    ? Object.values(cancellation_details)
        .filter((v) => v)
        .join(',')
    : null

  let ends = phaseEnd
  if (cancelAt) ends = cancelAt
  if (canceledAt && !cancelAtPeriodEnd) ends = canceledAt

  if (!lookup_key) {
    lookup_key = await lookupKeyFromPrice(priceId)
  }

  if (!lookup_key)
    throw new TypeError(`no lookup key found for priceId ${priceId}`)

  if (!recurring)
    throw new TypeError(
      `all subscriptions should be recurring ${customerId} ${id}`
    )

  let membership = await membershipFromLookupKey(lookup_key)

  let includedIn = metadata?.['included-in'] || null

  let insertSubscription: UpdateSubscription = {
    member: customerId,
    membership,
    payment: collection_method,
    status,
    started,
    phaseStart,
    phaseEnd,
    cancelAt,
    canceledAt,
    cancelAtPeriodEnd,
    reason,
    collectionPaused: pause_collection ? true : false,
    collectionBehavior: pause_collection
      ? (pause_collection.behavior as CollectionBehaviour)
      : null,
    collectionResumes:
      pause_collection && pause_collection.resumes_at
        ? dayjs.unix(pause_collection.resumes_at).format('YYYY-MM-DD')
        : null,
    ends,
    includedIn
  }

  await db
    .update(subscriptions)
    .set(insertSubscription)
    .where(eq(subscriptions.id, id))
}
