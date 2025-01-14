import { env, Stripe, stripe, writeFileSync } from './client'

/**
 * List all active products
 * @returns Stripe.Product[]
 */
export async function listActiveProducts() {
  const products = await stripe.products
    .list({ limit: 100, active: true })
    .autoPagingToArray({ limit: 10000 })
  return products
}

/**
 * List all products
 * @returns Stripe.Product[]
 */
export async function listAllProducts() {
  const products = await stripe.products
    .list({ limit: 100 })
    .autoPagingToArray({ limit: 10000 })
  return products
}
/**
 * Format a product object into its useful parts
 * @param product
 * @returns FormattedProduct
 */
export type FormattedProduct = ReturnType<typeof formatProduct>
export function formatProduct(product: Stripe.Product) {
  let { id, active, name, description, images, metadata } = product
  return { id, active, name, description, images, metadata }
}

/**
 * Get all active products
 * @returns FormattedProduct[]
 */
export async function getActiveProducts() {
  let products = await listActiveProducts()
  let result = products.map((s) => formatProduct(s))
  writeFileSync(
    `${env.LOGPATH}/active-products.json`,
    JSON.stringify(products, null, 2)
  )
  writeFileSync(
    `${env.LOGPATH}/active-products-formatted.json`,
    JSON.stringify(result, null, 2)
  )
  return result
}

/**
 * Get all products
 * @returns FormattedProduct[]
 */

export async function getAllProducts() {
  let products = await listAllProducts()
  let result = products.map((s) => formatProduct(s))
  writeFileSync(
    `${env.LOGPATH}/all-products.json`,
    JSON.stringify(products, null, 2)
  )
  writeFileSync(
    `${env.LOGPATH}/all-products-formatted.json`,
    JSON.stringify(result, null, 2)
  )
  return result
}

/**
 * Get all membership types
 * @returns MembershipTypePrice[]
 */

export type MembershipTypePrice = ReturnType<typeof formatMembershipPrice>
export function formatMembershipPrice(
  price: Stripe.Price,
  p: FormattedProduct
) {
  let { id, active, nickname, lookup_key, unit_amount, recurring, metadata } =
    price
  let amount = unit_amount ? unit_amount / 100 : 0
  let interval = recurring?.interval || ''
  let intervals = recurring?.interval_count || 0
  let pAmount = amount ? `£${amount.toFixed(2)}` : 'free'
  return {
    id,
    name: p.name.toLowerCase().replace(' ', '-'),
    description: `${p.description || ''}`,
    active,
    nickname,
    lookup_key,
    amount,
    interval,
    intervals,
    metadata
  }
}

/**
 * Get all active prices
 * @returns MembershipTypes
 */
type MembershipTypes = Awaited<ReturnType<typeof getAllMembershipTypes>>

export async function getAllMembershipTypes(activeOnly: boolean = true) {
  let products = await getAllProducts()
  let memberships = products.filter((p) => p.metadata.membership === 'true')

  for (const m of memberships) {
    let prices = await stripe.prices.search({
      query: `product: "${m.id}"`,
      limit: 100
    })

    // @ts-ignore
    m.prices = prices.data
      .filter(
        (p) =>
          (activeOnly && p.active && p.nickname === p.lookup_key) || !activeOnly
      )
      .map((p) => formatMembershipPrice(p, m))
  }
  // let result = await Promise.all(
  //   memberships.map(async (m) => {
  //     let { id, name } = m
  //     let prices = await stripe.prices.search({
  //       query: `product: "${id}"`,
  //       limit: 100
  //     })
  //     return {
  //       ...m,
  //       prices: prices.data
  //         .filter(
  //           (p) =>
  //             (activeOnly && p.active && p.nickname === p.lookup_key) ||
  //             !activeOnly
  //         )
  //         .map((p) => formatMembershipPrice(p, m))
  //     }
  //   })
  // )

  let result = memberships
  await checkMembershipTypes(result)
  writeFileSync(
    `${env.LOGPATH}/membership-types.json`,
    JSON.stringify(result, null, 2)
  )
  return result
}

