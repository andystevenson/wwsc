import { readFileSync } from 'fs'
import { date } from '@wwsc/dates'

let from = date('2024-01-01').startOf('day')

while (from.isBefore('2024-04-01')) {
  const fromFormat = from.format('YYYY-MM-DD')
  console.log(fromFormat)

  const dailyByMethod = JSON.parse(
    readFileSync(`./json/daily-by-method-${fromFormat}.json`, 'utf-8'),
  )

  const salesItems = JSON.parse(
    readFileSync(`./json/sales-items-${fromFormat}.json`),
    'utf-8',
  )

  const cash = +salesItems
    .reduce((acc, item) => (acc = acc + item.cash), 0)
    .toFixed(2)
  const sumup = +salesItems
    .reduce((acc, item) => (acc = acc + item.sumup), 0)
    .toFixed(2)
  const card = +salesItems
    .reduce((acc, item) => (acc = acc + item.card), 0)
    .toFixed(2)
  const voucher = +salesItems
    .reduce((acc, item) => (acc = acc + item.voucher), 0)
    .toFixed(2)
  const total = cash + sumup + card + voucher

  if (dailyByMethod.CASH.total !== cash)
    console.log(`Cash: ${dailyByMethod.CASH.total} !== ${cash}`)
  if (dailyByMethod.SUMUP.total !== sumup)
    console.log(`Sumup: ${dailyByMethod.SUMUP.total} !== ${sumup}`)
  if (dailyByMethod.CARD.total !== card)
    console.log(`Card: ${dailyByMethod.CARD.total} !== ${card}`)
  if (dailyByMethod.VOUCHER.total !== voucher)
    console.log(`Voucher: ${dailyByMethod.VOUCHER.total} !== ${voucher}`)

  if (
    total !==
    dailyByMethod.CASH.total +
      dailyByMethod.SUMUP.total +
      dailyByMethod.CARD.total +
      dailyByMethod.VOUCHER.total
  ) {
    console.log(
      `Total: ${total} !== ${
        dailyByMethod.CASH.total +
        dailyByMethod.SUMUP.total +
        dailyByMethod.CARD.total +
        dailyByMethod.VOUCHER.total
      }`,
    )
  }
  from = from.add(1, 'day')
}
