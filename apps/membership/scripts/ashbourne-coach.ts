import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

export const memType = '%Coach%'
export const membership = 'coach-yearly'

export async function migrateCoaches() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('coach', membership)
}

await migrateCoaches()
