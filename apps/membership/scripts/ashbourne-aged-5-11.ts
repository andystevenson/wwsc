import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%5 - 11%";
const membership = "aged-5-11-yearly";

await migrateSimpleCategory(memType, membership);
