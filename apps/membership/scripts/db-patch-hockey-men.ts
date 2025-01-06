import { db, eq, subscriptions, members, genders } from '../src/db'
import { stripe } from '../src/stripe'

async function main() {
  let found = await db
    .select({
      member: subscriptions.member,
      name: members.name,
      gender: genders.gender
    })
    .from(subscriptions)
    .where(eq(subscriptions.membership, 'hockey-inclusive-monthly'))
    .innerJoin(genders, eq(genders.id, subscriptions.member))
    .innerJoin(members, eq(subscriptions.member, members.id))

  for (let record of found) {
    await stripe.customers.update(record.member, {
      metadata: { gender: 'male' }
    })
  }

  console.log(found)
}

await main()
