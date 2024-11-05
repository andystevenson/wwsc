import { dayjs } from "@wwsc/lib-dates";
import {
  get,
  getAttachments,
  getBankAccounts,
  getLedgerAccounts,
  getPaymentMethods,
  getPurchaseCreditNotes,
  getPurchaseInvoices,
  getTaxRates,
  getUser,
  type User,
} from "@wwsc/lib-sage";
import { mkdirSync } from "node:fs";
import kebabCase from "lodash.kebabcase";
import { stringify } from "csv-stringify/sync";

import { getDailyTakings } from "../db/getDailyTakings";
import { postDailyTakings } from "../db/postDailyTakings";
import { reverseDailyTakings } from "../db/reverseDailyTakings";
import { postMonthlyTakings } from "../db/postMonthlyTakings";
import { reverseMonthlyTakings } from "../db/reverseMonthlyTakings";
import { encodeBase64, factory, refresh } from "../Hono";
import { xlsx } from "../utilities/xlsx";
import { scanFromFiles } from "@wwsc/lib-invoice";

import download from "download";

const sage = factory.createApp();
sage.use(refresh);

sage.get("/", async (c) => {
  const user = await getUser(c.get("token"));
  return c.json(user);
});

sage.get("/user", async (c) => {
  const user = await getUser(c.get("token"));
  return c.json(user);
});

sage.get("/bank-accounts", async (c) => {
  const bankAccounts = await getBankAccounts(c.get("token"));
  return c.json(bankAccounts);
});

sage.get("/payment-methods", async (c) => {
  const paymentMethods = await getPaymentMethods(c.get("token"));
  return c.json(paymentMethods);
});

sage.get("/ledger-accounts", async (c) => {
  const ledgerAccounts = await getLedgerAccounts(c.get("token"));
  return c.json(ledgerAccounts);
});

sage.get("/tax-rates", async (c) => {
  const taxRates = await getTaxRates(c.get("token"));
  return c.json(taxRates);
});

sage.get("/daily-takings", async (c) => {
  const date = c.req.query("date");
  if (!date) {
    c.status(400);
    return c.json({ error: "/sage/daily-takings Missing date" });
  }
  const dailyTakings = await getDailyTakings(date);
  return c.json(dailyTakings);
});

sage.get("/post-daily-takings", async (c) => {
  const date = c.req.query("date");
  if (!date) {
    c.status(400);
    return c.json({ error: "/sage/post-daily-takings Missing date" });
  }

  const dailyTakings = await postDailyTakings(c.get("token"), date);
  return c.json(dailyTakings);
});

sage.get("/reverse-daily-takings", async (c) => {
  const date = c.req.query("date");
  if (!date) {
    c.status(400);
    return c.json({ error: "/sage/reverse-daily-takings Missing date" });
  }

  const dailyTakings = await reverseDailyTakings(c.get("token"), date);
  return c.json(dailyTakings);
});

sage.get("/post-monthly-takings", async (c) => {
  const date = c.req.query("date");
  if (!date) {
    c.status(400);
    return c.json({ error: "/sage/post-monthly-takings Missing date" });
  }

  const dailyTakings = await postMonthlyTakings(c.get("token"), date);
  return c.json(dailyTakings);
});

sage.get("/reverse-monthly-takings", async (c) => {
  const date = c.req.query("date");
  if (!date) {
    c.status(400);
    return c.json({ error: "/sage/reverse-monthly-takings Missing date" });
  }

  const dailyTakings = await reverseMonthlyTakings(c.get("token"), date);
  return c.json(dailyTakings);
});

sage.get("/purchase-invoices", async (c) => {
  let date = c.req.query("date");
  let duration = c.req.query("duration");
  let from = dayjs(date);

  let to = from.endOf(duration as dayjs.ManipulateType);

  if (!date || !from.isValid() || !duration) {
    c.status(400);
    return c.json({
      error: "/sage/purchase-invoices Missing date or duration",
    });
  }

  type Params = { [key: string]: string };
  let params: Params = {
    from_date: from.format("YYYY-MM-DD"),
    to_date: to.format("YYYY-MM-DD"),
    attributes:
      "contact_name,date,net_amount,vendor_reference,tax_amount,total_amount",
    sort: "date",
  };

  const purchaseInvoices = await getPurchaseInvoices(
    c.get("token"),
    params,
  );
  return c.json(purchaseInvoices);
});

