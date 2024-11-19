import { dayjs } from "@wwsc/lib-dates";
import {
  db,
  eq,
  InsertSubscription,
  memberships,
  subscriptions,
} from "../src/db/db";

import { exit } from "node:process";

let cricket = await db.query.memberships.findFirst({
  where: eq(memberships.id, "cricket-club-monthly"),
});

let hockey = await db.query.memberships.findFirst({
  where: eq(memberships.id, "hockey-club-monthly"),
});

if (!cricket || !hockey) {
  console.error("cricket or hockey membership type not found");
  exit(1);
}

const october2024 = dayjs("2024-10-01");
const april2024 = dayjs("2024-04-01");

const groupSubscriptions: InsertSubscription[] = [
  {
    membership: cricket.id,
    payment: "bacs",
    scope: "group",
    status: "active",
    started: april2024.format("YYYY-MM-DD"),
    renews: april2024.add(1, "year").format("YYYY-MM-DD"),
  },
  {
    membership: hockey.id,
    payment: "bacs",
    scope: "group",
    status: "active",
    started: october2024.format("YYYY-MM-DD"),
    renews: october2024.add(1, "year").format("YYYY-MM-DD"),
  },
];

let result = await db.insert(subscriptions).values(groupSubscriptions)
  .returning();
console.log("inserted group subscription records %o", result.length);
