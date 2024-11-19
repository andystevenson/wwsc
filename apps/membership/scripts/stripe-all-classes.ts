import { getAllClasses } from "../src/stripe";

let allClasses = await getAllClasses();
console.log("all classes types:", allClasses.length);
