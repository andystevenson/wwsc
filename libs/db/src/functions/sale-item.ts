import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import { InsertSaleItem, SelectSaleItem, saleItems } from '../schema/sale-items'

export async function insertSaleItem(data: InsertSaleItem): Promise<void> {
  await db.insert(saleItems).values(data)
}

export async function updateSaleItem(
  id: SelectSaleItem['id'],
  data: Partial<Omit<SelectSaleItem, 'id'>>,
): Promise<SelectSaleItem[]> {
  const updatedSaleItem = await db
    .update(saleItems)
    .set(data)
    .where(eq(saleItems.id, id))
    .returning()
  return updatedSaleItem
}

export async function deleteSaleItem(id: SelectSaleItem['id']): Promise<void> {
  await db.delete(saleItems).where(eq(saleItems.id, id))
}
