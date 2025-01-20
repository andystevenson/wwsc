import { stripe } from '@lib/stripe/wwsc'

async function listSubscriptions() {
  for await (const subscription of stripe.subscriptions.list({
    status: 'all'
  })) {
    let { id, customer, status } = subscription
    console.log('subscription:', id, customer, status)
  }
}

async function listCustomers() {
  for await (const customer of stripe.customers.list()) {
    let { id, name, email } = customer
    console.log('customer:', id, name, email)
  }
}
async function firstSubscriptions() {
  let { data } = await stripe.subscriptions.list({ status: 'all' })
  console.log('first subscription:', { data })
}

async function main() {
  await listSubscriptions()
  await firstSubscriptions()
  await listCustomers()
}

await main()
