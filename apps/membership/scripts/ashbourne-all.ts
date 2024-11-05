import { hc } from "hono/client";
import { AppType } from "../src/app";

const client = hc<AppType>("http://localhost:7432");
const res = await client.ashbourne.all.$get();

let result = await res.json();
console.log("%o", result);
