import {
  ashbourneMembers,
  coachTypeFromNotes,
  companyFromNotes
} from '../src/db/functions'
import {
  db,
  eq,
  type DBTransaction,
  events,
  genders,
  type GenderType,
  getMembership,
  identities,
  insert,
  InsertEvent,
  type InsertGender,
  InsertIdentity,
  type InsertMember,
  type InsertNote,
  InsertPreference,
  type InsertSubscription,
  members,
  notes,
  PreferenceType,
  preferences,
  Membership,
  subscriptions,
  AshbourneMember,
  memberships
} from '../src/db/db'
import { andy } from './andy'
import { age, Dayjs, dayjs, lastOctoberUK, never, now } from '@wwsc/lib-dates'

let creator = await andy()

/**
 * migrate all members of a specific category from Ashbourne
 * @param memType eiher a membership category or an array of member numbers
 * @param membership
 */
export async function migrateSimpleCategory(
  memType: string | string[],
  membership: string
) {
  let members = await ashbourneMembers(memType)
  let mtype = await getMembership(membership)
  let result = await db.transaction(async (tx) => {
    for (let member of members) {
      await migrateMember(member, mtype, tx)
    }
  })

  await db.transaction(async (tx) => {})
  console.log(members.length, `${membership} migrated`)
}

function nextRenews(joined: Dayjs, dob: string | null, membership: Membership) {
  let next = joined.add(1, membership.interval)

  if (membership.category === 'under-5') {
    if (!dob) throw new Error('dob is required for under-5s')
    const birthday = dayjs(dob)
    next = birthday.add(6, 'year')

    console.log('under5age', age(birthday), dob, next.format('YYYY-MM-DD'))
    return next
  }

  while (next.isBefore(now())) {
    next = next.add(1, 'year')
  }
  return next
}

async function newSubscription(
  start: Dayjs,
  dob: string | null,
  membership: Membership,
  tx: DBTransaction | null = null
) {
  let startDate = start.isAfter(dayjs('1999-12-31'), 'date')
    ? start.format('YYYY-MM-DD')
    : '2000-01-01'
  let renewingFrom = dayjs(startDate)
  let renewsDate = nextRenews(renewingFrom, dob, membership).format(
    'YYYY-MM-DD'
  )
  let subscription: InsertSubscription = {
    membership: membership.id,
    payment: 'free',
    scope: 'individual',
    started: startDate,
    renews: renewsDate
  }

  return await insert<InsertSubscription>(subscriptions, subscription, tx)
}

async function migrateMember(
  ashbourne: AshbourneMember,
  type: Membership,
  tx: DBTransaction | null = null
) {
  // check if this member has already been migrated
  console.log(
    'migrating',
    ashbourne.firstName,
    ashbourne.surname,
    ashbourne.memberNo
  )
  if (await hasMigrated(ashbourne)) return

  // find the creator of all good things
  let {
    memberNo,
    id: ashId,
    ashRef,
    cardNo: card,
    memTitle,
    firstName,
    surname,
    postcode,
    dob,
    mobile,
    phoneNo,
    email,
    address,
    notes: ashNotes,
    joinedDate,
    lastPayDate,
    expireDate,
    reviewDate: ashReviewDate,
    lastVisit,
    additionalDob
  } = ashbourne

  let gender = await insert<InsertGender>(
    genders,
    {
      gender: (memTitle as GenderType) || 'unknown'
    },
    tx
  )

  let ashAge = age(additionalDob || dob) < 100 ? true : false
  let chosenDob = ashAge ? additionalDob || dob : null
  let actualJoinedDate = dayjs(joinedDate || now())
  let review = nextRenews(actualJoinedDate, chosenDob, type).subtract(
    1,
    'month'
  )
  let subscription = await newSubscription(
    actualJoinedDate,
    chosenDob,
    type,
    tx
  )
  let ashMember: InsertMember = {
    firstName,
    surname,
    postcode,
    dob: chosenDob,
    gender: gender.id,
    mobile: mobile || phoneNo,
    email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email) ? email : '',
    address,
    createdBy: creator.id,
    subscription: subscription.id
  }

  let member = await insert<InsertMember>(members, ashMember, tx)
  if (ashNotes) {
    await insert<InsertNote>(
      notes,
      {
        date: lastOctoberUK.format('YYYY-MM-DD'),
        createdBy: creator.id,
        member: member.id,
        content: ashNotes
      },
      tx
    )

    let company = companyFromNotes(ashNotes)
    let coachType = coachTypeFromNotes(ashNotes)

    if (company) {
      await insert<InsertNote>(
        notes,
        {
          date: now(),
          createdBy: creator.id,
          member: member.id,
          content: `[company] ${company}`
        },
        tx
      )
    }

    if (coachType) {
      await insert<InsertPreference>(
        preferences,
        {
          type: coachType as PreferenceType,
          member: member.id
        },
        tx
      )
    }
  }

  await insert<InsertIdentity>(
    identities,
    {
      id: member.id,
      memberNo,
      ashId,
      ashRef,
      card
    },
    tx
  )

  await insert<InsertEvent>(
    events,
    {
      date: actualJoinedDate.format('YYYY-MM-DD'),
      type: 'joined',
      member: member.id,
      note: `migrated ${firstName} ${surname} from ashbourne`
    },
    tx
  )

  await insert<InsertEvent>(
    events,
    {
      date: review.format('YYYY-MM-DD'),
      type: 'review',
      member: member.id,
      note: `review as renewal happens on ${review
        .add(1, 'month')
        .format('dddd YYYY-MM-DD')}`
    },
    tx
  )

  await insert<InsertPreference>(
    preferences,
    {
      type: 'email-marketing',
      member: member.id
    },
    tx
  )

  if (type.category === 'professional') {
    await insert<InsertPreference>(
      preferences,
      {
        type: 'squash',
        member: member.id
      },
      tx
    )
  }

  if (ashMember.mobile) {
    await insert<InsertPreference>(
      preferences,
      {
        type: 'sms-marketing',
        member: member.id
      },
      tx
    )
  }
  return member
}

/**
 * Has this member already been migrated?
 * @param member
 * @returns boolean
 */
async function hasMigrated(ashbourne: AshbourneMember) {
  let { memberNo } = ashbourne
  let [member] = await db
    .select({ id: identities.id, memberNo: identities.memberNo })
    .from(identities)
    .where(eq(identities.memberNo, memberNo))
  if (member) {
    let [m] = await db
      .select({
        firstName: members.firstName,
        surname: members.surname,
        category: memberships.category
      })
      .from(members)
      .where(eq(members.id, member.id))
      .innerJoin(subscriptions, eq(subscriptions.id, members.subscription))
      .innerJoin(memberships, eq(memberships.id, subscriptions.membership))
    if (!m)
      throw new Error(`member id=[${member.id}] memberNo:${memberNo} not found`)
    let { firstName, surname, category } = m
    console.log(
      `member ${firstName} ${surname} memberNo:${memberNo} already migrated to ${category}`
    )
    return true
  }

  return false
}
