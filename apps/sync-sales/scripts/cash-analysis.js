import { argv } from 'bun'
import { readFileSync } from 'node:fs'

console.log('Cash analysis script')
const file = argv[2]
const sales = JSON.parse(readFileSync(file, 'utf8'))

let total = 0
for (const sale of sales) {
  if (sale.sales_payments.CASH) {
    console.log(sale.sales_payments)
    total += +sale.sales_payments.CASH.payment_total
  }
}

console.log('Total cash:', total)
