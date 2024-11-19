import { migrateSimpleCategory } from "./ashbourne-migrate-category";

const memType = "%16 - 18%";
const membership = "aged-16-18-yearly";

await migrateSimpleCategory(memType, membership);
