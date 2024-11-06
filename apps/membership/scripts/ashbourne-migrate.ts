// TODO: migrate membership data from old ashbourne system to new system
// DONE: 1. seed system users into database
// DONE: 2. seed membership-types into database
// DONE: 3. seed ashbourne live members into database
// DONE: 4. seed group subscriptions into database
// DONE: 5. migrate under5s from ashbourne system to new system
// DONE: 6. migrate changing rooms (astro members) from ashbourne system to new system
// DONE: 7. remove 3rd party category from ashbourne system
// DONE: 7.1: Aarav Dhir remove
// DONE: 7.2: Alina add surname
// DONE: 7.3: Angela Cleaner remove
// DONE: 7.4: Ashbourne Test remove
// DONE: 7.5: Bar Bar remove
// DONE: 7.6: Blossom Fraser remove
// DONE: 7.7: Nigel Christian remove
// DONE: 7.8: Physio Urban body remove
// DONE: 7.9: Laila Khuran move to coach
// DONE: 7.10: Joshua Thompson remove
// DONE: 7.11: Are Hayden, Georgia Campos, still Staff
// DONE: 7.12: Shane Taylor ... what are the rules on staff family members
// DONE: 7.13: missing staff members
// DONE: 7.14: Maddie Caddick ... is she Maddie Savage
// DONE: 7.15: Toby Bradshaw remove
// DONE: 7.16: Simon Clarke remove
// DONE: 7.17: Test Test remove
// DONE: 8. remove out-of-date staff members from ashbourne system
// DONE: 9. migrate staff category from ashbourne system to new system
// DONE: 10. migrate coach category from ashbourne system to new system
// DONE: 10.1 Jonathan Tate remove
// DONE: 10.2 Dan Evans => honorary
// DONE: 11. migrate Rob Owen category from ashbourne system to new system
// DONE: 11.1 Rob Owen => honorary
// DONE: 11.2 Sam Osborne-Wylde => coach, squash, note: [Company] Rob Owen Academy
// DONE: 11.3 Jonah Bryant => coach, squash, note: [Company] Rob Owen Academy
// DONE: 11.4 Joshua Master remove
// DONE: 11.5 Jasmine Hutton remove
// DONE: 11.6 Rob Norman => coach, squash, note: [Company] Rob Owen Academy
// DONE: 11.7 Elijah Thomas => coach, squash, note: [Company] Rob Owen Academy
// DONE: 11.8 Sam Osborne-Wilde remove
// DONE: 11.9 Tesni Evans remove
// DONE: 11.10 Katie Maliff remove
// TODO: 12. migrate cricket category from ashbourne system to new system
// TODO: 13. migrate 16-18 category from ashbourne system to new system
// DONE: 13.1 james averill correct email, add to notes, link stripe
// TODO: 14. migrate 12-15 category from ashbourne system to new system

import { $ } from "bun";
import { exit } from "node:process";

try {
  console.log("ashbourne migration started ...");
  console.log("clean database");
  await $`rm /var/lib/wwsc/membership.db`.quiet();
  console.log("creating database schema");
  await $`drizzle-kit push`.quiet();
  console.log("seeding system users");
  await $`bun ./scripts/db-seed-users.ts`.quiet();
  console.log("loading ashbourne legacy members ...");
  let legacy =
    await $`bun scripts/ashbourne-load.ts ~/ashbourne-final/ashbourne.csv`
      .text();
  console.log(legacy);
  console.log("seeding default membership types");
  let types = await $`bun scripts/db-seed-default-membership-types.ts`.text();
  console.log(types);
  console.log("seeding group subscriptions");
  let groups = await $`bun scripts/db-seed-group-subscriptions.ts`.text();
  console.log(groups);
  console.log("migrating under5s");
  let under5s = await $`bun scripts/ashbourne-under5s.ts`.text();
  console.log(under5s);
  console.log("migrating changing rooms (astro members)");
  let astro = await $`bun scripts/ashbourne-changing-rooms.ts`.text();
  console.log(astro);
  console.log("migrating staff");
  let staff = await $`bun scripts/ashbourne-staff.ts`.text();
  console.log(staff);
  console.log("ashbourne migration ended");
} catch (error) {
  console.error("ashbourne migration failed!!!", error);
  exit(1);
}
