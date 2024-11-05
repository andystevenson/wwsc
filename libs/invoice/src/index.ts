console.log("invoices");

import * as pdfjs from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { parsePageItems } from "pdf-text-reader";
import { dayjs } from "@wwsc/lib-dates";

export type SourceInvoice = {
  supplier: string;
  description: string;
  credit?: string;
  invoice?: string;
  date: string;
  net: number;
  vat: number;
  total: number;
} | null;

export async function scanFromFiles(
  files: string[] | ArrayBuffer[],
): Promise<SourceInvoice[]> {
  return Promise.all(files.map(async (file) => {
    let lines = await readfile(file);
    let s = supplier(lines);
    if (!s) {
      console.error("supplier not recognised");
      return null;
    }

    let document = scanner(s, lines);
    if (!document) {
      console.error("document not recognised", { supplier: s });
      return null;
    }
    return document;
  }));
}

export async function readfile(
  filename: string | ArrayBuffer,
): Promise<string[]> {
  const doc = typeof filename === "string"
    ? await pdfjs.getDocument({ url: filename, verbosity: 0 }).promise
    : await pdfjs.getDocument({ data: filename, verbosity: 0 }).promise;
  let lines = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i); // 1-indexed
    const content = await page.getTextContent();
    const items: TextItem[] = content.items.filter(
      (item): item is TextItem => "str" in item,
    );
    const parsedPage = parsePageItems(items);
    lines.push(...parsedPage.lines);
  }

  return lines.filter((line) => line.trim());
}

export function supplier(pdflines: string[]) {
  if (isSwallowDrinks(pdflines)) return "Swallow Drinks";
  if (isFirstChoiceFoodService(pdflines)) return "First Choice Food Service";
  if (isCatherineAucottConsultancy(pdflines)) {
    return "Catherine Aucott";
  }
  if (isMidlandFoods(pdflines)) return "Midland Foods";
  if (isGaryElwellStockAudit(pdflines)) return "Theaker Ltd";
  if (isStephensons(pdflines)) return "Stephensons";
  if (isSumupPOS(pdflines)) return "SumUp POS UK";
  if (isFraziers(pdflines)) return "Fraziers Wine Merchants Ltd";
  if (isTJSnacks(pdflines)) return "T.J WIDERANGE SNACKS";
  return "";
}

export function scanner(supplier: string, pdflines: string[]) {
  switch (supplier) {
    case "Swallow Drinks":
      return parseSwallowDrinks(pdflines);
    case "First Choice Food Service":
      return parseFirstChoiceFoodService(pdflines);
    case "Catherine Aucott":
      return parseCatherineAucottConsultancy(pdflines);
    case "Midland Foods":
      return parseMidlandFoods(pdflines);
    case "Theaker Ltd":
      return parseGaryElwellStockAudit(pdflines);
    case "Stephensons":
      return parseStephensons(pdflines);
    case "SumUp POS UK":
      return parseSumupPOS(pdflines);
    case "Fraziers Wine Merchants Ltd":
      return parseFraziers(pdflines);
    case "T.J WIDERANGE SNACKS":
      return parseTJSnacks(pdflines);
  }
  return null;
}

export function isGaryElwellStockAudit(pdflines: string[]) {
  let gary = pdflines.some((line) =>
    /Professional Stock Auditors\s+GARY ELWELL/.test(line)
  );
  let wwc = pdflines.some((line) =>
    /^WEST WARWICKSHIRE SPORTS$/.test(line.trim())
  );
  let invoice = pdflines.some((line) =>
    /B91\s+.DA\s+INVOICE No\.\s+[0-9]+/.test(line)
  );

  return gary && wwc && invoice;
}

export function isMidlandFoods(pdflines: string[]) {
  let email = pdflines.some((line) =>
    /Email: Sales@MidlandFoods.co.uk/.test(line)
  );
  if (!email) return false;

  let wwsc = pdflines.some((line) =>
    /WEST WARWICKSHIRE SPORTS CLUB LTD/.test(line)
  );
  if (!wwsc) return false;

  let invoice = pdflines.some((line) => /^Invoice$/.test(line.trim()));
  if (!invoice) return false;

  return email && wwsc && invoice;
}

