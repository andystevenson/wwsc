import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { db, Membership } from "../src/db/db";

const memType = "%Coach%";
const membership = "coach-yearly";

await migrateSimpleCategory(memType, membership);

// DONE: annotate ACT coaches with preference tennis, note: [Company] All Court Tennis
// DONE: Matt Corp, Matt Tully, James Horton, Chris Richards, Martyn Wiliams, Claudia Sheftalia, Max Brazier, Luke Ranford, Jacob Hemus
// DONE: annotate ROJA coaches with preference squash, note: [Company] Rob Owen Academy
// DONE: annotate Laila coach with preference gym
// DONE: remove Rob Tattersall as a coach
