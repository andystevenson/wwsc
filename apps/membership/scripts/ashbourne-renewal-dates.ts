import { ashbourneMembers, memTypeToCategory } from '../src/db/functions'
import {
  selectMembersByCategory,
  memberExistsInStripe,
  subscriptionExistsInStripe
} from './wwarms-links-stripe'
import { dayjs } from '@wwsc/lib-dates'

import { db, eq, subscriptions, type Category } from '../src/db/db'
import { check } from 'drizzle-orm/mysql-core'

async function main() {
  let argv = Bun.argv
  let memType = argv[2]
  if (!memType) {
    console.error('Usage: ashbourne-renewal-dates <memType>')
    return
  }

  let category = memTypeToCategory(memType)
  if (!category) {
    console.error('unknown memType', memType)
    return
  }
  let type = argv[3] ? argv[3] : ''

  console.log('%o', { memType, category, type })

  let members = await ashbourneMembers(memType)
  let liveMembers = members.map((member) => {
    const { memberNo, firstName, surname, status, joinedDate, expireDate } =
      member
    return {
      memberNo,
      firstName,
      surname,
      status,
      joinedDate: dayjs(joinedDate).format('YYYY-MM-DD'),
      expireDate: dayjs(expireDate).format('YYYY-MM-DD')
    }
  })

  let selectedMembers = await selectMembersByCategory(
    category as Category,
    type
  )

  if (selectedMembers.length !== liveMembers.length) {
    console.error(
      'should have the same number of members',
      selectedMembers.length,
      liveMembers.length
    )
    return
  }

  let targets = liveMembers.map((member) => {
    let selected = selectedMembers.find((sm) => sm.memberNo === member.memberNo)
    if (!selected) {
      console.error('selected member not migrated')
      return
    }

    let { subscription, category, type } = selected
    return { ...member, subscription, category, type }
  })

  type Target = (typeof targets)[0] & { started: string; renews: string }
  let merged: Target[] = []
  for (let target of targets) {
    if (!target) continue
    let s = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, target.subscription))

    let { started, renews } = s[0]
    if (!started || !renews) {
      console.error('started or renews not found')
      return
    }
    let mergedTarget: Target = { ...target, started, renews }
    merged.push(mergedTarget)
  }
  // console.log('%o', { merged })

  function checkRewewalDates(targets: Target[]) {
    let mismatched: Target[] = []
    for (let target of targets) {
      let {
        memberNo,
        firstName,
        surname,
        joinedDate,
        expireDate,
        started,
        renews
      } = target
      let now = dayjs()
      let e = dayjs(expireDate)
      let enext = e.add(1, 'day')
      let r = dayjs(renews)

      if (!e.isSame(r, 'date') && !r.isSame(enext, 'date')) {
        console.error('expireDate and renews are not the same')
        console.error({ memberNo, firstName, surname, expireDate, renews })
        mismatched.push(target)
      }
    }

    console.log('mismatched:', mismatched.length, 'of', targets.length)
    return mismatched
  }

  let mismatched = checkRewewalDates(merged)

  async function checkStripe(targets: Target[]) {
    type MismatchedTarget = Target & {
      id: string
      pstart: string
      pend: string
      collection_method: string
    }
    let mismatched: MismatchedTarget[] = []
    for (let target of targets) {
      let { memberNo, firstName, surname } = target
      let exists = await subscriptionExistsInStripe(memberNo)
      if (!exists) {
        console.error('member does not exist in stripe')
        console.error({ memberNo, firstName, surname })
        continue
      }

      let { id, current_period_start, current_period_end, collection_method } =
        exists

      if (collection_method === 'charge_automatically') {
        continue
      }
      let pstart = dayjs(current_period_start * 1000).format('YYYY-MM-DD')
      let pend = dayjs(current_period_end * 1000).format('YYYY-MM-DD')
      console.log('%o', { ...target, pstart, pend, collection_method })
      mismatched.push({ ...target, id, pstart, pend, collection_method })
    }

    console.log('stripe mismatched:', mismatched.length, 'of', targets.length)
    return mismatched
  }

  let stripeMismatched = await checkStripe(mismatched)
}

await main()
