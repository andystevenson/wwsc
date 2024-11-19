import { getAllVisitors } from "../src/stripe";

let all = await getAllVisitors();
console.log("all visitor types:", all.length);
