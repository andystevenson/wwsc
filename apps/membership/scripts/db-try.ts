import {
  db,
  eq,
  members,
  memberships,
  Preference,
  preferences,
  subscriptions,
} from "../src/db/db";

let people = await db.select({
  id: members.id,
  firstName: members.firstName,
  surname: members.surname,
  type: memberships.type,
  preference: preferences.type,
}).from(memberships)
  .where(eq(memberships.type, "coach"))
  .leftJoin(subscriptions, eq(subscriptions.membership, memberships.id))
  .leftJoin(members, eq(members.subscription, subscriptions.id))
  .leftJoin(preferences, eq(preferences.member, members.id));

people = people.filter((p) => p.id ? p : false);
console.log(people.flat());
