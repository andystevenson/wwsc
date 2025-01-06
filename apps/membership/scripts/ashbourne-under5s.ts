import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

export const memType = '%Under%'
export const membership = 'under-5-yearly'

export async function migrateUnder5() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('under-5', membership)
}

await migrateUnder5()
