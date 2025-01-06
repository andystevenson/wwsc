import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

async function migrateConcession() {
  let memType = 'Concession Membership - Annual'
  let membership = 'over-65-yearly'

  await migrateSimpleCategory(memType, membership)
  await syncToStripe('over-65', membership)

  memType = 'Concession Membership'
  membership = 'over-65-monthly'

  await migrateSimpleCategory(memType, membership)
  await syncToStripe('over-65', membership)
}

await migrateConcession()
