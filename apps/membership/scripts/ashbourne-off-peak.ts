import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

async function migrateOffPeak() {
  let memType = 'Off Peak Annual'
  let membership = 'off-peak-yearly'

  await migrateSimpleCategory(memType, membership)
  await syncToStripe('off-peak', membership)

  memType = 'Off Peak DD'
  membership = 'off-peak-monthly'

  await migrateSimpleCategory(memType, membership)
  await syncToStripe('off-peak', membership)
}

await migrateOffPeak()
