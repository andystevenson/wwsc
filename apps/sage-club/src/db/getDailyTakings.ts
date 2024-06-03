import { SageCategories } from '../../../sync-sales/src/Types'

import { db, salesCategories } from '@wwsc/lib-db'
import { and, eq, inArray } from 'drizzle-orm'

export const getDailyTakings = async (date: string) => {
  const categories = await getSageCategories(date)
  return categories
}

/**
 * Get the Sage categories for a given date
 */

export const getSageCategories = async (date: string) => {
  const categories = await db
    .select()
    .from(salesCategories)
    .where(
      and(
        eq(salesCategories.date, date),
        inArray(salesCategories.name, [...SageCategories, 'BANK_CHARGES']),
      ),
    )
  return categories
}