export function isSwallowDrinks(pdflines: string[]) {
  let email = pdflines.some((line) => /e: sales@swallow.uk.com/.test(line));
  if (!email) return false;

  let www = pdflines.some((line) => /www.swallow.uk.com/.test(line));
  if (!www) return false;

  let account = pdflines.some(
    (line, index) => /Account No:/.test(line) && pdflines[index + 1] === "W167",
  );
  if (!account) return false;
  let invoice = pdflines.find((line) => /Invoice No: SINV[0-9]+/.test(line));
  let credit = pdflines.find((line) => /Credit No: SCRD[0-9]+/.test(line));
  if (email && www && account && (invoice || credit)) return true;
}

export function isCatherineAucottConsultancy(pdflines: string[]) {
  let cath = pdflines.some((line) => /Catherine Aucott/.test(line));
  let wwc = pdflines.some((line) => /WEST WARWICKS CLUB LTD/.test(line));
  let invoice = pdflines.some((line) => /INVOICE NO\. [0-9]+/.test(line));

  return cath && wwc && invoice;
}

export function isFirstChoiceFoodService(pdflines: string[]) {
  let name = pdflines.some((line) => /First Choice Food Service/.test(line));
  let invoice = pdflines.some((line) => /^Invoice$/.test(line.trim()));
  let credit = pdflines.some((line) => /^Credit Note$/.test(line.trim()));
  if (!name) return false;
  if (!invoice && !credit) return false;

  let account = invoice
    ? pdflines.some(
      (line, index) =>
        /Customer Account:/.test(line) && pdflines[index + 1] === "13626",
    )
    : pdflines.some(
      (line, index) =>
        /Customer Account:/.test(line) && pdflines[index - 1] === "13626",
    );

  let postcode = pdflines.some((line) => /B91 1DA/.test(line));

  return name && account && postcode;
}

export function isStephensons(pdflines: string[]) {
  let stephensons = pdflines.some((line) => /sales@stephensons.com/.test(line));
  if (!stephensons) return false;
  let www = pdflines.some((line) => /www.stephensons.com/.test(line));
  if (!www) return false;
  let invoice = pdflines.some((line) => /Inv\s+No\s+INV[0-9]+/.test(line));
  if (!invoice) return false;
  let sinvoice = pdflines.some((line) => /SALES INVOICE/.test(line));
  if (!sinvoice) return false;
  let wwsc = pdflines.some((line) => /West Warwickshire Club Ltd/.test(line));
  if (!wwsc) return false;
  return stephensons && www && invoice && sinvoice && wwsc;
}

export function isSumupPOS(pdflines: string[]) {
  let goodtill = pdflines.some((line) => /The Good Till Co Ltd/.test(line));
  if (!goodtill) return false;
  let pos = pdflines.some((line) => /Core POS Module/.test(line));
  if (!pos) return false;
  let invoice = pdflines.some((line) => /TAX INVOICE/.test(line));
  if (!invoice) return false;
  let wwsc = pdflines.some((line) =>
    /West Warwicks Sports Club - Main/.test(line)
  );
  if (!wwsc) return false;
  return goodtill && pos && wwsc;
}

export function isFraziers(pdflines: string[]) {
  let fraziers = pdflines.some((line) =>
    /Fraziers Wine Merchants Ltd/.test(line)
  );
  if (!fraziers) return false;

  let invoice = pdflines.some((line) => /^INVOICE$/.test(line));
  if (!invoice) return false;

  let email = pdflines.some((line) => /orders@fraziers.co.uk/.test(line));
  if (!email) return false;

  let wwsc = pdflines.some((line) => /West Warwickshire Club Ltd/.test(line));
  if (!wwsc) return false;

  return fraziers && invoice && email && wwsc;
}

export function isTJSnacks(pdflines: string[]) {
  let snacks = pdflines.some((line) => /T & J WIDERANGE SNACKS/.test(line));
  if (!snacks) return false;

  let email = pdflines.some((line) =>
    /Email : tjsnacks@hotmail.co.uk/.test(line)
  );
  if (!email) return false;

  let wws = pdflines.some((line) => /West Warwickshire Squash/.test(line));
  if (!wws) return false;

  return snacks && email && wws;
}

