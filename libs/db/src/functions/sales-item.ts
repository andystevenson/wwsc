import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import {
  InsertSalesItem,
  SelectSalesItem,
  salesItems,
} from '../schema/sales-items.js'

export async function insertSalesItem(data: InsertSalesItem): Promise<void> {
  await db.insert(salesItems).values(data)
}

export async function updateSalesItem(
  id: SelectSalesItem['id'],
  data: Partial<Omit<SelectSalesItem, 'id'>>,
): Promise<SelectSalesItem[]> {
  const updatedSaleItem = await db
    .update(salesItems)
    .set(data)
    .where(eq(salesItems.id, id))
    .returning()
  return updatedSaleItem
}

export async function deleteSalesItem(
  id: SelectSalesItem['id'],
): Promise<void> {
  await db.delete(salesItems).where(eq(salesItems.id, id))
}
