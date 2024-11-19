import {
  type FormattedSubscription,
  getActiveSubscriptions,
  updateSubscriptionMetadata,
} from "../src/stripe";
import {
  and,
  ashbourne,
  db,
  eq,
  type SelectAshbourneMember,
} from "../src/db/db";

console.log("Getting active subscriptions...");
let subscriptions = await getActiveSubscriptions();
console.log("Active subscriptions:", subscriptions.length);

console.log("Matching subscriptions to Ashbourne...");

let singletons: Record<string, FormattedSubscription> = {};
let multiples: Record<string, FormattedSubscription[]> = {};

type Matched = {
  ashbourne: SelectAshbourneMember;
  subscription: FormattedSubscription;
};

type Ambiguous = {
  aSubscription: FormattedSubscription;
  aMembers: SelectAshbourneMember[];
};

let matched: Record<string, Matched> = {};
let unmatched: Record<string, FormattedSubscription> = {};
let ambiguous: Record<string, Ambiguous> = {};

// populate multiples
for (let subscription of subscriptions) {
  const { email } = subscription;
  if (!email) {
    console.log("No email for subscription:", subscription);
    continue;
  }
  let lEmail = email.toLowerCase();
  multiples[lEmail] = multiples[lEmail] || [];
  multiples[lEmail].push(subscription);
}

// populate singletons
for (let email in multiples) {
  let subscriptions = multiples[email];
  if (subscriptions.length === 1) {
    singletons[email] = subscriptions[0];
    delete multiples[email]; // remove from multiples
  }
}

// match singletons to Ashbourne
for (let email in singletons) {
  let subscription = singletons[email];
  let members = await db.query.ashbourne.findMany({
    where: and(
      eq(ashbourne.email, email),
      eq(ashbourne.status, "Live"),
      eq(ashbourne.ashRef, ""),
    ),
  });

  if (members.length === 0) {
    if (subscription.config.memberNo) {
      // this has already been found
      let member = await db.query.ashbourne.findFirst({
        where: eq(ashbourne.memberNo, subscription.config.memberNo),
      });
      if (!member) {
        throw new TypeError(`Member not found ${subscription.config.memberNo}`);
      }
      matched[email] = { ashbourne: member, subscription };
      continue;
    }
    unmatched[email] = subscription;
    continue;
  }

  if (members.length === 1) {
    let ashbourne = members[0];
    matched[email] = { ashbourne, subscription };
    continue;
  }

  ambiguous[email] = ambiguous[email] || { aMembers: [] };
  let { aMembers } = ambiguous[email];
  ambiguous[email].aSubscription = subscription;
  aMembers.push(...members);
}

for (let match of Object.keys(matched)) {
  let { ashbourne, subscription } = matched[match];
  let { memType, firstName, surname, memberNo } = ashbourne;
  let { name, lookup_key, nickname, id, config } = subscription;
  let metadata = { memberNo, memType, firstName, surname };

  if (config && config.memberNo) {
    // console.log("Subscription already has metadata:", config);
    continue;
  }
  console.log(
    `Matched ${match} ${firstName} ${surname} (${memType}) to ${name} (${lookup_key}/${nickname})`,
  );
  let update = await updateSubscriptionMetadata(id, metadata);
  console.log("Updated subscription metadata:", update.id);
}
console.log("matched", Object.keys(matched).length);

for (let email of Object.keys(unmatched)) {
  let subscription = unmatched[email];
  let { id, name } = subscription;
  console.log("Unmatched:", email, name, id);
}

// for (let ambiguity of Object.keys(ambiguous)) {
//   let { aMembers, aSubscription } = ambiguous[ambiguity];
//   let members = aMembers.map((m) => {
//     let { memberNo, memType, firstName, surname, status } = m;
//     return `${firstName} ${surname} (${memType}/${memberNo}/${status})`;
//   }).join(", ");

//   let { id, name, nickname } = aSubscription;

//   console.log(
//     "Ambiguous:",
//     ambiguity,
//     id,
//     name,
//     nickname,
//     "\n=>",
//     members,
//   );
// }

console.log("multiples:", Object.keys(multiples).length);
console.log("Done.");
