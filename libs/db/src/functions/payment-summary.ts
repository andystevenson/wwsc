import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import {
  InsertPaymentSummary,
  SelectPaymentSummary,
  paymentSummaries,
} from '../schema/payment-summaries'

export async function insertPaymentSummary(
  data: InsertPaymentSummary,
): Promise<void> {
  await db.insert(paymentSummaries).values(data)
}

export async function updatePaymentSummary(
  id: SelectPaymentSummary['id'],
  data: Partial<Omit<SelectPaymentSummary, 'id'>>,
): Promise<SelectPaymentSummary[]> {
  const updatedPaymentSummary = await db
    .update(paymentSummaries)
    .set(data)
    .where(eq(paymentSummaries.id, id))
    .returning()
  return updatedPaymentSummary
}

export async function deletePaymentSummary(
  id: SelectPaymentSummary['id'],
): Promise<void> {
  await db.delete(paymentSummaries).where(eq(paymentSummaries.id, id))
}
