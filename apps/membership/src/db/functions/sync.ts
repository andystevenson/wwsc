import { stripe, Stripe } from '../../stripe'
import {
  db,
  eq,
  members,
  identities,
  PreferenceTypes,
  GenderTypes,
  genders,
  preferences,
  events,
  notes,
  ashbourne,
  memberships,
  subscriptions,
  payments
} from '../db'
import type {
  InsertMember,
  InsertIdentity,
  InsertPreference,
  PreferenceType,
  GenderType,
  InsertGender,
  InsertEvent,
  InsertNote,
  InsertSubscription,
  InsertPayment
} from '../db'
import { dayjs } from '@wwsc/lib-dates'

export async function syncStripeCustomer(customer: Stripe.Customer) {
  let { id, metadata, name, address, email, phone } = customer
  let { dob } = metadata
  let linkedWith = metadata['linked-with'] || null
  let { postal_code } = address || {}

  if (!name) throw new TypeError(`no name, ${customer.id}`)
  let { firstName, surname } = formatNameToFirstNameSurname(name)
  let dateOfBirth = dayjs(dob).isValid()
    ? dayjs(dob).format('YYYY-MM-DD')
    : null

  let member: InsertMember = {
    id,
    createdBy: 'andy@westwarwicks.co.uk',
    firstName,
    surname,
    address: formatStripeAddress(address),
    postcode: postal_code,
    dob: dateOfBirth,
    email,
    mobile: phone
    // relative: linkedWith
  }

  console.log('member', member)
  await db
    .insert(members)
    .values(member)
    .onConflictDoUpdate({ target: [members.id], set: member })

  await syncStripeCustomerMetadata(customer)
}

export async function syncStripeCustomerMetadata(customer: Stripe.Customer) {
  let { metadata } = customer
  let { memberNo, cardNo, preferences, gender, joined } = metadata

  if (memberNo || cardNo) {
    let identity: InsertIdentity = {
      id: customer.id,
      memberNo,
      card: cardNo
    }
    console.log('identity', identity)
    // await db
    //   .insert(identities)
    //   .values(identity)
    //   .onConflictDoUpdate({ target: [identities.id], set: identity })
  }

  if (preferences) {
    await syncStripeCustomerPreferences(customer, preferences)
  }

  await syncStripeGender(customer, gender)
  await syncStripeJoined(customer, joined)
  await syncAshbourneNotes(customer, memberNo)
}

export async function syncStripeGender(
  customer: Stripe.Customer,
  gender: string
) {
  let g: GenderType = gender
    ? GenderTypes.includes(gender as GenderType)
      ? (gender as GenderType)
      : 'unknown'
    : 'unknown'

  let insertGender: InsertGender = {
    id: customer.id,
    gender: g,
    other: ''
  }

  console.log('gender', insertGender)
  await db
    .insert(genders)
    .values(insertGender)
    .onConflictDoUpdate({ target: [genders.id], set: insertGender })
}

export async function syncStripeCustomerPreferences(
  customer: Stripe.Customer,
  inputPreferences: string
) {
  let prefs = inputPreferences.split(',').map((p: string) => p.trim())
  let insertPrefs: InsertPreference[] = prefs
    .filter((p) => PreferenceTypes.includes(p as PreferenceType))
    .map((p) => {
      return {
        type: p as PreferenceType,
        member: customer.id
      }
    })

  console.log('preferences', insertPrefs)
  await db.insert(preferences).values(insertPrefs).onConflictDoNothing()
}

export async function syncStripeJoined(
  customer: Stripe.Customer,
  joined: string
) {
  if (!joined || !dayjs(joined).isValid()) return

  let event: InsertEvent = {
    type: 'joined',
    date: joined,
    member: customer.id,
    note: 'customer joined west warwicks on this date'
  }

  console.log('joined', event)

  await db
    .insert(events)
    .values(event)
    .onConflictDoUpdate({ target: [events.id], set: event })
}

