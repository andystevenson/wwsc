import { ashbourne, db, eq } from '../src/db/db'
import { dayjs } from '@wwsc/lib-dates'
import { listActiveSubscriptions } from '../src/stripe'
import { number } from 'zod'
export { stripe, Stripe, listActiveSubscriptions } from '../src/stripe'

type CollectionMethod = 'charge_automatically' | 'send_invoice'

const today = dayjs()

type LiveMember = {
  memberNo: string
  firstName: string
  surname: string
  memType: string
  joined: string
  expires: string
}

async function main() {
  let liveMembers = await db
    .select({
      memberNo: ashbourne.memberNo,
      firstName: ashbourne.firstName,
      surname: ashbourne.surname,
      memType: ashbourne.memType,
      joined: ashbourne.joinedDate,
      expires: ashbourne.expireDate
    })
    .from(ashbourne)
    .where(eq(ashbourne.status, 'Live'))

  checkJoinedDates(liveMembers)
  checkExpiresDates(liveMembers)
  checkMonthlyExpiresDates(liveMembers)
  const autos = await stripeAutoSubscriptions()
  await syncStripeAutoSubscriptions(autos)
  const sends = await stripeSendSubscriptions()
  await syncStripeSendSubscriptions(sends)
  console.log('count of members', liveMembers.length)
}

function checkJoinedDates(members: LiveMember[]) {
  for (let member of members) {
    let joined = dayjs(member.joined)
    if (joined.isAfter(today)) {
      console.log(
        `${member.memberNo} ${member.firstName} ${member.surname} joined in the future`
      )
    }

    if (joined.isBefore(dayjs('1990-01-01'))) {
      console.log(
        `${member.memberNo} ${member.firstName} ${member.surname} ${member.joined} joined far in the past`
      )
    }
  }
}

function checkExpiresDates(members: LiveMember[]) {
  for (let member of members) {
    let expires = dayjs(member.expires)
    if (expires.isBefore(today)) {
      console.log(
        `${member.memberNo} ${member.firstName} ${member.surname} expired on ${expires.format(
          'YYYY-MM-DD'
        )}`
      )
    }
  }
}

function checkMonthlyExpiresDates(members: LiveMember[]) {
  const monthlies = [
    '19-25 yrs DD',
    'Concession Membership',
    'Family Membership',
    'Off Peak DD',
    'Rob Owen Academy',
    'Standard DD',
    'Standard Plus Classes DD'
  ]
  let monthlyMembers = members.filter((member) =>
    monthlies.includes(member.memType)
  )

  for (let member of monthlyMembers) {
    let expires = dayjs(member.expires)
    if (!expires.isAfter(today)) {
      console.log(
        `monthly ${member.memberNo} ${member.firstName} ${member.surname} ${expires.format(
          'YYYY-MM-DD'
        )} not after ${today.format('YYYY-MM-DD')} `
      )
    }
  }
  console.log(monthlyMembers.length)
}

type SummarySubscription = {
  memberNo: string
  name: string
  collection_method: string
  periodStart: string
  periodEnd: string
}

async function stripeAutoSubscriptions() {
  return stripeSubscriptionsByCollectionMethod('charge_automatically')
}

async function stripeSendSubscriptions() {
  return stripeSubscriptionsByCollectionMethod('send_invoice')
}

