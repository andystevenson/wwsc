import {
  type FormattedSubscription,
  getActiveSubscriptions,
} from "../src/stripe";

console.log("Getting active subscriptions...");
let subscriptions = await getActiveSubscriptions();
console.log("Active subscriptions:", subscriptions.length);

import { ashbourne, db, eq } from "../src/db/db";

console.log("Matching subscriptions to Ashbourne...");

let singletons: Record<string, FormattedSubscription> = {};
let multiples: Record<string, FormattedSubscription[]> = {};

let matched: Record<string, FormattedSubscription> = {};
let unmatched: Record<string, FormattedSubscription> = {};
let ambiguous: Record<string, FormattedSubscription[]> = {};

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
    where: eq(ashbourne.email, email),
  });

  console.log("Matching singleton subscription", email, members.length);
  if (members.length === 0) {
    unmatched[email] = subscription;
    continue;
  }

  if (members.length === 1) {
    matched[email] = subscription;
    continue;
  }

  ambiguous[email] = ambiguous[email] || [];
  ambiguous[email].push(subscription);
}
