import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import { InsertPayment, SelectPayment, payments } from '../schema/payments'

export async function insertPayment(data: InsertPayment): Promise<void> {
  await db.insert(payments).values(data)
}

export async function updatePayment(
  id: SelectPayment['id'],
  data: Partial<Omit<SelectPayment, 'id'>>,
): Promise<SelectPayment[]> {
  const updatedPayment = await db
    .update(payments)
    .set(data)
    .where(eq(payments.id, id))
    .returning()
  return updatedPayment
}

export async function deletePayment(id: SelectPayment['id']): Promise<void> {
  await db.delete(payments).where(eq(payments.id, id))
}
