import { db, InsertMembershipType, membershipTypes } from "../src/db/db";
import { exit } from "node:process";

const defaultTypes: InsertMembershipType[] = [
  {
    type: "under-5",
    status: "active",
    name: "Under 5s",
    description: "Access to all sports supervised by a parent or guardian",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    iterations: 1, // reviewed annually
    paying: false,
  },
  {
    type: "honorary",
    status: "active",
    name: "Honorary Membership",
    description:
      "Honorary lifetime membership award for exceptional service to West Warwicks Sports Club",
    effectiveDate: "2024-01-01",
    frequency: "forever", // lifetime
    paying: false,
  },
  {
    type: "coach",
    status: "active",
    name: "Coach",
    description: "Membership for coaches and instructors",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    iterations: 1, // reviewed annually
    paying: false,
  },
  {
    type: "staff",
    status: "active",
    name: "Staff",
    description: "Membership for staff/employees",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    iterations: 1, // reviewed annually
    paying: false,
  },
  {
    type: "visiting-professional",
    status: "active",
    name: "Visiting Professional",
    description:
      "Membership for visiting professionals using the facilities under the guidance of a coach",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    iterations: 1, // reviewed annually
    paying: false,
  },
  {
    type: "cricket",
    status: "active",
    name: "Cricket",
    description: "Hockey club access to all West Warwicks facilities",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    paying: true,
    price: 30000,
  },
  {
    type: "hockey",
    status: "active",
    name: "Hockey",
    description: "Hockey club access to all West Warwicks facilities",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    paying: true,
    price: 5416.63 * 12,
  },
  {
    type: "astro",
    status: "active",
    name: "Astro",
    description: "Access to the astro facilities",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    iterations: 1, // reviewed annually
    paying: false,
  },
  {
    type: "subcontractor",
    status: "active",
    name: "Subcontractor Access",
    description: "Access for subcontractors working on the facilities",
    effectiveDate: "2024-01-01",
    frequency: "monthly",
    paying: false,
  },
  {
    type: "test",
    status: "active",
    name: "Test Annual Membership",
    description: "Test annual membership",
    effectiveDate: "2024-01-01",
    frequency: "annual",
    iterations: 1, // reviewed annually
    paying: false,
  },
  {
    type: "test",
    status: "active",
    name: "Test Monthly Membership",
    description: "Test annual membership",
    effectiveDate: "2024-01-01",
    frequency: "monthly",
    iterations: 1,
    paying: false,
  },
];

let result = await db.insert(membershipTypes).values(defaultTypes)
  .returning();

console.log("inserted %d membership type records", result.length);