export async function syncAshbourneNotes(
  customer: Stripe.Customer,
  memberNo: string
) {
  if (!memberNo) return
  // only update notes if memberNo is present && there is not already notes in the db
  // can only happen the first time the customer is synced
  let [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.member, customer.id))

  if (note) return

  let [noteText] = await db
    .select({ notes: ashbourne.notes })
    .from(ashbourne)
    .where(eq(ashbourne.memberNo, memberNo))

  if (!noteText) return

  let insertNote: InsertNote = {
    member: customer.id,
    createdBy: 'andy@westwarwicks.co.uk',
    content: noteText.notes
  }

  console.log('note', insertNote)
  await db.insert(notes).values(insertNote)
}

export async function syncStripeSubscription(
  customer: Stripe.Customer,
  subscription: Stripe.Subscription
) {
  let {
    id,
    status,
    current_period_start,
    current_period_end,
    cancel_at,
    canceled_at,
    cancel_at_period_end,
    cancellation_details,
    items,
    start_date,
    collection_method,
    metadata
  } = subscription

  let { price } = items.data[0]
  let { id: priceId, lookup_key, recurring } = price
  let canceled =
    cancel_at_period_end || canceled_at || cancel_at
      ? JSON.stringify({
          cancel_at,
          cancel_at_period_end,
          canceled_at,
          cancellation_details
        })
      : null

  let includedIn = metadata['included-in'] || null

  if (!lookup_key) {
    lookup_key = await lookupKeyFromPrice(priceId)
  }

  if (!lookup_key)
    throw new TypeError(`no lookup key found for priceId ${priceId}`)

  if (!recurring)
    throw new TypeError(
      `all subscriptions should be recurring ${customer.name} ${id}`
    )

  let membership = await membershipFromLookupKey(lookup_key, subscription)

  let insertSubscription: InsertSubscription = {
    id,
    member: customer.id,
    membership,
    payment: collection_method,
    scope: scopeFromLookupKey(lookup_key),
    status,
    started: dayjs.unix(start_date).format('YYYY-MM-DD'),
    phaseStart: dayjs.unix(current_period_start).format('YYYY-MM-DD'),
    phaseEnd: dayjs.unix(current_period_end).format('YYYY-MM-DD'),
    canceled
    // includedIn
  }

  console.log('subscription', insertSubscription)
  await db
    .insert(subscriptions)
    .values(insertSubscription)
    .onConflictDoUpdate({ target: [subscriptions.id], set: insertSubscription })
}

export async function findStripeCustomerByMemberNo(memberNo: string) {
  let search = await stripe.customers.search({
    query: `metadata['memberNo']:"${memberNo}"`
  })

  if (search.data.length === 0) return null
  if (search.data.length > 1) {
    throw new TypeError(
      `multiple members found in stripe with same ashbourne memberNo ${memberNo}`
    )
  }

  return search.data[0]
}

export function formatStripeAddress(
  address: Stripe.Address | null | undefined
) {
  if (!address) return ''
  let { line1, line2, city, state, postal_code, country } = address
  let parts = [line1, line2, city, state, postal_code, country].filter((p) => p)
  return parts.join(', ')
}

export function formatNameToFirstNameSurname(name: string) {
  let parts = name.split(' ').map((part) => part.trim())
  if (parts.length === 1) return { firstName: parts[0], surname: '' }
  return {
    firstName: parts.slice(0, -1).join(' '),
    surname: parts.slice(-1).join(' ')
  }
}

export function scopeFromLookupKey(lookup_key: string) {
  if (lookup_key.includes('family')) return 'family'
  if (lookup_key.includes('club')) return 'club'
  return 'individual'
}

export async function membershipFromLookupKey(
  lookup_key: string,
  subscription: Stripe.Subscription
) {
  let [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.id, lookup_key))

  if (!membership)
    throw new TypeError(
      `no membership found for lookup_key ${lookup_key}, ${subscription.id}`
    )

  return membership.id
}

