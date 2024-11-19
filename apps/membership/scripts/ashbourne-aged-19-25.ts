import { migrateSimpleCategory } from "./ashbourne-migrate-category";

let memType = "%25 yrs Annual%";
let membership = "young-adult-yearly";

await migrateSimpleCategory(memType, membership);

memType = "%25 yrs DD%";
membership = "young-adult-monthly";

await migrateSimpleCategory(memType, membership);
