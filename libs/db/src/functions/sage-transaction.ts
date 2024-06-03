import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import {
  InsertSageTransaction,
  SelectSageTransaction,
  sageTransactions,
} from '../schema/sage-transactions'

export async function insertSageTransaction(
  data: InsertSageTransaction,
): Promise<void> {
  await db.insert(sageTransactions).values(data)
}

export async function updateSageTransaction(
  id: SelectSageTransaction['id'],
  data: Partial<Omit<SelectSageTransaction, 'id'>>,
): Promise<SelectSageTransaction[]> {
  const updatedSageTransaction = await db
    .update(sageTransactions)
    .set(data)
    .where(eq(sageTransactions.id, id))
    .returning()
  return updatedSageTransaction
}

export async function deleteSageTransaction(
  id: SelectSageTransaction['id'],
): Promise<void> {
  await db.delete(sageTransactions).where(eq(sageTransactions.id, id))
}
