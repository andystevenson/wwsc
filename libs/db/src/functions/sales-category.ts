import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import {
  InsertSalesCategory,
  SelectSalesCategory,
  salesCategories,
} from '../schema/sales-categories'

export async function insertSalesCategory(
  data: InsertSalesCategory,
): Promise<void> {
  await db.insert(salesCategories).values(data)
}

export async function updateSalesCategory(
  id: SelectSalesCategory['id'],
  data: Partial<Omit<SelectSalesCategory, 'id'>>,
): Promise<SelectSalesCategory[]> {
  const updatedSalesCategory = await db
    .update(salesCategories)
    .set(data)
    .where(eq(salesCategories.id, id))
    .returning()
  return updatedSalesCategory
}

export async function deleteSalesCategory(
  id: SelectSalesCategory['id'],
): Promise<void> {
  await db.delete(salesCategories).where(eq(salesCategories.id, id))
}