sage.get("/sales-invoices", async (c) => {
  let date = c.req.query("date");
  let duration = c.req.query("duration");
  let from = dayjs(date);

  let to = from.endOf(duration as dayjs.ManipulateType);

  if (!date || !from.isValid() || !duration) {
    c.status(400);
    return c.json({
      error: "/sage/sales-invoices Missing date or duration",
    });
  }

  let params = {
    from_date: from.format("YYYY-MM-DD"),
    to_date: to.format("YYYY-MM-DD"),
    attributes:
      "contact_name,date,net_amount,reference,tax_amount,total_amount,invoice_lines",
    sort: "date",
    items_per_page: "200",
  };

  const salesInvoices = await get("sales_invoices", c.get("token"), params);

  let lines: any[] = [];
  salesInvoices.$items.forEach((si: any) => {
    let {
      id,
      displayed_as,
      contact_name,
      date,
      net_amount,
      tax_amount,
      total_amount,
      invoice_lines,
    } = si;
    let header = {
      id,
      si: displayed_as,
      name: contact_name,
      date,
      description: "total",
      net: net_amount,
      vat: tax_amount,
      total: total_amount,
      ledger: "WWC",
      type: "invoice",
    };

    lines.push(header);
    invoice_lines.forEach((il: any) => {
      let {
        description,
        net_amount,
        tax_amount,
        total_amount,
        ledger_account,
      } = il;
      let line = {
        id,
        si: displayed_as,
        name: contact_name,
        date,
        description,
        net: net_amount,
        vat: tax_amount,
        total: total_amount,
        ledger: ledger_account.displayed_as,
        type: "line",
      };
      lines.push(line);
    });
  });

  Bun.write("sales-invoices.json", JSON.stringify(lines, null, 2));
  Bun.write("sales-invoices.csv", stringify(lines, { header: true }));
  return c.json(salesInvoices);
});

sage.get("/attachments", async (c) => {
  type Params = { [key: string]: string };
  let params: Params = {
    updated_or_created_since: "2024-09-01T00:00",
    attributes: "all",
  };

  const purchaseInvoices = await getAttachments(c.get("token"), params);
  return c.json(purchaseInvoices);
});

sage.get("/purchase-credit-notes", async (c) => {
  let q = c.req.queries();
  type Params = { [key: string]: string };
  let params: Params = {
    updated_or_created_since: "2024-09-01T00:00",
    attributes: "all",
  };

  const purchaseInvoices = await getPurchaseCreditNotes(
    c.get("token"),
    params,
  );
  return c.json({ purchaseInvoices, q });
});

sage.post("/purchase-invoices", async (c) => {
  let invoices = await c.req.parseBody({ all: true });

  if (!invoices) {
    c.status(400);
    return c.json({ error: "/sage/purchase-invoices Missing invoices" });
  }

  let res = [];
  let files = [];
  if (invoices["files"] instanceof File) {
    let { name, type, size } = invoices["files"];
    console.log("single", { name, type, size });
    res.push({ name, type, size });
    files.push(invoices["files"]);
  }

  if (Array.isArray(invoices["files"])) {
    for (const invoice of invoices["files"]) {
      if (typeof invoice === "string") continue;
      let { name, type, size } = invoice;
      console.log("multiple", { name, type, size });
      res.push({ name, type, size });
      files.push(invoice);
    }
  }

  let attachments = await Promise.all(files.map(async (file: any) => {
    let data = await file.arrayBuffer();
    let { name, type, size } = file;
    return { name, type, size, data };
  }));

  let scanned = await scanFromFiles(attachments.map((a) => a.data));

  let results = scanned.map((r, i) => ({ ...res[i], ...r }));

  let checked = await Promise.all(results.map(async (r) => {
    let { date, supplier } = r;
    if (!date || !supplier) return null;
    let current = await getSupplier(c.get("token"), supplier, date, "day");
    return { ...r, current };
  }));

  let purchaseInvoices = checked.filter((r) => r).map((r) => {
    if (!r) return null;
    let { supplier, date, description, vat, net, total } = r;
    let due_date = dayjs(date).add(7, "day").format("YYYY-MM-DD");
    let invoice_lines = [{
      description,
      ledger_account_id: "",
      quantity: 1,
      unit_price: net,
      tax_rate_id: "GB_STANDARD",
      tax_amount: vat,
      total_amount: total,
    }];
    let pi = { contact_id: supplier, date, due_date, invoice_lines };
    return r.current;
  });
  return c.json(checked);
});

