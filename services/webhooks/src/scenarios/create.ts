import { Stripe } from 'stripe'
import { stripe } from '@lib/stripe/wwsc'
import { faker } from '@faker-js/faker'
import { dayjs } from '@wwsc/lib-dates'
import { PreferenceTypes } from '../db'

export async function createSimpleCustomer() {
  let withGuardians =
    faker.number.binary() === '1'
      ? {
          guardian: faker.person.fullName(),
          guardian2: faker.person.fullName(),
          guardian2mobile: faker.phone.number()
        }
      : null

  let withMemberNo =
    faker.number.binary() === '1'
      ? { memberNo: `${faker.string.numeric({ length: 5 })}` }
      : null

  let customer = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    address: {
      line1: faker.location.streetAddress(),
      city: faker.location.city(),
      postal_code: faker.location.zipCode(),
      country: faker.location.country()
    },
    phone: `+44${faker.string.numeric({ length: 11 })}`,
    metadata: {
      wwsc: 'true',
      createdBy: faker.helpers
        .arrayElements(
          [
            'andy@westwarwicks.co.uk',
            'james.robinson@westwarwicks.co.uk',
            'angela@westwarwicks.co.uk'
          ],
          1
        )
        .join(''),
      dob: dayjs(faker.date.past({ years: 70 })).format('YYYY-MM-DD'),
      gender: faker.person.sex().toLowerCase(),
      joined: dayjs(faker.date.past()).format('YYYY-MM-DD'),
      preferences: faker.helpers.arrayElements(PreferenceTypes).join(','),
      ...withGuardians,
      ...withMemberNo
    }
  }

  try {
    console.log('create simple customer:', customer)
    return stripe.customers.create(customer)
  } catch (error) {
    if (error instanceof Error) {
      console.error('error creating customer:', error.message)
      return
    }
    console.error('error creating customer:', error)
  }
}

async function main() {
  await createSimpleCustomer()
}

await main()
