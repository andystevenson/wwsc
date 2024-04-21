import { readFileSync } from 'fs'

const posSales = JSON.parse(
  readFileSync('./json/summaries-2024-02-01.json', 'utf-8'),
)

let fees = posSales.reduce((acc, { fees }) => acc + fees, 0)
fees = +fees.toFixed(2)

let totalSumup = posSales.reduce((acc, { payments }) => {
  for (const payment of payments) {
    if (payment.method === 'SUMUP') {
      acc += payment.amount
    }
  }
  return acc
}, 0)

let count = posSales.reduce((acc, { payments }) => {
  for (const payment of payments) {
    if (payment.method === 'SUMUP') {
      acc = acc + 1
    }
  }
  return acc
}, 0)

console.log({ fees, totalSumup }, count, posSales.length)

const dashboardSales = JSON.parse(
  readFileSync('../sumup-dashboard/json/simplified-2024-02-01.json', 'utf-8'),
)
console.log(dashboardSales.length)
