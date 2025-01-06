import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

export const memType = '%Adult Social%'
export const membership = 'social-yearly'

export async function migrateSocial() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('social', membership)
}

await migrateSocial()
