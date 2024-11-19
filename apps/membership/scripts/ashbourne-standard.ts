import { useLayoutEffect } from "hono/jsx";
import { migrateSimpleCategory } from "./ashbourne-migrate-category";

let memType = "Standard Annual";
let membership = "adult-yearly";

await migrateSimpleCategory(memType, membership);

memType = "Standard DD";
membership = "adult-monthly";

await migrateSimpleCategory(memType, membership);
