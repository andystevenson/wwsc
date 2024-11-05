import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Staff%";
const membership: Membership = "staff";

await migrateSimpleCategory(memType, membership);
