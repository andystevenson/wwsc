import { dayjs } from "@wwsc/lib-dates";
import {
  db,
  eq,
  InsertSubscription,
  membershipTypes,
  subscriptions,
} from "../src/db/db";

import { exit } from "node:process";

let cricket = await db.query.membershipTypes.findFirst({
  where: eq(membershipTypes.type, "cricket"),
});

let hockey = await db.query.membershipTypes.findFirst({
  where: eq(membershipTypes.type, "hockey"),
});

if (!cricket || !hockey) {
  console.error("cricket or hockey membership type not found");
  exit(1);
}

const october2024 = dayjs("2024-10-01");

const groupSubscriptions: InsertSubscription[] = [
  {
    type: cricket.id,
    payment: "bacs",
    scope: "group",
    status: "active",
    started: october2024.format("YYYY-MM-DD"),
    renews: october2024.add(1, "year").format("YYYY-MM-DD"),
  },
  {
    type: hockey.id,
    payment: "bacs",
    scope: "group",
    status: "active",
    started: october2024.format("YYYY-MM-DD"),
    renews: october2024.add(1, "year").format("YYYY-MM-DD"),
  },
];

let result = await db.insert(subscriptions).values(groupSubscriptions)
  .returning();
console.log("inserted group subscription records %o", result);
