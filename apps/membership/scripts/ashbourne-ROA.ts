import { migrateSimpleCategory } from "./ashbourne-migrate-category";
import { Membership } from "../src/db/db";

const memType = "%Rob Owen Academy%";
const membership = "visiting-professional-monthly";

await migrateSimpleCategory(memType, membership);
