import {
  db,
  eq,
  desc,
  memberships,
  campaignMemberships,
  campaigns
} from '../src/db'
import { dayjs } from '@wwsc/lib-dates'

async function main() {
  let scope = await db
    .select({
      id: memberships.id,
      campaign: campaignMemberships.campaign,
      start: campaigns.start,
      end: campaigns.end
    })
    .from(memberships)
    .innerJoin(
      campaignMemberships,
      eq(campaignMemberships.membership, memberships.id)
    )
    .innerJoin(campaigns, eq(campaigns.id, campaignMemberships.campaign))
    .orderBy(desc(campaigns.end))

  let today = dayjs().format('YYYY-MM-DD')
  for (let { id, campaign, start, end } of scope) {
    // console.log({ id, campaign, start, end })
    if (today.localeCompare(start) >= 0 && today.localeCompare(end) <= 0) {
      await db
        .update(memberships)
        .set({ status: 'active', effectiveDate: start })
        .where(eq(memberships.id, id))
    } else {
      await db
        .update(memberships)
        .set({ status: 'withdrawn', effectiveDate: start })
        .where(eq(memberships.id, id))
    }
  }
}

await main()
