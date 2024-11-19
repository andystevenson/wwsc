import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Under 5%";
const membership = "under-5-yearly";

await migrateSimpleCategory(memType, membership);