export function parseSwallowDrinks(pdflines: string[]) {
  let invoice = pdflines.find((line) => /Invoice No: SINV[0-9]+/.test(line));
  invoice = invoice?.match(/SINV[0-9]+/)?.[0];
  let credit = pdflines.find((line) => /Credit No: SCRD[0-9]+/.test(line));
  credit = credit?.match(/SCRD[0-9]+/)?.[0];

  let date = pdflines
    .at(pdflines.findIndex((line) => /Date:/.test(line)) + 1)
    ?.trim();
  if (!date) return;
  let [day, month, year] = date.split("/");
  date = dayjs(
    `${year.padStart(4, "20")}-${month.padStart(2, "0")}-${
      day.padStart(
        2,
        "0",
      )
    }`,
  ).format("YYYY-MM-DD");
  let account = pdflines.at(
    pdflines.findIndex((line) => /Account No:/.test(line)) + 1,
  );

  let netIndex = pdflines.findIndex((line) => /NET:/.test(line));
  let netString = pdflines.at(netIndex - 1)?.trim();
  if (!netString) return;
  let net = +netString.replaceAll(",", "");

  let vatIndex = pdflines.findIndex((line) => /VAT:/.test(line));
  let vatString = pdflines.at(vatIndex - 1)?.trim();
  if (!vatString) return;
  let vat = +vatString.replaceAll(",", "");

  let totalString = pdflines.find((line) => /TOTAL:/.test(line));
  if (!totalString) return;

  let total = +totalString.split(" ")[1].replaceAll(",", "");

  let supplier = "Swallow Drinks";
  let description = "drinks supplies";
  if (invoice) {
    return { supplier, description, invoice, date, net, vat, total };
  }
  return { supplier, description, credit, date, net, vat, total };
}

export function parseFirstChoiceFoodService(pdflines: string[]) {
  let name = pdflines.some((line) => /First Choice Food Service/.test(line));
  let credit = pdflines.some((line) => /^Credit Note$/.test(line.trim()));
  if (!name) return null;

  let date = credit
    ? pdflines
      .at(pdflines.findIndex((line) => /Date of Order:/.test(line)) + 1)
      ?.trim()
      .split(" ")[0]
    : pdflines
      .at(pdflines.findIndex((line) => /Date of Invoice:/.test(line)) + 1)
      ?.trim()
      .split(" ")[0];
  if (!date) return null;
  let [day, month, year] = date.split("/");
  let parsedDate = dayjs(
    `${year.padStart(4, "20")}-${month.padStart(2, "0")}-${
      day.padStart(
        2,
        "0",
      )
    }`,
  );
  if (!parsedDate.isValid()) return null;
  date = parsedDate.format("YYYY-MM-DD");

  let offset = credit ? 2 : 1;
  let invoice = pdflines
    .at(pdflines.findIndex((line) => /Invoice No:/.test(line)) - offset)
    ?.split(" ")[0];
  if (!invoice || !/[0-9]+/.test(invoice)) return null;

  let net = 0;
  let netString = pdflines
    .at(pdflines.findIndex((line) => /Total Goods/.test(line.trim())) + 1)
    ?.trim()
    .replaceAll(",", "") || "";
  net = +netString;

  let vat = 0;
  let vatString = pdflines
    .at(pdflines.findIndex((line) => /Total VAT/.test(line.trim())) + 1)
    ?.trim()
    .replaceAll(",", "") || "";
  vat = +vatString;

  let total = 0;
  let totalString = credit
    ? pdflines
      .find((line) => /Total Due\s+[0-9.,]+/.test(line.trim()))
      ?.split(/\s+/)[2]
      .replaceAll(",", "") || ""
    : pdflines
      .find((line) => /Total Invoice\s+[0-9.,]+/.test(line.trim()))
      ?.split(/\s+/)[2]
      .replaceAll(",", "") || "";
  total = +totalString;

  let supplier = "First Choice Food Service";
  let description = "food supplies";
  if (credit) {
    return { supplier, description, credit: invoice, date, net, vat, total };
  }
  return { supplier, description, invoice, date, net, vat, total };
}

