import { hc } from "hono/client";
import { AppType } from "../src/app";

const client = hc<AppType>("http://localhost:7432");
const res = await client.ashbourne.find.$get({
  query: {
    status: "DD Hold",
  },
});

let result = await res.json();
console.log("%o", result);
