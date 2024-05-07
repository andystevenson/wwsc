import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import { InsertSale, SelectSale, sales } from '../schema/sales'

export async function insertSale(data: InsertSale): Promise<void> {
  await db.insert(sales).values(data)
}

export async function updateSale(
  id: SelectSale['id'],
  data: Partial<Omit<SelectSale, 'id'>>,
): Promise<SelectSale[]> {
  const updatedSale = await db
    .update(sales)
    .set(data)
    .where(eq(sales.id, id))
    .returning()
  return updatedSale
}

export async function deleteSale(id: SelectSale['id']): Promise<void> {
  await db.delete(sales).where(eq(sales.id, id))
}