export function parseCatherineAucottConsultancy(pdflines: string[]) {
  let cath = pdflines.some((line) => /Catherine Aucott/.test(line));
  let wwc = pdflines.some((line) => /WEST WARWICKS CLUB LTD/.test(line));
  let invoiceString = pdflines.find((line) =>
    /INVOICE NO\.\s+([0-9]+)\s+DATE\s+(.*)/.test(line)
  );
  let invoice = invoiceString?.match(/INVOICE NO\.\s+([0-9]+)/)?.[1];
  let dateString = invoiceString?.match(/DATE\s+(.*)/)?.[1];
  if (!cath || !wwc || !invoiceString || !dateString) return null;

  let [day, month, year] = dateString.split("/");
  let dateObject = dayjs(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
  );
  if (!dateObject.isValid()) return null;
  let date = dateObject.format("YYYY-MM-DD");

  let netIndex = pdflines.findIndex((line) => /SUBTOTAL/.test(line));
  let netString = pdflines.at(netIndex - 1)?.trim();
  if (!netString) return null;
  let net = +netString.replaceAll(",", "");

  let vatIndex = pdflines.findIndex((line) => /VAT/.test(line));
  let vatString = pdflines.at(vatIndex - 1)?.trim();
  if (!vatString) return null;
  let vat = +vatString.replaceAll(",", "");

  let totalIndex = pdflines.findIndex((line) => /^TOTAL$/.test(line.trim()));
  let totalString = pdflines.at(totalIndex - 1)?.trim();
  if (!totalString) return null;
  let total = +totalString.replaceAll(",", "");
  return {
    supplier: "Catherine Aucott",
    description: "consultancy",
    invoice,
    date,
    net,
    vat,
    total,
  };
}

export function parseMidlandFoods(pdflines: string[]) {
  if (!isMidlandFoods(pdflines)) return null;

  let invoiceString = pdflines.find((line) =>
    /WEST WARWICKSHIRE SPORTS CLUB LTD\s+([0-9]+)/.test(line.trim())
  );
  let invoice = invoiceString?.match(/([0-9]+)/)?.[1];
  if (!invoice) return null;

  let grangeIndex = pdflines.findIndex((line) => /Grange Road/.test(line));
  let dateString = pdflines.at(grangeIndex - 1)?.trim();
  if (!dateString) return null;

  let [day, month, year] = dateString.split("/");
  let dateObject = dayjs()
    .year(+year)
    .month(+month - 1)
    .date(+day);
  if (!dateObject.isValid()) return null;
  let date = dateObject.format("YYYY-MM-DD");

  let net = 0;
  let netIndex = pdflines.findIndex((line) =>
    /^Send invoices to acc's email$/.test(line.trim())
  );
  let netString = pdflines.at(netIndex - 8)?.trim();
  if (!netString) return null;
  net = +netString.replaceAll(",", "");

  let vat = 0;
  let vatString = pdflines.at(netIndex - 5)?.trim();
  if (!vatString) return null;
  vat = +vatString.replaceAll(",", "");

  let total = 0;
  let totalString = pdflines.at(netIndex - 2)?.trim();
  if (!totalString) return null;
  total = +totalString.replaceAll(",", "");

  let supplier = "Midland Foods";
  let description = "food supplies";

  return { supplier, description, invoice, date, net, vat, total };
}

export function parseGaryElwellStockAudit(pdflines: string[]) {
  if (!isGaryElwellStockAudit(pdflines)) return null;

  let invoiceString = pdflines.find((line) =>
    /INVOICE No\.\s+[0-9]+/.test(line)
  );
  let invoice = invoiceString?.match(/INVOICE No\.\s+([0-9]+)/)?.[1];
  if (!invoice) return null;

  let dateLine = pdflines.find((line) => /Stock Audit\s+([0-9/]+)/.test(line));
  if (!dateLine) return null;
  let dateString = dateLine.match(/Stock Audit\s+([0-9/]+)/)?.[1];
  if (!dateString) return null;

  let [day, month, year] = dateString.split("/");
  let dateObject = dayjs()
    .year(+("20" + year))
    .month(+month - 1)
    .date(+day);
  if (!dateObject.isValid()) return null;
  let date = dateObject.format("YYYY-MM-DD");

  let amountDue = pdflines.find((line) => /Amount Due\s+([0-9.]+)/.test(line));
  if (!amountDue) return null;
  let dueString = amountDue.match(/([0-9.]+)/)?.[1];
  if (!dueString) return null;
  let total = +dueString.replaceAll(",", "");
  let net = total;
  let vat = 0;
  let supplier = "gary-elwell-stock-audit";
  let description = "stock audit";

  return { supplier, description, invoice, date, net, vat, total };
}

