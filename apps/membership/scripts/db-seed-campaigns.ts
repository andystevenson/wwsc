import { db, campaigns, campaignMemberships, Campaign } from '../src/db/db'
import { getAllPrices } from '../src/stripe'
import { andy } from './andy'
import { never } from '@wwsc/lib-dates'

let prices = await getAllPrices()

let campaignNames = new Set<string>()
let campaignLookups: Record<string, string[]> = {}

for (let price of prices) {
  let { id, active, nickname, lookup_key, metadata } = price
  if (!active) continue

  let { campaign } = metadata
  if (!campaign) continue

  let list = campaign.split(',')
  for (let c of list) {
    let name = c.trim()
    campaignNames.add(name)
    campaignLookups[name] = campaignLookups[c] || []
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
    campaignLookups[c].push(lookup_key)
  }
}

let createdBy = await andy()

let campaignConfigs: Campaign[] = [
  {
    id: 'yearly',
    description: 'Yearly membership category',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: 'monthly',
    description: 'Monthly membership category',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: 'club',
    description: 'club membership category',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: 'top-up',
    description: 'Top-up membership category',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: '3-months-half-price',
    description: '3 months half price membership campaign',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: 'ACT',
    description: 'ACT membership campaign',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: 'blue-light',
    description: 'Blue light membership category',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: 'family-member',
    description: 'Family member membership category',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: never()
  },
  {
    id: 'set-for-summer',
    description: 'Set for summer membership campaign',
    createdBy: createdBy.email,
    created: '2024-07-01',
    start: '2024-07-01',
    end: '2024-09-30'
  },
  {
    id: 'new-year-new-me',
    description: 'New year new me membership campaign',
    createdBy: createdBy.email,
    created: '2024-01-01',
    start: '2024-01-01',
    end: '2024-03-31'
  },
  {
    id: 'new-year-2025',
    description: 'New year 2025 membership campaign',
    createdBy: createdBy.email,
    created: '2025-01-01',
    start: '2025-01-01',
    end: '2025-03-31'
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
    await db
      .insert(campaignMemberships)
      .values({ campaign, membership: lookup })
    count++
  }
}

console.log('campaignMemberships', count)
