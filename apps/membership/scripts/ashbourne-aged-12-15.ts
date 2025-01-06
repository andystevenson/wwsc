import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

const memType = '%12 - 15%'
const membership = 'aged-12-15-yearly'

export async function migrateAged12to15() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('aged-12-15', membership)
}

await migrateAged12to15()