export function parseStephensons(pdflines: string[]) {
  if (!isStephensons(pdflines)) return null;

  let invoiceString = pdflines.find((line) =>
    /Inv\s+No\s+INV[0-9]+/.test(line)
  );
  let invoice = invoiceString?.match(/INV[0-9]+/)?.[0];
  if (!invoice) return null;

  let dateLine = pdflines.find((line) =>
    /sales@stephensons.com\s+Date\s+[0-9/]+/.test(line)
  );
  if (!dateLine) return null;
  let dateString = dateLine.match(/sales@stephensons.com\s+Date\s+([0-9/]+)/)
    ?.[1];
  if (!dateString) return null;

  let [day, month, year] = dateString.split("/");
  let dateObject = dayjs()
    .year(+year)
    .month(+month - 1)
    .date(+day);
  if (!dateObject.isValid()) return null;
  let date = dateObject.format("YYYY-MM-DD");

  let net = 0;
  let netString = pdflines.find((line) =>
    /Our Bank Details:\s+Subtotal\s+£([0-9.,]+)/.test(line)
  );
  if (!netString) return null;
  netString = netString.match(/£([0-9.,]+)/)?.[1];
  if (!netString) return null;
  net = +netString.replaceAll(",", "");

  let vat = 0;
  let vatString = pdflines.find((line) => /Total VAT\s+£([0-9.,]+)/.test(line));
  if (!vatString) return null;
  vatString = vatString.match(/£([0-9.,]+)/)?.[1];
  if (!vatString) return null;
  vat = +vatString.replaceAll(",", "");

  let total = 0;
  let totalString = pdflines.find((line) =>
    /Total Incl VAT\s+£([0-9.,]+)/.test(line)
  );
  if (!totalString) return null;
  totalString = totalString.match(/£([0-9.,]+)/)?.[1];
  if (!totalString) return null;
  total = +totalString.replaceAll(",", "");

  let supplier = "stephensons";
  let description = "catering supplies";

  return { supplier, description, invoice, date, net, vat, total };
}

export function parseSumupPOS(pdflines: string[]) {
  if (!isSumupPOS(pdflines)) return null;

  let invoiceIndex = pdflines.findIndex((line) => /Invoice Number/.test(line));
  let invoiceString = pdflines.at(invoiceIndex + 2);
  let invoice = invoiceString?.match(/INV-[0-9]+/)?.[0];
  console.log({ invoiceString, invoice });
  if (!invoice) return null;

  let dateIndex = pdflines.findIndex((line) => /Invoice Date/.test(line));
  let dateString = pdflines.at(dateIndex + 2);
  if (!dateString) return null;

  let [day, mon, year] = dateString.split(" ");
  let month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(mon) + 1;
  let dateObject = dayjs()
    .year(+year)
    .month(+month)
    .date(+day);
  if (!dateObject.isValid()) return null;
  let date = dateObject.format("YYYY-MM-DD");

  let net = 0;
  let netString = pdflines.find((line) => /Subtotal\s+([0-9.,]+)/.test(line));
  if (!netString) return null;
  netString = netString.match(/([0-9.,]+)/)?.[1];
  if (!netString) return null;
  net = +netString.replaceAll(",", "");

  let vat = 0;
  let vatString = pdflines.find((line) =>
    /TOTAL VAT 20%\s+([0-9.,]+)/.test(line)
  );
  if (!vatString) return null;
  vatString = vatString.match(/TOTAL VAT 20%\s+([0-9.,]+)/)?.[1];
  if (!vatString) return null;
  vat = +vatString.replaceAll(",", "");

  let total = 0;
  let totalString = pdflines.find((line) =>
    /TOTAL GBP\s+([0-9,.]+)/.test(line)
  );
  if (!totalString) return null;
  totalString = totalString.match(/TOTAL GBP\s+([0-9.,]+)/)?.[1];
  if (!totalString) return null;
  total = +totalString.replaceAll(",", "");

  let supplier = "SumUp POS UK";
  let description = "till system software";

  return { supplier, description, invoice, date, net, vat, total };
}

