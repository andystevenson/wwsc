console.log("invoices");
import { readfile, scanner, supplier } from "../src/index";
import { argv } from "node:process";

export async function main() {
  if (argv.length < 3) {
    console.error("Usage: bun scripts/index.js <pdf-file>...");
    process.exit(1);
  }
  let argc = argv.length;

  for (let i = 2; i < argc; i++) {
    console.info(i, argv[i]);
    let filename = argv[i];
    let lines = (await readfile(filename)).filter((line) => line.trim());
    let s = supplier(lines);

    if (!s) {
      const debug = lines.join("\n");
      console.error("supplier not recognised", { filename }, debug);
      continue;
    }

    let document = scanner(s, lines);
    if (!document) {
      const debug = lines.join("\n");
      console.error(
        "document not recognised",
        { supplier: s, filename },
        debug,
      );
      continue;
    }

    console.info({ filename, supplier: s, document });
  }
}

main();
