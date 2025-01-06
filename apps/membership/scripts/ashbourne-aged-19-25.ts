import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

async function migrateAged19to25() {
  let memType = '%25 yrs Annual%'
  let membership = 'young-adult-yearly'

  await migrateSimpleCategory(memType, membership)
  await syncToStripe('young-adult', membership)

  memType = '%25 yrs DD%'
  membership = 'young-adult-monthly'

  await migrateSimpleCategory(memType, membership)
  await syncToStripe('young-adult', membership)
}

await migrateAged19to25()
