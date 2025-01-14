import { db, eq, members, subscriptions, genders, memberships } from '../src/db'
const all = await db
  .select({
    id: members.id,
    name: members.name,
    gender: genders.gender,
    other: genders.other,
    email: members.email,
    mobile: members.mobile,
    category: memberships.category,
    interval: memberships.interval,
    price: memberships.price,
    status: subscriptions.status,
    ends: subscriptions.ends
  })
  .from(subscriptions)
  .innerJoin(members, eq(members.id, subscriptions.member))
  .innerJoin(memberships, eq(memberships.id, subscriptions.membership))
  .innerJoin(genders, eq(genders.id, members.id))

let grouped = Object.groupBy(all, ({ id }) => id)

let final = Object.values(grouped).map((group) => {
  if (!group) throw new TypeError('group is undefined')
  if (group.length === 1) return group[0]
  let sorted = group.sort((a, b) => b.ends.localeCompare(a.ends))
  if (sorted[0].status === 'canceled') console.log('sorted %o', sorted)
  return sorted[0]
})
