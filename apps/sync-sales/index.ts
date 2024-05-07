import { dayjs } from '@wwsc/dates'
import { login, logout } from '@wwsc/sumup-pos'
import {
  sales,
  summarizeSales,
  dailySalesByMethod,
  dailySalesItems,
  dailySalesSummaries,
} from '@wwsc/sumup-pos'

import type { DailySummary, DailySummarySales } from '@wwsc/sumup-pos'

import { writeFileSync, mkdirSync } from 'node:fs'
import { oraPromise as spinner } from 'ora'
import { db, insertSale, insertPayment, insertSaleItem } from '@wwsc/db'
await login()

let start = dayjs('2024-04').startOf('month')
let end = start.add(1, 'day')
// let end = start.add(1, 'month')
//
let from = start

const payouts: DailySummary[] = []

while (from.isBefore(end)) {
  console.log(from.format('YYYY-MM-DD'))
  const date = from.format('YYYY-MM-DD')
  const directory = `./json/${date}`
  mkdirSync(directory, { recursive: true })

  const salesData = await spinner(sales(from), {
    text: 'Fetching sales...',
    successText: 'Sales fetched',
    color: 'green',
  })

  let file = `${directory}/sales.json`
  writeFileSync(file, JSON.stringify(salesData, null, 2))

  const summaries = await summarizeSales(salesData)
  file = `${directory}/summaries.json`
  writeFileSync(file, JSON.stringify(summaries, null, 2))

  // for (const summary of summaries) {
  //   await insertSale(summary)
  //   for (const payment of summary.payments) {
  //     await insertPayment(payment)
  //   }
  // }

  const dailyByMethod = await dailySalesByMethod(summaries)
  file = `${directory}/daily.json`
  writeFileSync(file, JSON.stringify(dailyByMethod, null, 2))

  const salesItems = await spinner(dailySalesItems(salesData), {
    text: 'Generating sales items...',
    successText: 'Sales items generated',
    color: 'green',
  })

  file = `${directory}/items.json`
  writeFileSync(file, JSON.stringify(salesItems, null, 2))

  // for (const item of salesItems) {
  //   await insertSaleItem(item)
  // }

  const dailySummaries = dailySalesSummaries(summaries, salesItems)

  console.log(dailySummaries)
  checkDailySummaries(dailySummaries)
  payouts.push(dailyByMethod)

  from = from.add(1, 'day')
}

const file = `./json/${start.format('YYYY-MM')}-payouts.json`
writeFileSync(file, JSON.stringify(payouts, null, 2))

await logout()

function checkDailySummaries(summaries: DailySummarySales[]) {
  const all = summaries.find((s) => s.scope === 'ALL')
  if (!all) return

  const registers = summaries.filter((s) => s.scope === 'REGISTER')
  const staff = summaries.filter((s) => s.scope === 'STAFF')
  const products = summaries.filter((s) => s.scope === 'PRODUCT')
  const parent_categories = summaries.filter(
    (s) => s.scope === 'PARENT_CATEGORY',
  )
  const categories = summaries.filter((s) => s.scope === 'CATEGORY')
  const cashs = summaries.filter((s) => s.scope === 'CASH')
  const sumups = summaries.filter((s) => s.scope === 'SUMUP')
  const cards = summaries.filter((s) => s.scope === 'CARD')
  const vouchers = summaries.filter((s) => s.scope === 'VOUCHER')

  checkAllTotalsMatch(all, registers)
  checkAllTotalsMatch(all, staff)
  checkAllTotalsMatch(all, products)
  checkAllTotalsMatch(all, parent_categories)
  checkAllTotalsMatch(all, categories)
  checkAllTotalsMatch(all, [...cashs, ...sumups, ...cards, ...vouchers])
}

function checkAllTotalsMatch(
  all: DailySummarySales,
  scope: DailySummarySales[],
) {
  if (scope.length === 0) return

  const template: DailySummarySales = structuredClone(all)
  template.scope = scope[0].scope
  template.quantity =
    template.gross =
    template.discount =
    template.total =
    template.vat =
    template.net =
    template.cash =
    template.sumup =
    template.card =
    template.voucher =
      0

  for (const s of scope) {
    template.quantity = +(template.quantity + s.quantity).toFixed(2)
    template.gross = +(template.gross + s.gross).toFixed(2)
    template.discount = +(template.discount + s.discount).toFixed(2)
    template.total = +(template.total + s.total).toFixed(2)
    template.vat = +(template.vat + s.vat).toFixed(2)
    template.net = +(template.net + s.net).toFixed(2)
    template.cash = +(template.cash + s.cash).toFixed(2)
    template.sumup = +(template.sumup + s.sumup).toFixed(2)
    template.card = +(template.card + s.card).toFixed(2)
    template.voucher = +(template.voucher + s.voucher).toFixed(2)
  }

  if (template.quantity !== all.quantity) {
    console.log('Quantity mismatch', template.quantity, all.quantity)
  }

  if (template.gross !== all.gross) {
    console.log('Gross mismatch', template.scope, template.gross, all.gross)
  }

  if (template.discount !== all.discount) {
    console.log(
      'Discount mismatch',
      template.scope,
      template.discount,
      all.discount,
    )
  }

  if (template.total !== all.total) {
    console.log('Total mismatch', template.scope, template.total, all.total)
  }

  if (template.vat !== all.vat) {
    console.log('VAT mismatch', template.scope, template.vat, all.vat)
  }

  if (template.net !== all.net) {
    console.log('Net mismatch', template.scope, template.net, all.net)
  }

  if (template.cash !== all.cash) {
    console.log('Cash mismatch', template.scope, template.cash, all.cash)
  }

  if (template.sumup !== all.sumup) {
    console.log('Sumup mismatch', template.scope, template.sumup, all.sumup)
  }

  if (template.card !== all.card) {
    console.log('Card mismatch', template.scope, template.card, all.card)
  }

  if (template.voucher !== all.voucher) {
    console.log(
      'Voucher mismatch',
      template.scope,
      template.voucher,
      all.voucher,
    )
  }

  console.log('Totals match', template.scope, all.scope)
}
