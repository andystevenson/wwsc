import { db, ashbourne, eq, notes } from '../src/db/db'
import { dayjs } from '@wwsc/lib-dates'
import { Stripe } from 'stripe'
import { stripe } from '@lib/stripe/wwsc'

const all = await db
  .select({
    memberNo: ashbourne.memberNo,
    cardNo: ashbourne.cardNo,
    memTitle: ashbourne.memTitle,
    firstName: ashbourne.firstName,
    surname: ashbourne.surname,
    address: ashbourne.address,
    mobile: ashbourne.mobile,
    phoneNo: ashbourne.phoneNo,
    dob: ashbourne.dob,
    joinedDate: ashbourne.joinedDate
  })
  .from(ashbourne)

type Member = (typeof all)[0]

for (let member of all) {
  let customer = await findStripeCustomer(member.memberNo)
  if (!customer) {
    console.error(
      `No customer found for ${member.memberNo} ${member.firstName} ${member.surname}`
    )
    continue
  }
  await updateStripeCustomer(member, customer)
  console.log(`Processing ${member.memberNo}`, customer.name)
}

// Functions
async function findStripeCustomer(memberNo: string) {
  const search = await stripe.customers.search({
    query: `metadata['memberNo']:"${memberNo}"`
  })

  if (search.data.length === 0) {
    return null
  }

  if (search.data.length > 1) {
    throw new Error(`Multiple customers found for memberNo: ${memberNo}`)
  }

  return search.data[0]
}

function formatAshbourneAddress(address: string) {
  let parts = address.split(',').map((part) => part.trim())
  let stripeAddress = {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'GB'
  }

  if (parts.length === 1) {
    stripeAddress.line1 = parts[0]
  }

  if (parts.length === 2) {
    stripeAddress.line1 = parts[0]
    stripeAddress.line2 = parts[1]
  }

  if (parts.length === 3) {
    stripeAddress.line1 = parts[0]
    stripeAddress.city = parts[1]
    stripeAddress.postal_code = parts[2]
  }

  if (parts.length === 4) {
    stripeAddress.line1 = parts[0]
    stripeAddress.line2 = parts[1]
    stripeAddress.city = parts[2]
    stripeAddress.postal_code = parts[3]
  }

  if (parts.length > 4) {
    stripeAddress.line1 = parts[0]
    stripeAddress.line2 = parts[1]
    stripeAddress.city = parts[2]
    stripeAddress.postal_code = parts[3]
  }

  return stripeAddress
}

async function updateStripeCustomer(member: Member, customer: Stripe.Customer) {
  let { address, metadata } = customer

  if (!address && member.address) {
    let stripeAddress = formatAshbourneAddress(member.address)
    // console.log('Updating address', stripeAddress)
    await stripe.customers.update(customer.id, {
      address: stripeAddress
    })
  }

  if (!customer.phone && (member.mobile || member.phoneNo)) {
    // console.log('Updating phone', member.phoneNo)
    await stripe.customers.update(customer.id, {
      phone: member.mobile ? member.mobile : member.phoneNo
    })
  }

  let preferences = new Set<string>()
  if (metadata.cricket) preferences.add('cricket')
  if (metadata.football) preferences.add('football')
  if (metadata.gym) preferences.add('gym')
  if (metadata.hockey) preferences.add('hockey')
  if (metadata.padel) preferences.add('padel')
  if (metadata.squash) preferences.add('squash')
  if (metadata.racketball) preferences.add('racketball')
  if (metadata.tennis) preferences.add('tennis')

  preferences.add('email-marketing')
  preferences.add('sms-marketing')
  let revisedPreferences = Array.from(preferences).join(',')

  let newMetadata = {
    cardNo: member.cardNo,
    gender: member.memTitle,
    dob: member.dob,
    joined: member.joinedDate,
    preferences: revisedPreferences,
    id: '',
    'address-level1': '',
    email: '',
    male: '',
    female: '',
    name: '',
    'new-or-existing': '',
    payment: '',
    postcode: '',
    'price-id': '',
    'price-value': '',
    'product-id': '',
    quantity: '',
    'recurring-times': '',
    street: '',
    telephone: '',
    total: '',
    firstName: '',
    surname: '',
    type: '',
    cricket: '',
    football: '',
    gym: '',
    hockey: '',
    padel: '',
    squash: '',
    racketball: '',
    tennis: '',
    social: ''
  }

  // console.log('Updating metadata', metadata)
  await stripe.customers.update(customer.id, {
    metadata: newMetadata
  })
}
