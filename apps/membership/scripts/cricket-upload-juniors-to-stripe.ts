import { parse } from 'csv-parse/sync'
import { stripe, Stripe } from '../src/stripe'
import { readFileSync } from 'node:fs'
import { dayjs } from '@wwsc/lib-dates'
import { db, eq, and, members } from '../src/db'
import { format } from 'node:path'

/**
 * Convert a date string from Ashbourne to ISO format
 * @param date dd/mm/yyyy hh:mm:ss
 * @returns YYYY-MM-DDTHH:MM:SS.000Z
 */
export function ukDateToISO(date: string) {
  if (!date) return date
  let [datePart, timePart] = date.split(' ')
  let [day, month, year] = datePart.split('/')
  if (day.length === 1) day = `0${day}`
  if (month.length === 1) month = `0${month}`
  if (year.length === 2) year = `20${year}`
  return `${year}-${month}-${day}` + (timePart ? `T${timePart}` : '')
}

async function main() {
  let filename = process.argv[2]
  if (!filename) {
    console.error('usage: bun cricket-upload-juniors-to-stripe.ts <filename>')
    process.exit(1)
  }

  let club = await findCricketClub()
  if (!club) {
    console.error('cricket club not found')
    process.exit(1)
  }

  let subscription = await findCricketClubSubscription(club.id)
  if (!subscription) {
    console.error('cricket club subscription not found')
    process.exit(1)
  }

  console.log('loading cricket members file', filename)
  let list = await loadMembersList(filename)
  await checkForExistingCustomers(list)
  await uploadToStripe(club, subscription, list)
}

async function loadMembersList(filename: string) {
  let file = readFileSync(filename)
  let records = parse(file, {
    columns: true,
    skip_empty_lines: true,
    skip_records_with_empty_values: true
  })
  console.log('loaded', records.length, 'records')
  return records
}

type FormattedRecord = ReturnType<typeof formatRecordToStripe>
function formatRecordToStripe(record: any) {
  return {
    name: record.child.replace(/\s+/g, ' ').trim(),
    email: record.email.trim(),
    phone: record.mobile || '',
    dob: ukDateToISO(record.dob),
    joined: '2025-01-01',
    guardian: record.guardian.replace(/\s+/g, ' ').trim() || ''
  }
}

function formatAddressToStripe(address: string) {
  let parts = address.split(',')
  let record = {
    line1: address,
    line2: '',
    city: '',
    postal_code: '',
    country: 'GB'
  }

  if (parts.length === 3) {
    let [line1, city, postal_code] = parts
    record = { line1, line2: '', city, postal_code, country: 'GB' }
  }

  if (parts.length === 4) {
    let [line1, line2, city, postal_code] = parts
    record = { line1, line2, city, postal_code, country: 'GB' }
  }

  if (parts.length > 5) {
    throw new Error(`5 part address not supported: ${address}`)
  }

  return {
    line1: record.line1.trim(),
    line2: record.line2.trim(),
    city: record.city.trim(),
    postal_code: record.postal_code.trim(),
    country: record.country.trim()
  }
}

async function checkForExistingCustomers(list: any[]) {
  for (let record of list) {
    let { name, email } = formatRecordToStripe(record)
    await checkForExistingCustomer(name, email)
  }
}

async function checkForExistingCustomer(name: string, email: string) {
  let [exists] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.email, email), eq(members.name, name)))

  if (exists) {
    let customer = await stripe.customers.retrieve(exists.id)
    if (!customer || customer.deleted) {
      console.error(`no customer found for ${name}`)
      throw new TypeError(`no customer found for ${name}`)
    }
    console.warn(
      'existing customer',
      customer.name,
      customer.email,
      customer.id
    )
    return customer
  }

  return exists
}

async function uploadToStripe(
  club: Stripe.Customer,
  subscription: Stripe.Subscription,
  list: any[]
) {
  console.log('uploading', list.length, 'records to Stripe')
  for (let record of list) {
    let stripeRecord = formatRecordToStripe(record)
    let { name, email } = stripeRecord
    let exists = await checkForExistingCustomer(name, email)

    let customer = exists || (await createCricketCustomer(club, stripeRecord))
    if (!customer.deleted) {
      exists?.name
        ? console.error(`no customer created for ${name}`)
        : console.log(`customer created for ${name}`)
      let sub = await createCricketSubscription(
        subscription,
        customer,
        stripeRecord
      )
    }
  }
}

async function createCricketCustomer(
  club: Stripe.Customer,
  record: FormattedRecord
) {
  let { name, email, phone, dob, joined, guardian } = record
  let metadata = { 'linked-with': club.id, dob, joined, guardian }
  let dependentCustomer: Stripe.CustomerCreateParams = {
    name,
    email: email ? email : 'admin@westwarwicks.co.uk',
    phone,
    description: 'cricket-inclusive-monthly',
    metadata
  }

  console.log('creating dependent customer for', dependentCustomer)

  let created = await stripe.customers.create(dependentCustomer)
  if (!created) {
    console.error(`no customer created for ${name}`)
  }

  return created
}

async function createCricketSubscription(
  subscription: Stripe.Subscription,
  customer: Stripe.Customer,
  record: FormattedRecord
) {
  let { id, current_period_start, current_period_end } = subscription
  let currentPeriodStart = dayjs.unix(current_period_start)
  let backdate_start_date = current_period_start
  let billiing_cycle_base = dayjs.unix(current_period_end)
  let billing_cycle_anchor_config: any = {
    day_of_month: billiing_cycle_base.date(),
    hour: 12,
    minute: 0,
    second: 0
  }

  let targetLookup = 'cricket-inclusive-monthly'
  let targetPrice = await findPriceFromLookup(targetLookup)
  if (!targetPrice) {
    throw new Error(`price not found for ${targetLookup}`)
  }

  // let cus = ''
  let cus = customer.id
  const stripeSubscription: Stripe.SubscriptionCreateParams = {
    customer: cus,
    collection_method: 'send_invoice',
    days_until_due: 7,
    proration_behavior: 'none',
    backdate_start_date,
    billing_cycle_anchor_config,
    items: [{ price: targetPrice.id }],
    metadata: {
      'included-in': id
    }
  }
  console.log(
    'creating dependent subscription for',
    stripeSubscription,
    currentPeriodStart.format('YYYY-MM-DD'),
    billiing_cycle_base.format('YYYY-MM-DD')
  )
  const sub = await stripe.subscriptions.create(stripeSubscription)
  console.log('created subscription', sub.id)

  // pause subscription to void billing
  await stripe.subscriptions.update(sub.id, {
    pause_collection: {
      behavior: 'void'
    }
  })
  return sub
}

async function findPriceFromLookup(lookup: string) {
  let search = await stripe.prices.search({ query: `lookup_key:"${lookup}"` })
  if (search.data.length === 0) {
    return null
  }
  return search.data[0]
}

async function findCricketClub() {
  let search = await stripe.customers.search({
    query: 'name:"WestWarwicksCricketClub"'
  })
  if (search.data.length === 0) {
    return null
    return
  }
  return search.data[0]
}

async function findCricketClubSubscription(customerId: string) {
  let search = await stripe.subscriptions.list({ customer: customerId })
  if (search.data.length === 0) {
    return null
  }
  return search.data[0]
}

await main()