sage.get("/supplier", async (c) => {
  let name = c.req.query("name");
  let month = c.req.query("month");
  let d = c.req.query("duration");
  let duration = d ? (d as dayjs.ManipulateType) : "month";

  let from = dayjs(month);
  if (!name || !month || !from.isValid()) {
    c.status(400);
    return c.json({ error: "/sage/supplier Missing name or month" });
  }

  let supplier = await getSupplier(
    c.get("token"),
    name,
    month,
    duration,
  );
  if (!supplier) {
    c.status(400);
    return c.json({ error: "/sage/supplier failed" });
  }

  return c.json(supplier);
});

sage.get("/download", async (c) => {
  let id = c.req.query("id");
  if (!id) {
    c.status(400);
    return c.json({ error: "/sage/download Missing id" });
  }

  let url = `https://api.accounting.sage.com/v3.1/attachments/${id}/file`;
  let file = await download(url, {
    headers: {
      Authorization: `Bearer ${c.get("token")}`,
      Accept: "application/octet-stream",
    },
  });
  Bun.write("download.pdf", file.buffer);
  console.log("downloaded", file.length);
  return c.json({ name: "downloaded.pdf", file: file.length });
});

let foodAndBeverageSuppliers = [
  "Swallow Drinks",
  "Fraziers Wine Merchants Ltd",
  "TJ WIDERANGE SNACKS",
  "Brakes Bros Ltd",
  "First Choice Food Service",
  "Midland Foods",
  "Kingfisher Midlands",
];

let suppliers = [
  ...foodAndBeverageSuppliers,
  "Catherine Aucott",
  "Theaker Ltd",
  "SumUp POS UK",
];

sage.get("/stocktake", async (c) => {
  let month = c.req.query("month");
  if (!month) {
    c.status(400);
    return c.json({ error: "/sage/stocktake Missing month" });
  }

  let token = c.get("token");
  let stocktake = await Promise.all(
    foodAndBeverageSuppliers.map(async (name) => {
      let supplier = await getSupplier(token, name, month);
      return supplier;
    }),
  );

  await writeStocktake(token, month, stocktake);
  await downloadAttachments(token, stocktake);
  return c.json(stocktake);
});

async function checkPurchaseInvoiceExists(token: string, ref: string) {
}

async function getSupplier(
  token: string,
  name: string,
  date: string,
  duration: dayjs.ManipulateType = "month",
) {
  let from = dayjs(date);
  if (!name || !date || !from.isValid()) {
    return null;
  }

  let to = from.endOf(duration);
  let invoices = await get("purchase_invoices", token, {
    from_date: from.format(),
    to_date: to.format(),
    search: name,
    attributes:
      "contact_name,date,net_amount,vendor_reference,tax_amount,total_amount",
    sort: "date",
    items_per_page: "200",
  });

  invoices = invoices.$items.map((i: any) => {
    let { net_amount, tax_amount, total_amount } = i;
    i.net_amount = +net_amount;
    i.tax_amount = +tax_amount;
    i.total_amount = +total_amount;

    return i;
  });

  let creditNotes = await get("purchase_credit_notes", token, {
    from_date: from.format(),
    to_date: to.format(),
    search: name,
    attributes:
      "contact_name,date,net_amount,vendor_reference,tax_amount,total_amount",
    sort: "date",
    items_per_page: "200",
  });

  creditNotes = creditNotes.$items.map((cn: any) => {
    let { net_amount, tax_amount, total_amount } = cn;
    cn.net_amount = +net_amount;
    cn.tax_amount = +tax_amount;
    cn.total_amount = +total_amount;

    return cn;
  });

  for (const i of invoices) {
    const { id } = i;
    let a = await get("attachments", token, {
      attachment_context_id: id,
      attachment_context_type_id: "PURCHASE_INVOICE",
      // updated_or_created_since: from.format(),
      attributes: "mime_type,file_name,file_size,file_extension",
    });
    i.attachments = a.$items;
  }

  for (const cn of creditNotes) {
    const { id } = cn;
    let a = await get("attachments", token, {
      attachment_context_id: id,
      attachment_context_type_id: "PURCHASE_CREDIT_NOTE",
      // updated_or_created_since: from.format(),
      attributes: "mime_type,file_name,file_size,file_extension",
    });
    cn.attachments = a.$items;
  }

  let supplier = { name, date, duration, invoices, creditNotes };
  return supplier;
}

