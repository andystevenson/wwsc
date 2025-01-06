import { migrateSimpleCategory } from './ashbourne-migrate-category'
import { syncToStripe } from './wwarms-links-stripe'

export const memType = '%Staff%'
export const membership = 'staff-yearly'

export async function migrateStaff() {
  await migrateSimpleCategory(memType, membership)

  await syncToStripe('staff', membership)
}

await migrateStaff()
