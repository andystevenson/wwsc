import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

export const memType = '%Rob Owen Academy%'
export const membership = 'professional-monthly'

export async function migrateROA() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('professional', membership)
}

await migrateROA()
