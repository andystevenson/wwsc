import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Coach%";
const membership: Membership = "coach";

await migrateSimpleCategory(memType, membership);

// TODO: annotate ACT coaches with preference tennis, note: [Company] All Court Tennis
// TODO: annotate ROJA coaches with preference squash, note: [Company] Rob Owen Academy
