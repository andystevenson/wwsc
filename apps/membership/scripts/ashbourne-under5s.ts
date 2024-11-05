import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Under 5%";
const membership: Membership = "under-5";

await migrateSimpleCategory(memType, membership);
