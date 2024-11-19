import {
  db,
  InsertMembership,
  Membership,
  MembershipInterval,
  memberships,
} from "../src/db/db";

import { getAllMembershipTypes } from "../src/stripe";

let membershipTypes = await getAllMembershipTypes();
console.log("all membership types:", membershipTypes.length);

let all = await Promise.all(membershipTypes.map((m) => {
  let { id: stripeProduct, description } = m;
  return Promise.all(m.prices.map((p) => {
    const { id: stripePrice, name, lookup_key, interval, intervals, metadata } =
      p;
    let iterations = 1;
    let { phases } = metadata;
    if (phases) {
      let ps = JSON.parse(phases);
      for (let phase of ps) {
        let { iterations: iters, changes } = phase;
        if (iters) {
          iterations = iters;
        }
      }
    }

    let membership: InsertMembership = {
      id: lookup_key || "",
      description: description || "",
      type: name as Membership,
      effectiveDate: "2024-01-01",
      interval: interval as MembershipInterval,
      intervals,
      iterations,
      stripePrice,
      stripeProduct,
    };
    return db.insert(memberships).values(membership);
  }));
}));
