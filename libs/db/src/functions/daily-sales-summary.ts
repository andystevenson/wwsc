import { eq } from 'drizzle-orm'
import { db } from '../client.js'
import {
  InsertDailySalesSummary,
  SelectDailySalesSummary,
  dailySalesSummaries,
} from '../schema/daily-sales-summaries'

export async function insertDailySalesSummary(
  data: InsertDailySalesSummary,
): Promise<void> {
  await db.insert(dailySalesSummaries).values(data)
}

export async function updateDailySalesSummary(
  id: SelectDailySalesSummary['id'],
  data: Partial<Omit<SelectDailySalesSummary, 'id'>>,
): Promise<SelectDailySalesSummary[]> {
  const updatedDailySalesSummary = await db
    .update(dailySalesSummaries)
    .set(data)
    .where(eq(dailySalesSummaries.id, id))
    .returning()
  return updatedDailySalesSummary
}

export async function deleteDailySalesSummary(
  id: SelectDailySalesSummary['id'],
): Promise<void> {
  await db.delete(dailySalesSummaries).where(eq(dailySalesSummaries.id, id))
}
