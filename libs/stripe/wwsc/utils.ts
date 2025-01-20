import { stripe } from './client'

export async function lookupKeyFromPrice(priceId: string) {
  let price = await stripe.prices.retrieve(priceId)
  let { product, unit_amount, recurring } = price

  let prices = await stripe.prices.search({
    query: `product:"${product}" active:"true"`,
    limit: 100
  })

  let found = prices.data.find((p) => {
    let ok =
      p.unit_amount === unit_amount &&
      p.recurring &&
      recurring &&
      p.recurring.interval === recurring.interval &&
      p.recurring.interval_count === recurring.interval_count

    return ok
  })

  if (!found)
    throw new TypeError(`no matching price lookup found for ${priceId}`)

  console.log('lookup key found', found.lookup_key, priceId)
  return found.lookup_key
}
