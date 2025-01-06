import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { db, ashbourne, and, like, eq } from '../src/db/db'
import { syncToStripe } from './wwarms-links-stripe'

export const membership = 'guest-of-monthly'

async function selectGuestOf() {
  return db
    .select()
    .from(ashbourne)
    .where(
      and(like(ashbourne.notes, '%[[guest-of%'), eq(ashbourne.status, 'Live'))
    )
}

export async function migrateGuestOf() {
  let all = await selectGuestOf()
  let memberList = all.map((member) => member.memberNo)
  console.log('%o', { memberList })
  await migrateSimpleCategory(memberList, membership)
  await syncToStripe('guest-of', membership)
}

await migrateGuestOf()
