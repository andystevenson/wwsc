import { Stripe } from 'stripe'
import { dayjs } from '@wwsc/lib-dates'
import { db, and, eq, events, type InsertEvent } from '../db'

export async function customerJoined(customer: Stripe.Customer) {
  let { metadata } = customer
  let { joined } = metadata

  let date = joined?.trim()
  if (!date || !dayjs(date).isValid()) return

  let event: InsertEvent = {
    type: 'joined',
    date,
    member: customer.id
  }

  // Check if the event on the same joined date already exists
  let [existing] = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.member, customer.id),
        eq(events.type, 'joined'),
        eq(events.date, date)
      )
    )

  if (existing) return

  // if it didn't exist or the date is different, insert the event
  await db
    .insert(events)
    .values(event)
    .onConflictDoUpdate({ target: [events.id], set: event })
}