let base = "/var/lib/wwsc/stocktake";
async function writeStocktake(token: string, month: string, stocktake: any) {
  let dir = `${base}/${month}`;
  mkdirSync(dir, { recursive: true });
  let filename = `${dir}/stocktake-${month}.json`;
  attachmentFiles(stocktake, dir);
  let records = await toCSV(month, stocktake, dir);
  await toXLSX(month, records, dir);
  await Bun.write(filename, JSON.stringify(stocktake, null, 2));
}

async function toXLSX(month: string, records: any, dir: string) {
  let filename = `${dir}/stocktake-${month}.xlsx`;
  await xlsx(records, filename);
}

let service = "https://stocktake.wwsc.cloud";
async function toCSV(month: string, stocktake: any, dir: string) {
  let filename = `${dir}/stocktake-${month}.csv`;
  let records = [];
  for (const supplier of stocktake) {
    let { name, invoices, creditNotes } = supplier;
    for (const i of invoices) {
      let {
        date,
        vendor_reference,
        net_amount,
        tax_amount,
        total_amount,
        attachments,
      } = i;
      let file1 = attachments.length ? attachments[0].outfile : "";
      file1 = file1 ? file1.replace(base, service) : "";
      let file2 = attachments.length > 1 ? attachments[1].outfile : "";
      file2 = file2 ? file2.replace(base, service) : "";
      records.push({
        name,
        date,
        ref: vendor_reference,
        net: net_amount,
        vat: tax_amount,
        total: total_amount,
        file1,
        file2,
      });
    }

    for (const cn of creditNotes) {
      let {
        date,
        vendor_reference,
        net_amount,
        tax_amount,
        total_amount,
        attachments,
      } = cn;
      let file1 = attachments.length ? attachments[0].outfile : "";
      file1 = file1 ? file1.replace(base, service) : "";
      let file2 = attachments.length > 1 ? attachments[1].outfile : "";
      file2 = file2 ? file2.replace(base, service) : "";
      records.push({
        name,
        date,
        ref: vendor_reference,
        net: net_amount,
        vat: tax_amount,
        total: total_amount,
        file1,
        file2,
      });
    }
  }

  let csv = stringify(records, { header: true });
  await Bun.write(filename, csv);
  return records;
}

function attachmentFiles(stocktake: any, dir: string) {
  for (const supplier of stocktake) {
    let { name, invoices, creditNotes } = supplier;
    let basename = `${dir}/${kebabCase(name)}`;
    let files = [];
    for (const i of invoices) {
      let { date, vendor_reference } = i;
      let reference = kebabCase(`pi${vendor_reference.replace(/\./g, "")}`);
      for (const a of i.attachments) {
        let { id, file_extension } = a;
        let outfile = `${basename}-${date}-${reference}${file_extension}`;
        files.push({ id, outfile });
      }
      i.attachments = files;
      files = [];
    }

    for (const cn of creditNotes) {
      let { date, vendor_reference } = cn;
      let reference = kebabCase(`pcn${vendor_reference.replace(/\./g, "")}`);

      for (const a of cn.attachments) {
        let { id, file_extension } = a;
        let outfile = `${basename}-${date}-${reference}.${file_extension}`;
        files.push({ id, outfile });
      }
      cn.attachments = files;
      files = [];
    }
  }
}

async function downloadAttachments(token: string, stocktake: any) {
  let attachments = [];
  for (const supplier of stocktake) {
    let { invoices, creditNotes } = supplier;
    for (const i of invoices) {
      attachments.push(...i.attachments);
    }

    for (const cn of creditNotes) {
      attachments.push(...cn.attachments);
    }
  }

  await Promise.all(
    attachments.map(async (a: any) => {
      await downloadInvoice(token, a.id, a.outfile);
    }),
  );
}

async function downloadInvoice(token: string, id: string, outfile: string) {
  let url = `https://api.accounting.sage.com/v3.1/attachments/${id}/file`;
  let file = await download(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/octet-stream",
    },
  });

  await Bun.write(outfile, file.buffer);
}

export default sage;
