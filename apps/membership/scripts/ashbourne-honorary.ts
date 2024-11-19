import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import {
  db,
  eq,
  members,
  Membership,
  memberships,
  Preference,
  preferences,
  subscriptions,
} from "../src/db/db";

// Rob Owen => honorary
// Dan Evans => honorary
// Sarah-Jane Perry => honorary
// Paul Coll => honorary
const memType: string[] = ["1151835", "1151604", "3312762", "1170186"];
const membership = "honorary-yearly";

await migrateSimpleCategory(memType, membership);
// DONE: 1. set the renewal date to forever for all of these
// DONE: 2. add squash preference Squash and then Tennis for Dan Evans

let honoraries = await db.select({
  id: members.id,
  firstName: members.firstName,
  surname: members.surname,
  type: memberships.type,
}).from(memberships)
  .where(eq(memberships.type, "honorary"))
  .leftJoin(subscriptions, eq(subscriptions.membership, memberships.id))
  .leftJoin(members, eq(members.subscription, subscriptions.id));

let results = await Promise.all(honoraries.map(async (honorary) => {
  let type: Preference = honorary.surname === "Evans" ? "tennis" : "squash";
  return db.insert(preferences).values({ member: honorary.id, type })
    .returning();
}));

// console.log(results.flat());
