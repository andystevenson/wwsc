import {
  db,
  eq,
  InsertMembership,
  Interval,
  memberships,
  Category
} from '../src/db/db'

import { getAllMembershipTypes } from '../src/stripe'

let membershipTypes = await getAllMembershipTypes()
console.log('all membership types:', membershipTypes.length)

let all = await Promise.all(
  membershipTypes.map((m) => {
    let { id: stripeProduct, description } = m

    return Promise.all(
      // @ts-ignore
      m.prices.map((p) => {
        const {
          id: stripePrice,
          name,
          lookup_key,
          interval,
          intervals,
          amount,
          metadata
        } = p
        let iterations = 1
        let { phases } = metadata
        if (phases) {
          let ps = JSON.parse(phases)
          for (let phase of ps) {
            let { iterations: iters } = phase
            if (iters) {
              iterations = iters
            }
          }
        }

        let { ignore } = metadata
        let membership: InsertMembership = {
          id: lookup_key || '',
          description: description || '',
          category: name as Category,
          effectiveDate: '2024-01-01',
          interval: interval as Interval,
          intervals,
          iterations,
          price: amount,
          status: ignore === 'true' ? 'withdrawn' : 'active'
        }
        return db.insert(memberships).values(membership)
      })
    )
  })
)

let phased = membershipTypes
  .map((m) => {
    // @ts-ignore
    let prices = m.prices.filter((p) => p.metadata.phases)
    return prices
  })
  .flat()

console.log('phased memberships:', phased.length)

let done = await Promise.all(
  phased.map(async (p) => {
    let { metadata, lookup_key } = p
    if (!lookup_key) throw new Error('phased: lookup_key not found')

    let { phases } = metadata
    let ps = JSON.parse(phases)
    let changeTo = null
    for (let phase of ps) {
      let { change } = phase
      if (change) {
        changeTo = change
      }
    }

    console.log(`phased: ${lookup_key} will change to ${changeTo}`)

    if (!changeTo) return
    let base = await db.query.memberships.findFirst({
      where: eq(memberships.id, lookup_key)
    })

    if (!base) throw new Error('phased: base membership not found')
    // console.log(`phased: linking base ${lookup_key} to ${changeTo}`);
    return db
      .update(memberships)
      .set({ then: changeTo })
      .where(eq(memberships.id, lookup_key))
  })
)
