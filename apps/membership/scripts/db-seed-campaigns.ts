import {
  campaignMemberships,
  campaigns,
  db,
  SelectCampaign,
} from "../src/db/db";
import { getAllPrices, stripe } from "../src/stripe";
import { andy } from "./andy";
import { never } from "@wwsc/lib-dates";

let prices = await getAllPrices();

let campaignNames = new Set<string>();
let campaignPrices: Record<string, string[]> = {};
let campaignLookups: Record<string, string[]> = {};

for (let price of prices) {
  let { id, active, nickname, lookup_key, metadata } = price;
  if (!active) continue;

  let { campaign } = metadata;
  if (!campaign) continue;

  let list = campaign.split(",");
  for (let c of list) {
    let name = c.trim();
    campaignNames.add(name);
    campaignPrices[name] = campaignPrices[name] || [];
    if (campaignPrices[name].includes(id)) console.log("Duplicate price", id);
    campaignPrices[name].push(id);
    campaignLookups[name] = campaignLookups[c] || [];
    if (!lookup_key) {
      console.error("No lookup key", id);
      continue;
    }

    if (nickname !== lookup_key) {
      console.error("Mismatched lookup key", id, nickname, lookup_key);
    }
    if (campaignLookups[c].includes(lookup_key)) {
      console.error("Duplicate lookup", lookup_key);
    }
    campaignLookups[c].push(lookup_key);
  }
}

let createdBy = await andy();

let campaignConfigs: SelectCampaign[] = [{
  id: "yearly",
  description: "Yearly membership category",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "monthly",
  description: "Monthly membership category",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "top-up",
  description: "Top-up membership category",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "club",
  description: "Club membership category",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "3-months-half-price",
  description: "3 months half price membership campaign",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "ACT",
  description: "ACT membership campaign",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "blue-light",
  description: "Blue light membership category",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "family-member",
  description: "Family member membership category",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: never(),
}, {
  id: "set-for-summer",
  description: "Set for summer membership campaign",
  createdBy: createdBy.id,
  created: "2024-07-01",
  start: "2024-07-01",
  end: "2024-09-30",
}, {
  id: "new-year-new-me",
  description: "New year new me membership campaign",
  createdBy: createdBy.id,
  created: "2024-01-01",
  start: "2024-01-01",
  end: "2024-03-31",
}];

let newCampaigns = await db.insert(campaigns).values(campaignConfigs)
  .returning();

console.log(
  "campaignNames %o",
  Object.keys(campaignLookups).length,
  newCampaigns.length,
);