export async function checkMembershipTypes(types: MembershipTypes) {
  for (const membership of types) {
    // @ts-ignore
    const { active, name, prices } = membership
    if (!active) {
      console.error(`membership ${name} is not active`)
      continue
    }
    console.log(`membership ${name} is active`)
    // @ts-ignore§
    await Promise.all(prices.map((p) => checkMembershipPrice(p)))
  }
}

// @ts-ignore
type MembershipPrice = MembershipTypes[number]['prices'][number]

/**
 * Check if a membership price is inactive
 * @param price
 */
export function checkMembershipInactivePrice(price: MembershipPrice) {
  const { id, active, nickname, lookup_key, metadata } = price
  if (active) {
    console.error(`price ${nickname} / ${id} is active`)
  }

  if (nickname && nickname !== 'DO NOT USE') {
    console.error(`price ${nickname} / ${id} is not named correctly`)
  }

  if (lookup_key) {
    console.error(
      `price ${nickname} / ${id} lookup_key ${lookup_key} should be empty`
    )
  }

  if (Object.keys(metadata).length > 0) {
    console.error(`price ${nickname} / ${id} metadata should be empty`)
  }
}

/**
 * Check if a membership price is valid
 * @param price
 * @returns
 */

export async function checkMembershipPrice(price: MembershipPrice) {
  const { active, nickname, lookup_key, interval, intervals, metadata } = price
  if (!active) {
    return checkMembershipInactivePrice(price)
  }

  if (!nickname || !lookup_key) {
    console.error(`price ${nickname} is not named correctly ${lookup_key}`)
    return
  }

  if (!nickname.includes(interval)) {
    console.error(`price ${nickname} nickname is missing interval ${interval}`)
  }

  if (!intervals) {
    console.error(`price ${nickname} is missing intervals`)
  }

  if (!metadata) {
    console.error(`price ${nickname} is missing metadata`)
  }

  const { campaign, phases } = metadata
  if (!campaign) {
    console.error(`price ${nickname} is missing campaign`)
    return
  }

  if (!campaign.includes(interval)) {
    console.error(
      `price ${nickname} campaign ${campaign} is missing interval ${interval}`
    )
  }

  if (phases) {
    try {
      let ps = JSON.parse(phases)
      if (!Array.isArray(ps)) {
        console.error(`price ${nickname} phases is not an array`)
        return
      }

      for (const phase of ps) {
        const { iterations, change } = phase
        if (!iterations && !change) {
          console.error(`price ${nickname} phase %o`, phase)
          continue
        }

        if (iterations) {
          let n = Number(iterations)
          if (isNaN(n) || n < 0 || !Number.isInteger(n)) {
            console.error(
              `price ${nickname} phase iterations ${iterations} is invalid`
            )
          }
        }

        if (change) {
          let next = await stripe.prices.search({
            query: `lookup_key: "${change}"`
          })
          if (!next || next.data.length !== 1) {
            console.error(`price ${nickname} phase change ${change} not found`)
          }
        }
      }
    } catch (error) {
      console.error(`price ${nickname} phases is not valid JSON`)
    }
  }
}

export async function getAllClasses() {
  let products = await getAllProducts()
  let classes = products.filter((p) => p.metadata.classes === 'true')

  writeFileSync(
    `${env.LOGPATH}/classes-types.json`,
    JSON.stringify(classes, null, 2)
  )
  return classes
}

export async function getAllVisitors() {
  let products = await getAllProducts()
  let classes = products.filter((p) => p.metadata.visitors === 'true')

  writeFileSync(
    `${env.LOGPATH}/visitor-types.json`,
    JSON.stringify(classes, null, 2)
  )
  return classes
}
