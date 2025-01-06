import { stripe, Stripe } from '../src/stripe'
import { db, ashbourne, eq, type AshbourneMember } from '../src/db/db'
import { dayjs } from '@wwsc/lib-dates'

async function main() {
  const headOfFamily = Bun.argv[2]
  if (!headOfFamily) {
    console.error('please provide the head of family name')
    process.exit(1)
  }

  console.log('creating family from subscription for', headOfFamily)
  let customer = await stripeCustomerByName(headOfFamily)
  if (!customer) {
    process.exit(1)
  }

  let subscriptions = await stripeSubscriptionByCustomer(customer.id)
  if (!subscriptions) {
    process.exit(1)
  }

  await createFamily(subscriptions)
}

await main()

async function stripeCustomerByName(name: string) {
  let search = await stripe.customers.search({ query: `name:"${name}"` })
  if (search.data.length === 0) {
    console.error(`no customer found for ${name}`)
    return null
  }

  if (search.data.length > 1) {
    console.error(`multiple customers found with that name ${name}`)
    return null
  }

  let customer = search.data[0]
  let { id, metadata } = customer
  let { memberNo } = metadata

  if (!memberNo) {
    console.error(`no memberNo found for ${name}`)
    return null
  }
  return customer
}

async function stripeSubscriptionByCustomer(customer: string) {
  let subscriptions = await stripe.subscriptions.list({
    customer: customer,
    expand: ['data.customer', 'data.default_payment_method', 'data.schedule']
  })

  if (subscriptions.data.length === 0) {
    console.error(`no subscriptions found for ${customer}`)
    return null
  }

  return subscriptions.data
}

async function createFamily(subscriptions: Stripe.Subscription[]) {
  for (let subscription of subscriptions) {
    let { id, metadata } = subscription
    let { memberNo, dependents } = metadata
    if (!dependents) {
      console.error(`no dependents found for subscription ${id}`)
      continue
    }

    let dependentsList = JSON.parse(dependents)
    console.log('creating family for', memberNo, dependentsList)
    let family = await ashbourneFamily(memberNo, dependentsList)

    if (!family) {
      console.error(`no family found for ${memberNo}`)
      continue
    }

    await createFamilySubscription(subscription, family)
  }
}

async function ashbourneFamily(memberNo: string, dependents: string[]) {
  let headOfFamily = await db.query.ashbourne.findFirst({
    where: eq(ashbourne.memberNo, memberNo)
  })

  if (!headOfFamily) {
    console.error(`no family found for ${memberNo}`)
    return null
  }

  type FamilyMember = typeof headOfFamily
  let familyMembers: FamilyMember[] = []

  for (let dependent of dependents) {
    let member = await db.query.ashbourne.findFirst({
      where: eq(ashbourne.memberNo, dependent)
    })

    if (!member) {
      console.error(`no dependent found for ${dependent}`)
      return null
    }

    familyMembers.push(member)
  }

  return familyMembers
}

async function createFamilySubscription(
  headOfFamily: Stripe.Subscription,
  dependents: AshbourneMember[]
) {
  let { id, customer, current_period_start, current_period_end, items } =
    headOfFamily

  if (!customer || typeof customer === 'string') {
    console.error(`no customer found for subscription ${id}, ${customer}`)
    return
  }

  if (items && items.data.length === 0) {
    console.error(`no items found for subscription ${id}`)
    return
  }

  if (items && items.data.length > 1) {
    console.warn(`subscription ${id} has more than one item`)
  }

  let price = items.data[0].price
  let { lookup_key, nickname } = price
  console.log(
    'creating family subscription for',
    customer,
    lookup_key,
    nickname
  )

  let targetLookup = lookup_key?.includes('yearly')
    ? 'family-inclusive-yearly'
    : 'family-inclusive-monthly'

  let search = await stripe.prices.search({
    query: `lookup_key:"${targetLookup}"`
  })

  if (search.data.length === 0) {
    console.error(`no price found for ${targetLookup}`)
    return
  }

  let targetPrice = search.data[0]

  let {
    id: cus,
    address,
    name,
    email: cusEmail,
    phone
  } = customer as Stripe.Customer

  if (!address || !name) {
    console.error(`no address or name found for customer ${cus}`)
    return
  }
  // property to include on headOfFamily customer
  let linkedWith: string[] = []

  // property to include on headOfFamily subscription
  let includes: string[] = []

  for (let dependent of dependents) {
    let { memberNo, firstName, surname, email, mobile } = dependent
    let metadata = { memberNo, 'linked-with': cus }
    let dependentCustomer: Stripe.CustomerCreateParams = {
      name: `${firstName} ${surname}`,
      address: {
        line1: address.line1 ? address.line1 : undefined,
        line2: address.line2 ? address.line2 : undefined,
        city: address.city ? address.city : undefined,
        state: address.state ? address.state : undefined,
        postal_code: address.postal_code ? address.postal_code : undefined,
        country: address.country ? address.country : undefined
      },
      email: email ? email : cusEmail ? cusEmail : undefined,
      phone: mobile ? mobile : phone ? phone : undefined,
      description: targetLookup,
      metadata
    }

    console.log('creating dependent customer for', dependentCustomer)

    let created = await stripe.customers.create(dependentCustomer)
    if (!created) {
      console.error(`no customer created for ${memberNo}`)
      continue
    }
    linkedWith.push(created.id) // add dependentId to linkedWith

    let currentPeriodStart = dayjs.unix(current_period_start)
    let backdate_start_date = current_period_start
    let billiing_cycle_base = dayjs.unix(current_period_end)
    let billing_cycle_anchor_config: any = {
      day_of_month: billiing_cycle_base.date(),
      hour: 12,
      minute: 0,
      second: 0
    }

    if (targetLookup.includes('yearly')) {
      billing_cycle_anchor_config = {
        ...billing_cycle_anchor_config,
        month: billiing_cycle_base.month() + 1
      }
    }

    const stripeSubscription: Stripe.SubscriptionCreateParams = {
      customer: created.id,
      collection_method: 'send_invoice',
      days_until_due: 7,
      proration_behavior: 'none',
      backdate_start_date,
      billing_cycle_anchor_config,
      items: [{ price: targetPrice.id }],
      metadata: {
        memberNo: memberNo,
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
    includes.push(sub.id) // add dependentId to includes

    // pause subscription to void billing
    await stripe.subscriptions.update(sub.id, {
      pause_collection: {
        behavior: 'void'
      }
    })
  }

  // update headOfFamily customer with linkedWith
  await stripe.customers.update(cus, {
    metadata: { 'linked-with': linkedWith.join(', ') }
  })

  // update headOfFamily subscription with includes
  await stripe.subscriptions.update(id, {
    metadata: {
      includes: includes.join(', ')
    }
  })
}
