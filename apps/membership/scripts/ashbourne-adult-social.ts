import { migrateSimpleCategory } from "./ashbourne-migrate-category";

const memType = "%Social%";
const membership = "social-yearly";

await migrateSimpleCategory(memType, membership);
