import { db, eq, members, subscriptions, payments } from './index'

export async function memberExists(id: string) {
  if (!id) return
  return db.query.members.findFirst({ where: eq(members.id, id) })
}

export async function subscriptionExists(id: string) {
  if (!id) return

  return db.query.subscriptions.findFirst({ where: eq(subscriptions.id, id) })
}

export async function paymentExists(id: string) {
  if (!id) return

  return db.query.payments.findFirst({ where: eq(payments.id, id) })
}
