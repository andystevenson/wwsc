import { useLayoutEffect } from "hono/jsx";
import { migrateSimpleCategory } from "./ashbourne-migrate-category";

let memType = "Concession Membership - Annual";
let membership = "over-65-yearly";

await migrateSimpleCategory(memType, membership);

memType = "Concession Membership";
membership = "over-65-monthly";

await migrateSimpleCategory(memType, membership);
