import {
  ashbourneMembers,
  coachTypeFromNotes,
  companyFromNotes,
} from "../src/db/functions";
import {
  db,
  type DBTransaction,
  events,
  genders,
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
  Membership,
  notes,
  Preference,
  preferences,
  SelectMembership,
  subscriptions,
} from "../src/db/db";
import { andy } from "./andy";
import { age, Dayjs, dayjs, lastOctoberUK, never, now } from "@wwsc/lib-dates";

let creator = await andy();

/**
 * migrate all members of a specific category from Ashbourne
 * @param memType eiher a membership category or an array of member numbers
 * @param membership
 */
export async function migrateSimpleCategory(
  memType: string | string[],
  membership: string,
) {
  let members = await ashbourneMembers(memType);
  let type = await getMembership(membership);
  let result = await db.transaction(async (tx) => {
    for (let member of members) {
      await migrateMember(member, type, tx);
    }
  });

  await db.transaction(async (tx) => {
  });
  console.log(members.length, `${membership} migrated`);
}

function nextRenews(joined: Dayjs, frequency: dayjs.ManipulateType = "year") {
  let next = joined.add(1, frequency);
  while (next.isBefore(now())) {
    next = next.add(1, "year");
  }
  return next;
}

async function newSubscription(
  start: Dayjs,
  membership: SelectMembership,
  tx: DBTransaction | null = null,
) {
  let startDate = start.format("YYYY-MM-DD");
  let renewsDate = nextRenews(start, membership.interval).format("YYYY-MM-DD");
  let subscription: InsertSubscription = {
    membership: membership.id,
    payment: "free",
    scope: "individual",
    started: startDate,
    renews: renewsDate,
  };

  return await insert<InsertSubscription>(subscriptions, subscription, tx);
}

async function migrateMember(
  ashbourne: any,
  type: SelectMembership,
  tx: DBTransaction | null = null,
) {
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
    additionalDob,
  } = ashbourne;

  let gender = await insert<InsertGender>(genders, {
    gender: memTitle || "unknown",
  }, tx);

  let ashAge = age(additionalDob || dob) < 100 ? true : false;
  let actualJoinedDate = dayjs(joinedDate || now());
  let review = nextRenews(actualJoinedDate).subtract(1, "month");
  let subscription = await newSubscription(actualJoinedDate, type, tx);
  let ashMember: InsertMember = {
    firstName,
    surname,
    postcode,
    dob: ashAge ? (additionalDob || dob) : null,
    gender: gender.id,
    mobile: mobile || phoneNo,
    email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email) ? email : "",
    address,
    createdBy: creator.id,
    subscription: subscription.id,
  };

  let member = await insert<InsertMember>(members, ashMember, tx);
  if (ashNotes) {
    await insert<InsertNote>(notes, {
      date: lastOctoberUK.format("YYYY-MM-DD"),
      createdBy: creator.id,
      member: member.id,
      content: ashNotes,
    }, tx);

    let company = companyFromNotes(ashNotes);
    let coachType = coachTypeFromNotes(ashNotes);

    if (company) {
      await insert<InsertNote>(notes, {
        date: now(),
        createdBy: creator.id,
        member: member.id,
        content: `[company] ${company}`,
      }, tx);
    }

    if (coachType) {
      await insert<InsertPreference>(preferences, {
        type: coachType as Preference,
        member: member.id,
      }, tx);
    }
  }

  await insert<InsertIdentity>(identities, {
    id: member.id,
    memberNo,
    ashId,
    ashRef,
    card,
  }, tx);

  await insert<InsertEvent>(events, {
    date: actualJoinedDate.format("YYYY-MM-DD"),
    type: "joined",
    member: member.id,
    note: `migrated ${firstName} ${surname} from ashbourne`,
  }, tx);

  await insert<InsertEvent>(events, {
    date: review.format("YYYY-MM-DD"),
    type: "review",
    member: member.id,
    note: `review as renewal happens on ${
      review.add(1, "month").format("dddd YYYY-MM-DD")
    }`,
  }, tx);

  await insert<InsertPreference>(preferences, {
    type: "email-marketing",
    member: member.id,
  }, tx);

  if (type.type === "visiting-professional") {
    await insert<InsertPreference>(preferences, {
      type: "squash",
      member: member.id,
    }, tx);
  }

  if (ashMember.mobile) {
    await insert<InsertPreference>(preferences, {
      type: "sms-marketing",
      member: member.id,
    }, tx);
  }
  return member;
}
