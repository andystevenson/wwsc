import { SageCategories } from '../../../sync-sales/src/Types'
import { dayjs } from '@wwsc/lib-dates'

import {
  db,
  salesCategories,
  registerClosures,
  paymentSummaries,
} from '@wwsc/lib-db'
import { and, eq, gte, lt, ne, inArray } from 'drizzle-orm'

export const getDailyTakings = async (date: string) => {
  const categories = await getSageCategories(date)
  const closures = await getRegisterClosures(date)
  let refunds = await getRefunds(date)
  return { categories, closures, refunds }
}

export const getRegisterClosures = async (date: string) => {
  let followingDay = dayjs(date).add(1, 'day').format('YYYY-MM-DD')
  const closures = await db
    .select()
    .from(registerClosures)
    .where(
      and(
        gte(registerClosures.to, date),
        lt(registerClosures.to, followingDay),
        ne(registerClosures.variance, 0),
      ),
    )

  return closures
}

export const getRefunds = async (date: string) => {
  let followingDay = dayjs(date).add(1, 'day').format('YYYY-MM-DD')

  let refunds = await db
    .select()
    .from(paymentSummaries)
    .where(
      and(
        eq(paymentSummaries.type, 'SUMUP'),
        gte(paymentSummaries.date, date),
        lt(paymentSummaries.date, followingDay),
        ne(paymentSummaries.refunds, 0),
      ),
    )

  return refunds
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
        inArray(salesCategories.name, [...SageCategories, 'ALL']),
      ),
    )
  return categories
}
