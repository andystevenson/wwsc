import { migrateSimpleCategory } from './ashbourne-migrate-category'
import {
  syncToStripe,
  selectMembersByCategory,
  Category,
  Stripe,
  memberExistsInStripe,
  SelectedMember
} from './wwarms-links-stripe'

export const memType = '%Social%'
export const membership = 'social-yearly'

export async function migrateAdultSocial() {
  await migrateSimpleCategory(memType, membership)

  // await syncToStripe('professional', membership)
  notMigratedList('social', membership)
}

async function notMigratedList(category: Category, membership: string = '') {
  let selected = await selectMembersByCategory(category, membership)
  let exists: Stripe.Customer[] = []
  let notExists: SelectedMember[] = []
  let migrated: Set<string> = new Set()
  let notMigrated: Set<string> = new Set()
  for (let member of selected) {
    let customer = await memberExistsInStripe(member)
    customer ? exists.push(customer) : notExists.push(member)
    if (!member.memberNo) {
      console.error('memberNo not found', member)
      continue
    }
    customer ? migrated.add(member.memberNo) : notMigrated.add(member.memberNo)
  }
  console.log(
    'members not migrated',
    notExists.length,
    notMigrated.size,
    'of',
    selected.length,
    migrated.size
  )
}

await migrateAdultSocial()
