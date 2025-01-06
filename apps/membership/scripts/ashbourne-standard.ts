import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

async function migrateStandard() {
  let memType = 'Standard Annual'
  let membership = 'adult-yearly'

  await migrateSimpleCategory(memType, membership)
  syncToStripe('adult', membership)

  memType = 'Standard DD'
  membership = 'adult-monthly'

  await migrateSimpleCategory(memType, membership)
  syncToStripe('adult', membership)
}

await migrateStandard()
