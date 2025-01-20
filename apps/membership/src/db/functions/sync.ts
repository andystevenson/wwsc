import { Stripe } from 'stripe'
import { stripe } from '@lib/stripe/wwsc'
import {
  db,
  eq,
  and,
  members,
  guardians,
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
  InsertPayment,
  InsertGuardian,
  CollectionBehaviour
} from '../db'
import {
  formatStripeAddress,
  formatNameToFirstNameSurname
} from '../../utilities'

import { membershipFromLookupKey, scopeFromLookupKey } from './membership'

import { dayjs, age as getAge } from '@wwsc/lib-dates'

export async function syncStripeCustomer(customer: Stripe.Customer) {
  let { id, metadata, name, address, email, phone } = customer
  let { dob } = metadata
  let linkedWith = metadata['linked-with'] || null
  let { postal_code } = address || {}

  if (!name) throw new TypeError(`no name, ${customer.id}`)
  let { firstName, surname } = formatNameToFirstNameSurname(name)
  let dateOfBirth =
    dob && dayjs(dob).isValid() ? dayjs(dob).format('YYYY-MM-DD') : null

  let member: InsertMember = {
    id,
    createdBy: 'andy@westwarwicks.co.uk',
    firstName,
    surname,
    address: formatStripeAddress(address),
    postcode: postal_code,
    dob: dateOfBirth || '',
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
  let { memberNo, cardNo, student, preferences, gender, joined } = metadata

  if (memberNo || cardNo) {
    let identity: InsertIdentity = {
      id: customer.id,
      memberNo: memberNo?.trim(),
      card: cardNo?.trim(),
      student: student?.trim()
    }
    console.log('identity', identity)
    await db
      .insert(identities)
      .values(identity)
      .onConflictDoUpdate({ target: [identities.id], set: identity })
  }

  if (preferences) {
    await syncStripeCustomerPreferences(customer, preferences)
  }

  await syncStripeGender(customer, gender)
  await syncStripeJoined(customer, joined)
  await syncAshbourneNotes(customer, memberNo)
  await syncStripeGuardians(customer)
}

export async function syncStripeGender(
  customer: Stripe.Customer,
  gender: string
) {
  let g: GenderType = gender
    ? GenderTypes.includes(gender as GenderType)
      ? (gender.toLowerCase() as GenderType)
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
  let date = joined?.trim()
  if (!date || !dayjs(date).isValid()) return

  let event: InsertEvent = {
    type: 'joined',
    date,
    member: customer.id
  }

  console.log('joined', event)

  let [existing] = await db
    .select()
    .from(events)
    .where(and(eq(events.member, customer.id), eq(events.type, 'joined')))

  if (existing && existing.date === date) return

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
    pause_collection,
    items,
    start_date,
    collection_method,
    metadata
  } = subscription

  let { price } = items.data[0]
  let { id: priceId, lookup_key, recurring } = price

  let started = dayjs.unix(start_date).format('YYYY-MM-DD')
  let phaseStart = dayjs.unix(current_period_start).format('YYYY-MM-DD')
  let phaseEnd = dayjs.unix(current_period_end).format('YYYY-MM-DD')
  let cancelAt = cancel_at ? dayjs.unix(cancel_at).format('YYYY-MM-DD') : null
  let canceledAt = canceled_at
    ? dayjs.unix(canceled_at).format('YYYY-MM-DD')
    : null
  let cancelAtPeriodEnd = cancel_at_period_end ? true : false
  let reason = cancellation_details
    ? Object.values(cancellation_details)
        .filter((v) => v)
        .join(',')
    : null

  let ends = phaseEnd
  if (cancelAt) ends = cancelAt
  if (canceledAt && !cancelAtPeriodEnd) ends = canceledAt

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

  let membership = await membershipFromLookupKey(lookup_key)

  let insertSubscription: InsertSubscription = {
    id,
    member: customer.id,
    membership,
    payment: collection_method,
    scope: scopeFromLookupKey(lookup_key),
    status,
    started,
    phaseStart,
    phaseEnd,
    cancelAt,
    canceledAt,
    cancelAtPeriodEnd,
    reason,
    collectionPaused: pause_collection ? true : false,
    collectionBehavior: pause_collection
      ? (pause_collection.behavior as CollectionBehaviour)
      : null,
    collectionResumes:
      pause_collection && pause_collection.resumes_at
        ? dayjs.unix(pause_collection.resumes_at).format('YYYY-MM-DD')
        : null,
    ends
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
    type: paid_out_of_band ? 'cash' : type,
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

export async function syncStripeGuardians(customer: Stripe.Customer) {
  let list = await guardiansFromStripe(customer)
  console.log('guardians of', customer.name, list.length)
  for (let guardian of list) {
    await db
      .insert(guardians)
      .values(guardian)
      .onConflictDoUpdate({
        target: [guardians.member, guardians.name],
        set: guardian
      })
  }
}

async function guardiansFromStripe(customer: Stripe.Customer) {
  let list: InsertGuardian[] = []

  let { metadata, phone, email, name } = customer
  let { dob, guardian, guardian2, guardian2mobile, guardian2email } = metadata
  if (guardian) {
    list.push({
      member: customer.id,
      name: guardian,
      mobile: phone || '',
      email: email || ''
    })
  }

  if (guardian2) {
    list.push({
      member: customer.id,
      name: metadata.guardian2,
      mobile: guardian2mobile || '',
      email: guardian2email || ''
    })
  }

  if (dob) {
    let linkedWith = metadata['linked-with']
    let age = getAge(dob)
    if (age < 18 && linkedWith) {
      let guardianCustomer = await stripe.customers.retrieve(linkedWith)
      if (guardianCustomer && !guardianCustomer.deleted) {
        let { id, name: gName, phone: gPhone, email: gEmail } = guardianCustomer
        if (
          ['WestWarwicksHockeyClub', 'WestWarwicksCricketClub'].includes(
            gName || ''
          )
        ) {
          return list
        }
        console.log('updating', name, 'aged', age, 'from', gName)
        list.push({
          member: id,
          name: gName || email || 'unknown',
          mobile: gPhone || phone || '',
          email: gEmail || email || ''
        })
      }
    }
  }

  return list
}
