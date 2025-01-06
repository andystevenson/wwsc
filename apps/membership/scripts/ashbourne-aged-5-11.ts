import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

const memType = '%5 - 11%'
const membership = 'aged-5-11-yearly'

export async function migrateAged5to11() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('aged-5-11', membership)
}

await migrateAged5to11()
