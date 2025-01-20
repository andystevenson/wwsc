import {
  db,
  campaigns,
  campaignMemberships,
  memberships,
  Campaign,
  Category
} from '../src/db/db'
import { getAllPrices } from '@lib/stripe/wwsc'
import { andy } from './andy'

let prices = await getAllPrices()

let campaignNames = new Set<string>()
let campaignLookups: Record<string, string[]> = {}
let lookupCategories: Record<string, string> = {} // lookup_key -> category

for (let price of prices) {
  let { id, active, nickname, name, lookup_key, metadata } = price
  if (!active) continue

  let { campaign } = metadata
  if (!campaign) continue

  let list = campaign.split(',')
  for (let c of list) {
    let cname = c.trim()
    campaignNames.add(cname)
    campaignLookups[cname] = campaignLookups[c] || []
    if (!lookup_key) {
      console.error('No lookup key', id)
      continue
    }

    if (nickname !== lookup_key) {
      console.error('Mismatched lookup key', id, nickname, lookup_key)
    }
    if (campaignLookups[c].includes(lookup_key)) {
      console.error('Duplicate lookup', lookup_key)
    }
    lookupCategories[lookup_key] = name
    campaignLookups[c].push(lookup_key)
  }
}

let createdBy = await andy()

let campaignConfigs: Campaign[] = [
  {
    id: 'yearly',
    description: 'Yearly',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '9999-01-01'
  },
  {
    id: 'monthly',
    description: 'Monthly',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '9999-01-01'
  },
  {
    id: 'club',
    description: 'Club',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '2024-12-31'
  },
  {
    id: 'top-up',
    description: 'Top-up to classes',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '9999-01-01'
  },
  {
    id: '3-months-half-price',
    description: '3 months half price',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '2024-12-31'
  },
  {
    id: 'ACT',
    description: 'All Court Tennis',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '9999-01-01'
  },
  {
    id: 'blue-light',
    description: 'Blue Light promotion',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '9999-01-01'
  },
  {
    id: 'family-member',
    description: 'Family member discount',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '9999-01-01'
  },
  {
    id: 'set-for-summer',
    description: 'Set For Summer 2024',
    createdBy: createdBy.email,
    created: '2024-07-01',
    start: '2024-07-01',
    end: '2024-09-30'
  },
  {
    id: 'new-year-new-me',
    description: 'New Year New Me 2024',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '2024-03-31'
  },
  {
    id: 'new-year-2025',
    description: 'New Year 2025',
    createdBy: createdBy.email,
    created: '2025-01-01',
    start: '2025-01-01',
    end: '2025-03-31'
  },
  {
    id: 'legacy',
    description: 'Legacy Defunct Categories',
    createdBy: createdBy.email,
    created: '2023-01-01',
    start: '2023-01-01',
    end: '2024-12-31'
  }
]

let newCampaigns = await db
  .insert(campaigns)
  .values(campaignConfigs)
  .returning()

console.log('campaigns', campaignNames.size, newCampaigns.length)

let count = 0
for (let [campaign, lookups] of Object.entries(campaignLookups)) {
  for (let lookup of lookups) {
    let category = lookupCategories[lookup] as Category
    if (!category) {
      console.error('No category', lookup)
      throw new Error(`'No category' ${lookup}`)
    }
    await db
      .insert(campaignMemberships)
      .values({ campaign, category, membership: lookup })
    count++
  }
}

let allMemberships = await db
  .select({
    id: memberships.id,
    interval: memberships.interval,
    category: memberships.category
  })
  .from(memberships)

for (let { id, interval, category } of allMemberships) {
  await db
    .insert(campaignMemberships)
    .values({ campaign: `${interval}ly`, category, membership: id })
  count++
}

console.log('campaignMemberships', count)
