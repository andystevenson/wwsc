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
// DONE: 13.1 james averill correct email, add to notes, link stripe
// DONE: 15 find Noah Rooney's age? 5-11 (email sent)
// DONE: Paul Coll => created in ashbourne but expired => honorary
// DONE: Sarah-Jane Perry => created in ashbourne but expired => honorary
// DONE: Ollie Rawlins => expire
// DONE: Mark Askey => Live in ashbourne
// DONE: Sara Saqib => Family Membership - Annual
// DONE: Olivia Larche => firstName spaces
// DONE: Killworth => Family Membership - Annual
// DONE: Higgins => Family Membership - Annual, Live
// DONE: Nourouz Skibbe => spaces in name
// DONE: Neary => spaces in name
// DONE: Revert James Raw email to mothers in notes after transfer
// DONE: Revert Sridhar Sundararajan to email in notes after transfer
// DONE: 16. Khadija Heydari => no subscription, Expired
// DONE: Daniel Thompson => BACS paid, annotate the notes somehow
// DONE: Davina,Woodcock => BACS/CASH paid 3 months only, annotate the notes somehow
// DONE: Gabriel Eaton spaces in name
// DONE: Heath Mountney 5-11 paid by BACS/CASH
// DONE: Mick Keenan changing rooms ... is a social member
// DONE: Eva Miller email is corrupt
// DONE: Imogen Bell spaces in name
// DONE: Moore family membership some expired!
// DONE: Magdalena Arvanitakis.... spaces in name/mispelled not live
// DONE: Kathleen Brown adult membership, not on ashbourne
// DONE: Gabrielle Ibrahim is duplicate live,
// DONE: Raphael and Maximum Ibrahim BACS/CASH ?
// TODO: 12. migrate cricket category from ashbourne system to new system
// TODO: 13. migrate 16-18 category from ashbourne system to new system
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
  let types = await $`bun scripts/db-seed-membership-types.ts`.text();
  console.log(types);
  console.log("seeding group subscriptions");
  let groups = await $`bun scripts/db-seed-group-subscriptions.ts`.text();
  console.log(groups);
  console.log("migrating honorary members");
  let honorary = await $`bun scripts/ashbourne-honorary.ts`.text();
  console.log(honorary);
  console.log("migrating changing rooms (astro members)");
  let astro = await $`bun scripts/ashbourne-changing-rooms.ts`.text();
  console.log(astro);
  console.log("migrating staff");
  let staff = await $`bun scripts/ashbourne-staff.ts`.text();
  console.log(staff);
  console.log("migrating Rob Owen Academy");
  let roa = await $`bun scripts/ashbourne-ROA.ts`.text();
  console.log(roa);
  console.log("migrating Coaches");
  let coaches = await $`bun scripts/ashbourne-coach.ts`.text();
  console.log(coaches);
  console.log("migrating under5s");
  let under5s = await $`bun scripts/ashbourne-under5s.ts`.text();
  console.log(under5s);
  console.log("migrate 5-11");
  let aged5_11 = await $`bun scripts/ashbourne-aged-5-11.ts`.text();
  console.log(aged5_11);
  console.log("migrate 12-15");
  let aged12_15 = await $`bun scripts/ashbourne-aged-12-15.ts`.text();
  console.log(aged12_15);
  console.log("migrate 16-18");
  let aged16_18 = await $`bun scripts/ashbourne-aged-16-18.ts`.text();
  console.log(aged16_18);
  console.log("migrate 19-25");
  let aged19_25 = await $`bun scripts/ashbourne-aged-19-25.ts`.text();
  console.log(aged19_25);
  console.log("migrate adult social");
  let adultSocial = await $`bun scripts/ashbourne-adult-social.ts`.text();
  console.log(adultSocial);
  console.log("migrate concession");
  let concession = await $`bun scripts/ashbourne-concession.ts`.text();
  console.log(concession);
  console.log("migrate family");
  console.log("migrate cricket");
  console.log("migrate off peak");
  let offPeak = await $`bun scripts/ashbourne-off-peak.ts`.text();
  console.log(offPeak);
  console.log("migrate standard");
  let standard = await $`bun scripts/ashbourne-standard.ts`.text();
  console.log(standard);
  console.log("migrate standard plus classes");
  let plusClasses = await $`bun scripts/ashbourne-plus-classes.ts`.text();
  console.log(plusClasses);
  console.log("migrate hockey");
  console.log("migrate standard DD");
  console.log("ashbourne migration ended");
} catch (error) {
  console.error("ashbourne migration failed!!!", error);
  exit(1);
}

// DONE: 12 - 15 yrs Annual
// DONE: 16 - 18 yrs Annual
// DONE: 19-25 yrs Annual
// DONE: 19-25 yrs DD
// DONE: 3rd Parties
// DONE: 5 - 11 yrs Annual
// DONE: Adult Social Membership
// DONE: Changing Rooms
// DONE: Coach
// DONE: Concession Membership
// DONE: Concession Membership - Annual
// TODO: Family Membership
// TODO: Family Membership - Annual
// TODO: Junior Cricket
// TODO: Junior Hockey
// DONE: Off Peak Annual
// DONE: Off Peak DD
// DONE: Rob Owen Academy
// DONE: Staff Member
// DONE: Standard Annual
// DONE: Standard DD
// DONE: Standard Plus Classes Annual
// DONE: Standard Plus Classes DD
// TODO: Standard Cricket
// TODO: Standard Cricket & Classes
// TODO: Standard Hockey
// TODO: Standard Hockey & Classes
// DONE: Under 5s
