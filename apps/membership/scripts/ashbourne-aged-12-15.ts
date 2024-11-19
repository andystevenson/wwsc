import { migrateSimpleCategory } from "./ashbourne-migrate-category";

const memType = "%12 - 15%";
const membership = "aged-12-15-yearly";

await migrateSimpleCategory(memType, membership);
