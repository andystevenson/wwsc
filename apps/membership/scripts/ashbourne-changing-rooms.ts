import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Changing Rooms%";
const membership: Membership = "astro";

await migrateSimpleCategory(memType, membership);
