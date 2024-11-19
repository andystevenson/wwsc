import { getAllMembershipTypes } from "../src/stripe";

let allMembershipTypes = await getAllMembershipTypes();
console.log("all membership types:", allMembershipTypes.length);
