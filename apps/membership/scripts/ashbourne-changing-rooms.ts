import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Changing Rooms%";
const membership = "astro-yearly";

await migrateSimpleCategory(memType, membership);
