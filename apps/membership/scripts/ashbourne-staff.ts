import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Staff%";
const membership = "staff-yearly";

await migrateSimpleCategory(memType, membership);