async function stripeSubscriptionsByCollectionMethod(method: CollectionMethod) {
  let subscriptions = await listActiveSubscriptions()
  let filtered = subscriptions.filter((sub) => {
    let { collection_method } = sub
    return collection_method === method
  })

  let memberNos = new Set<string>()
  let members = filtered.filter((sub) => {
    let { id, customer, metadata } = sub
    let { memberNo } = metadata
    if (!memberNo) {
      console.error(`no memberNo in ${id}`)
      return false
    }

    if (memberNos.has(memberNo)) {
      console.log(`duplicate memberNo ${memberNo}`)
      throw new Error(`duplicate memberNo ${memberNo}`)
    }
    memberNos.add(memberNo)

    if (typeof customer === 'string' || !('name' in customer)) {
      console.error(`customer string or no name ${id}, ${typeof customer}`)

      return false
    }

    return true
  })

  let final = members.map((sub) => {
    let {
      collection_method,
      current_period_start,
      current_period_end,
      customer,
      metadata
    } = sub
    let { memberNo } = metadata

    if (typeof customer === 'string' || !('name' in customer))
      throw new Error('customer.name is not a string')

    let { name } = customer
    if (!name) throw new Error('stripeSubscription no customer name')
    let periodStart = dayjs
      .unix(current_period_start)
      .format('YYYY-MM-DDTHH:mm:ss.000[Z]')
    let periodEnd = dayjs

      .unix(current_period_end)
      .format('YYYY-MM-DDTHH:mm:ss.000[Z]')
    return { memberNo, name, collection_method, periodStart, periodEnd }
  })
  console.log(
    'stripe members',
    method,
    members.length,
    filtered.length,
    subscriptions.length
  )
  return final
}

async function syncStripeAutoSubscriptions(autos: SummarySubscription[]) {
  for (let auto of autos) {
    let { memberNo, name, periodEnd } = auto
    let [member] = await db
      .select({
        firstName: ashbourne.firstName,
        surname: ashbourne.surname,
        expires: ashbourne.expireDate
      })
      .from(ashbourne)
      .where(eq(ashbourne.memberNo, memberNo))

    if (!member) {
      console.error(`no ashbourne member for ${memberNo}`)
      throw new Error(`no ashbourne member for ${memberNo}`)
    }

    if (name !== `${member.firstName} ${member.surname}`) {
      console.error(
        `name mismatch ${memberNo} ${name} !== ${member.firstName} ${member.surname}`
      )
    }

    let expires = dayjs(member.expires)
    let period = dayjs(periodEnd)

    if (!expires.isAfter(today)) {
      console.log(
        `${memberNo} ${member.firstName} ${member.surname} expires in ${expires.format(
          'YYYY-MM-DD'
        )} not before today`
      )
    }
    if (!expires.isSame(period, 'date')) {
      console.log(
        `${memberNo} ${member.firstName} ${member.surname} expires on ${expires.format(
          'YYYY-MM-DD'
        )} not ${period.format('YYYY-MM-DD')}`
      )
    }

    await db
      .update(ashbourne)
      .set({
        expireDate: periodEnd,
        status: 'Live',
        marketingChannel: 'stripe'
      })
      .where(eq(ashbourne.memberNo, memberNo))
  }
}

async function syncStripeSendSubscriptions(autos: SummarySubscription[]) {
  for (let auto of autos) {
    let { memberNo, name, periodEnd } = auto
    let [member] = await db
      .select({
        firstName: ashbourne.firstName,
        surname: ashbourne.surname,
        expires: ashbourne.expireDate
      })
      .from(ashbourne)
      .where(eq(ashbourne.memberNo, memberNo))

    if (!member) {
      console.error(`no ashbourne member for ${memberNo}`)
      throw new Error(`no ashbourne member for ${memberNo}`)
    }

    if (name !== `${member.firstName} ${member.surname}`) {
      console.error(
        `name mismatch ${memberNo} ${name} !== ${member.firstName} ${member.surname}`
      )
    }

    let expires = dayjs(member.expires)
    let period = dayjs(periodEnd)

    if (!expires.isAfter(today)) {
      console.log(
        `${memberNo} ${member.firstName} ${member.surname} expires in ${expires.format(
          'YYYY-MM-DD'
        )} not before today`
      )
    }
    if (!expires.isSame(period, 'date')) {
      console.log(
        `${memberNo} ${member.firstName} ${member.surname} expires on ${expires.format(
          'YYYY-MM-DD'
        )} not ${period.format('YYYY-MM-DD')}`
      )
    }

    await db
      .update(ashbourne)
      .set({
        expireDate: periodEnd,
        status: 'Live',
        marketingChannel: 'send_invoice'
      })
      .where(eq(ashbourne.memberNo, memberNo))
  }
}
await main()
