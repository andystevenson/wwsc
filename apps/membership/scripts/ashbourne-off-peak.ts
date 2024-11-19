import { useLayoutEffect } from "hono/jsx";
import { migrateSimpleCategory } from "./ashbourne-migrate-category";

let memType = "Off Peak Annual";
let membership = "off-peak-yearly";

await migrateSimpleCategory(memType, membership);

memType = "Off Peak DD";
membership = "off-peak-monthly";

await migrateSimpleCategory(memType, membership);
