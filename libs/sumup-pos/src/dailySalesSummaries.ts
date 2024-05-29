/// <reference lib="dom" />
import { ProgressBar } from '@wwsc/lib-cli'
import { getTransactionByCode } from '@wwsc/lib-sumup-dashboard'
import type { Sale, PaymentHistory } from './Sale'
import { Big } from 'big.js'

export const dailySalesSummaries = async (sales: Sale[]) => {
  let summaries = sales.map((sale) => {
    const {
      id,
      sales_date_time,
      sales_details,
      sales_payments_history,
      sales_payments_card_history,
      register,
      staff,
    } = sale

    const sales_id = id

    const { total_before_line_discount, total, total_vat, total_ex_vat } =
      sales_details

    const payments = sales_payments_history.map((payment) => {
      const {
        id,
        payment_date_time: time,
        payment_method: method,
        payment_amount,
      } = payment

      const summary: PaymentHistory = {
        id,
        sales_id,
        method,
        time,
        amount: Big(payment_amount).round(2).toNumber(),
        fees: 0,
        card: null,
        entry: '',
        transaction_code: '',
      }
      return summary
    })

    payments.forEach((payment) => {
      const { method, id } = payment
      if (method !== 'SUMUP') return
      const cardPayment = sales_payments_card_history.find(
        (history) => history.sales_payment_id === id,
      )
      if (!cardPayment) {
        console.warn(`no ${method} payment history`, payment)
        return
      }

      payment.card = cardPayment.card_brand
      payment.entry = cardPayment.entry_mode
      payment.transaction_code = cardPayment.reference_number
    })

    const result = {
      id,
      register: register.register_name,
      staff: staff.staff_name,
      time: sales_date_time,
      total_before_discount: Big(total_before_line_discount)
        .round(2)
        .toNumber(),
      discount: Big(total_before_line_discount)
        .minus(total)
        .round(2)
        .toNumber(),
      total: Big(total).round(2).toNumber(),
      vat: Big(total_vat).round(2).toNumber(),
      net: Big(total_ex_vat).round(2).toNumber(),
      fees: 0, // filled in later
      refunds:
        Big(total).round(2).toNumber() < 0
          ? Big(total).times(-1).round(2).toNumber()
          : 0,
      payments_mismatch: Big(total)
        .minus(
          payments.reduce(
            (a, b) => Big(a).plus(b.amount).round(2).toNumber(),
            0,
          ),
        )
        .round(2)
        .toNumber(),
      payments,
    }

    return result
  })

  // display progress bar
  const bar = ProgressBar()

  const tracker = { transaction_code: '' }
  bar.start(summaries.length, 0, tracker)

  for (const summary of summaries) {
    for (const payment of summary.payments) {
      if (payment.method !== 'SUMUP') continue

      const transaction_code = payment.transaction_code

      if (!transaction_code) {
        console.warn('no transaction code', payment)
        continue
      }

      tracker.transaction_code = transaction_code
      const transaction = await getTransactionByCode(transaction_code)

      if (transaction.events) {
        for (const event of transaction.events) {
          summary.fees += event.fee_amount
          payment.fees += event.fee_amount
        }
      }
    }
    bar.increment()
  }

  bar.update(summaries.length)
  bar.stop()

  return summaries
}
