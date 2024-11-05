import { loadAshbourne } from "../src/db/db";
import { exit } from "node:process";

const filename = Bun.argv[2];
if (!filename) {
  console.error("Usage: ashbourne-load <filename>");
  exit(1);
}

let result = await loadAshbourne(filename);
console.log("loaded %d records", result.length);
