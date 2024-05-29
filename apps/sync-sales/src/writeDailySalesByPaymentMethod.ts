import { writeFileSync } from 'node:fs'
import { dayjs } from '@wwsc/lib-dates'

import {
  dailySalesByPaymentMethod,
  PaymentMethod,
  type SaleSummary,
} from '@wwsc/lib-sumup-pos'

import { insertPaymentSummary, InsertPaymentSummary } from '@wwsc/lib-db'
import { nanoid } from 'nanoid'

export const writeDailySalesByPaymentMethod = async (
  summaries: SaleSummary[],
  directory: string,
) => {
  const payments = await dailySalesByPaymentMethod(summaries)
  let file = `${directory}/payment-methods.json`
  writeFileSync(file, JSON.stringify(payments, null, 2))

  const date = dayjs(payments.date).format('YYYY-MM-DD')

  for (let method of ['CASH', 'SUMUP', 'CARD', 'VOUCHER']) {
    const type = method as PaymentMethod
    const paymentSummary: InsertPaymentSummary = {
      id: `paymentSummary-${nanoid()}`,
      date,
      type,
      count: payments[type].count,
      total_before_discount: payments[type].total_before_discount,
      discount: payments[type].discount,
      total: payments[type].total,
      vat: payments[type].vat,
      net: payments[type].net,
      fees: payments[type].fees,
      refunds: payments[type].refunds,
    }

    // await insertPaymentSummary(paymentSummary)
  }

  return payments
}