export async function lookupKeyFromPrice(priceId: string) {
  let price = await stripe.prices.retrieve(priceId)
  let { product, nickname, unit_amount, recurring } = price

  let prices = await stripe.prices.search({
    query: `product:"${product}" active:"true"`,
    limit: 100
  })

  let found = prices.data.find((p) => {
    let ok =
      p.unit_amount === unit_amount &&
      p.recurring &&
      recurring &&
      p.recurring.interval === recurring.interval &&
      p.recurring.interval_count === recurring.interval_count

    // if (!ok) {
    //   console.log(
    //     'price mismatch',
    //     p.id,
    //     p.lookup_key,
    //     p.unit_amount,
    //     p.recurring
    //   )
    //   console.log('price mismatch', priceId, nickname, unit_amount, recurring)
    // }

    return ok
  })
  if (!found)
    throw new TypeError(`no matching price lookup found for ${priceId}`)

  console.log('lookup key found', found.lookup_key, priceId)
  return found.lookup_key
}

export async function syncStripeInvoices(
  customer: Stripe.Customer,
  subscriptions: Stripe.Subscription[]
) {
  let invoices: Stripe.Invoice[] = []
  for (let subscription of subscriptions) {
    let list = await stripe.invoices.list({
      subscription: subscription.id,
      expand: ['data.charge']
    })
    invoices.push(...list.data)
  }

  let invoicePayments: InsertPayment[] = invoices.map((invoice) =>
    formatInvoice(customer, invoice)
  )

  for (let payment of invoicePayments) {
    await db
      .insert(payments)
      .values(payment)
      .onConflictDoUpdate({ target: [payments.id], set: payment })
  }
}

export function formatInvoice(
  customer: Stripe.Customer,
  invoice: Stripe.Invoice
) {
  let date = ''
  let {
    id,
    attempt_count,
    collection_method,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    status,
    amount_due,
    total,
    due_date,
    status_transitions,
    paid_out_of_band,
    charge,
    invoice_pdf,
    hosted_invoice_url
  } = invoice

  if (collection_method === 'charge_automatically') {
    let { paid_at, marked_uncollectible_at, voided_at, finalized_at } =
      status_transitions

    if (paid_at) date = dayjs.unix(paid_at).format('YYYY-MM-DD')
    if (marked_uncollectible_at)
      date = dayjs.unix(marked_uncollectible_at).format('YYYY-MM-DD')
    if (voided_at) date = dayjs.unix(voided_at).format('YYYY-MM-DD')
    if (!date && finalized_at)
      date = dayjs.unix(finalized_at).format('YYYY-MM-DD')
  }

  if (collection_method === 'send_invoice' && due_date) {
    date = dayjs.unix(due_date).format('YYYY-MM-DD')
  }

  let receipt = ''
  let type = ''
  let refunded = 0
  let amount = 0
  if (charge && typeof charge === 'object') {
    let {
      receipt_url,
      refunded: cRefunded,
      amount: camount,
      amount_refunded,
      payment_method_details
    } = charge

    receipt = receipt_url || ''
    refunded = cRefunded ? amount_refunded : 0
    amount = camount
    if (payment_method_details) {
      let { type: pmType, card } = payment_method_details
      type = pmType
      if (card) {
        let { brand } = card
        type = brand ? brand : pmType
      }
    }
  }

  let collection = collection_method
  let url = hosted_invoice_url
  let pdf = invoice_pdf
  if (amount === 0) amount = amount_due

  let payment: InsertPayment = {
    id,
    date,
    amount,
    status,
    type,
    collection,
    name,
    email,
    phone,
    url,
    pdf,
    receipt,
    refunded,
    attempts: attempt_count,
    member: customer.id
  }

  return payment
}