export function parseFraziers(pdflines: string[]) {
  if (!isFraziers(pdflines)) return null;

  let detailsString = pdflines.find((line) =>
    /([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2})\s+WWC001\s+(FWEL[0-9]+)\s+Duty Paid\s?1 of 1\s+(FWIQ[0-9]+)/
      .test(line)
  );
  console.log({ detailsString });
  if (!detailsString) return null;

  let match = detailsString
    ?.match(
      /([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2})\s+WWC001\s+(FWEL[0-9]+)\s+Duty Paid\s?1 of 1\s+(FWIQ[0-9]+)/,
    )
    ?.slice(1);
  console.log({ match });
  if (!match) return null;

  let [dateString, order, invoice] = match;
  console.log({ dateString, order, invoice });

  let [day, month, year] = dateString.split("/");
  let dateObject = dayjs().year(+("20" + year)).month(+month - 1).date(+day);
  let date = dateObject.format("YYYY-MM-DD");

  let netIndex = pdflines.findIndex((line) => /Total Nett/.test(line));
  let netString = pdflines.at(netIndex - 1)?.trim();
  if (!netString) return null;
  let net = +netString.replaceAll(",", "");

  let vatIndex = pdflines.findIndex((line) => /^Total VAT$/.test(line));
  let vatString = pdflines.at(vatIndex - 1)?.trim();
  if (!vatString) return null;
  let vat = +vatString.replaceAll(",", "");

  let totalIndex = pdflines.findIndex((line) => /Invoice Total/.test(line));
  let totalString = pdflines.at(totalIndex - 1)?.trim();
  if (!totalString) return null;
  let total = +totalString.replaceAll(",", "");

  let supplier = "Fraziers Wine Merchants Ltd";
  let description = "wine supplies";
  return { supplier, description, invoice, date, net, vat, total };
}

export function parseTJSnacks(pdflines: string[]) {
  if (!isTJSnacks(pdflines)) return null;

  let dateString = pdflines.find((line) => /Date\s+:\s+([0-9/]+)/.test(line));
  if (!dateString) return null;

  let match = dateString.match(/Date\s+:\s+([0-9/]+)/);
  if (!match) return null;

  let [day, month, year] = match[1].split("/");
  let dateObject = dayjs().year(+year).month(+month - 1).date(+day);
  let date = dateObject.format("YYYY-MM-DD");

  let subtotal2 = pdflines.find((line) =>
    /Sub Total\s+2\s+([0-9]+\s+[0-9]+)/.test(line)
  );
  if (!subtotal2) return null;
  let match2 = subtotal2.match(/Sub Total\s+2\s+([0-9]+\s+[0-9]+)/);
  if (!match2) return null;
  let [pounds, pence] = match2[1].split(" ");
  if (!pounds || !pence) return null;
  let subtotal = +`${pounds}.${pence}`;

  let subtotal1 = pdflines.find((line) =>
    /Sub Total\s+1\s+([0-9]+\s+[0-9]+)/.test(line)
  );
  if (!subtotal1) return null;
  let match1 = subtotal1.match(/Sub Total\s+1\s+([0-9]+\s+[0-9]+)/);
  if (!match1) return null;
  let [pounds1, pence1] = match1[1].split(" ");
  if (!pounds1 || !pence1) return null;
  let net = +(subtotal + +`${pounds1}.${pence1}`).toFixed(2);

  let vatString = pdflines.find((line) =>
    /^VAT\s+([0-9]+\s+[0-9]+)/.test(line)
  );
  if (!vatString) return null;
  let match3 = vatString.match(/^VAT\s+([0-9]+\s+[0-9]+)/);
  if (!match3) return null;
  let [pounds2, pence2] = match3[1].split(" ");
  if (!pounds2 || !pence2) return null;
  let vat = +`${pounds2}.${pence2}`;

  let totalIndex = pdflines.findIndex((line) => /^Sort Code/.test(line));
  if (totalIndex < 0) return null;
  let totalString = pdflines.at(totalIndex + 1)?.trim();
  if (!totalString) return null;
  let match4 = totalString.match(/Total\s+([0-9]+\s+[0-9]+)/);
  if (!match4) return null;
  let [pounds3, pence3] = match4[1].split(" ");
  if (!pounds3 || !pence3) return null;
  let total = +`${pounds3}.${pence3}`;

  let supplier = "T.J WIDERANGE SNACKS";
  let description = "snack supplies";
  return { supplier, description, date, invoice: date, net, vat, total };
}
