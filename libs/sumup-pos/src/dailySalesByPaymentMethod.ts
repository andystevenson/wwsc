/// <reference lib="dom" />

import type {
  DailySummary,
  PayoutSummary,
  PaymentHistory,
  SaleSummary,
} from './Sale'
import { Big } from 'big.js'

const DefaultPayoutSummary: PayoutSummary = {
  count: 0,
  total_before_discount: 0,
  discount: 0,
  total: 0,
  vat: 0,
  net: 0,
  fees: 0,
  refunds: 0,
  transactions: new Set(),
}

const handleZeroSale = (payout: PayoutSummary, payment: PaymentHistory) => {
  let n = 0
  n = payout.total_before_discount
  n = Big(n).plus(payment.amount).round(2).toNumber()
  payout.total_before_discount = n

  //! discounts do not apply to 0 value sales

  n = payout.total
  n = Big(n).plus(payment.amount).round(2).toNumber()
  payout.total = n

  //! vat does not apply to 0 value sales

  //! net is adjusted by the full value of the payment in a zero value sale
  n = payout.net
  n = Big(n).plus(payment.amount).round(2).toNumber()
  payout.net = n

  //! fees may still apply in a zero value sale
  n = payout.fees
  n = Big(n).plus(payment.fees).toNumber()
  payout.fees = n

  //! refunds apply if the payment is negative
  if (payment.amount < 0) {
    n = payout.refunds
    n = Big(n).plus(payment.amount).round(2).toNumber()
    payout.refunds = n
  }

  payout.count = payout.transactions.size
  return payout
}

const handleRefund = (payout: PayoutSummary, payment: PaymentHistory) => {
  let n = 0

  n = payout.refunds
  n = Big(n).plus(payment.amount).round(2).toNumber()
  payout.refunds = n

  // n = payout.fees
  // n = Big(n).plus(payment.fees).round(2).toNumber()
  // payout.fees = n

  return payout
}

export const dailySalesByPaymentMethod = async (summaries: SaleSummary[]) => {
  const dailySummary: DailySummary = {
    date: summaries[0]?.time,
    SUMUP: structuredClone(DefaultPayoutSummary),
    CASH: structuredClone(DefaultPayoutSummary),
    CARD: structuredClone(DefaultPayoutSummary),
    VOUCHER: structuredClone(DefaultPayoutSummary),
  }

  for (const summary of summaries) {
    for (const payment of summary.payments) {
      const method = payment.method
      let n = 0
      let payout = dailySummary[method]

      payout.count++

      const ratio =
        summary.total > 0 || summary.total < 0
          ? Big(payment.amount).div(summary.total).round(2).toNumber()
          : 0

      // super important to understand this
      if (ratio === 0) {
        handleZeroSale(payout, payment)
        continue
      }

      // handle refunds
      if (payment.amount < 0) {
        handleRefund(payout, payment)
        continue
      }

      n = payout.total_before_discount
      n = Big(n)
        .plus(Big(ratio).times(summary.total_before_discount))
        .round(2)
        .toNumber()
      payout.total_before_discount = n

      n = payout.discount
      n = Big(n).plus(Big(ratio).times(summary.discount)).round(2).toNumber()
      payout.discount = n

      n = payout.total
      n = Big(n).plus(payment.amount).round(2).toNumber()
      payout.total = n

      n = payout.vat
      n = Big(n).plus(Big(ratio).times(summary.vat)).round(2).toNumber()
      payout.vat = n

      n = payout.net
      n = Big(n).plus(Big(ratio).times(summary.net)).round(2).toNumber()
      payout.net = n

      n = payout.fees
      n = Big(n).plus(payment.fees).round(2).toNumber()
      payout.fees = n

      if (method === 'SUMUP') {
        payout.transactions.add(payment.transaction_code) // unique transactions
        payout.count = payout.transactions.size
      }
    }
  }

  return dailySummary
}
