import { factory, z, zValidator } from "../hono-factory";
import { parse } from "csv-parse/sync";
import camelCase from "lodash/camelCase";
import { db, eq, formatAshbourneMember, loadAshbourne } from "../db/db";

import {
  ashbourne,
  type InsertAshbourneMember,
  insertAshbourneSchema,
} from "../db/schema/ashbourne";
let data = [];
let loadSchema = z.object({ file: z.string() });
let loadValidator = zValidator("json", loadSchema);
let findSchema = insertAshbourneSchema.extend({
  memberNo: z.string().optional(),
});
let findValidator = zValidator("query", findSchema);
const router = factory.createApp()
  /**
   * Load a CSV file into the ashbourne table
   * /ashbourne/load
   */
  .post("/load", loadValidator, async (c) => {
    if (c.req.valid("json")) {
      let { file } = loadSchema.parse(await c.req.json());
      return c.json(await loadAshbourne(file, true));
    }

    return c.json({ message: "Invalid request" }, 400);
  })
  /**
   * Find all records in the ashbourne table
   * /ashbourne/find
   */
  .get("/find", findValidator, async (c) => {
    let query = c.req.valid("query");
    let data: InsertAshbourneMember[] = [];
    let members = new Set<string>();

    if (query.memberNo) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.memberNo, query.memberNo),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.id) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.id, query.id),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.status) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.status, query.status),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.cardNo) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.cardNo, query.cardNo),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.ashRef) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.ashRef, query.ashRef),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.memTitle) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.memTitle, query.memTitle),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.firstName) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.firstName, query.firstName),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.surname) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.surname, query.surname),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.knownAs) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.knownAs, query.knownAs),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.additionalDob) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.additionalDob, query.additionalDob),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.postcode) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.postcode, query.postcode),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.dob) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.dob, query.dob),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.lastPayDate) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.lastPayDate, query.lastPayDate),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.clubInfo) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.clubInfo, query.clubInfo),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.periodPayment) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.periodPayment, query.periodPayment),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.memType) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.memType, query.memType),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.joinedDate) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.joinedDate, query.joinedDate),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.expireDate) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.expireDate, query.expireDate),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.reviewDate) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.reviewDate, query.reviewDate),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.mobile) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.mobile, query.mobile),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.phoneNo) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.phoneNo, query.phoneNo),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.email) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.email, query.email),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.paymentNumber) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.paymentNumber, query.paymentNumber),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.paymentMonth) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.paymentMonth, query.paymentMonth),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.paymentYear) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.paymentYear, query.paymentYear),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.paymentDate) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.paymentDate, query.paymentDate),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.address) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.address, query.address),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.lastVisit) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.lastVisit, query.lastVisit),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.facilityNo) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.facilityNo, query.facilityNo),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.notes) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.notes, query.notes),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    if (query.marketingChannel) {
      let result = await db.select().from(ashbourne).where(
        eq(ashbourne.marketingChannel, query.marketingChannel),
      );
      data.push(...result.filter((r) => !members.has(r.memberNo)));
    }

    return c.json(data);
  })
  /**
   * Get all records in the ashbourne table
   * /ashbourne/all
   */
  .get("/all", async (c) => {
    let data = await db.query.ashbourne.findMany();
    return c.json(data);
  })
  /**
   * Select specific columns from the ashbourne table
   * /ashbourne/select?columns=column1,column2,column3
   */
  .get("/select", async (c) => {
    let columns = c.req.query("columns");
    let select: Record<string, any> = {};
    let columnsArray = columns ? columns.split(",").map((c) => c.trim()) : [];
    columnsArray.forEach((c) => {
      type T = typeof ashbourne;
      let cT = c as keyof T;
      select[c] = ashbourne[cT];
    });

    let data = await db.selectDistinct(select).from(ashbourne);
    return c.json(data);
  })
  /**
   * Get distinct records from the ashbourne table
   * /ashbourne/distinct?columns=column1,column2,column3
   */
  .get("/findMany", async (c) => {
    let select = c.req.query("select");
    if (!select) {
      return c.json({ message: "Invalid request" }, 400);
    }
    let query = JSON.parse(select);
    let data = await db.query.ashbourne.findMany(query);
    return c.json(data);
  });

export default router;
