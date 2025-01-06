import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

const memType = '%16 - 18%'
const membership = 'aged-16-18-yearly'

export async function migrateAged16to18() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('aged-16-18', membership)
}

await migrateAged16to18()
