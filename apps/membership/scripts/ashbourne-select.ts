import { hc } from "hono/client";
import { AppType } from "../src/app";

const client = hc<AppType>("http://localhost:7432");
const res = await client.ashbourne.select.$get({
  query: {
    columns: "status",
  },
});

let result = await res.json();
console.log("%o", result);
