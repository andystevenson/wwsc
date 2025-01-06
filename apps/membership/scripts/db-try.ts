import { stripe, Stripe } from '../src/stripe'
import { db, eq, subscriptions, payments, formatInvoice } from '../src/db'

let cus = process.argv[2]

if (!cus) {
  console.error('Usage: db-try <customer_id>')
  process.exit(1)
}

async function main() {
  let customer = (await stripe.customers.retrieve(cus)) as Stripe.Customer
  if (!customer) {
    console.error('Customer not found', cus)
    process.exit(1)
  }

  let invoices = await stripe.invoices.list({
    expand: ['data.charge'],
    customer: cus
  })
  let invoice = invoices.data[0]
  let finvoice = formatInvoice(customer, invoice)
  console.log({ invoice, finvoice })
}

await main()
