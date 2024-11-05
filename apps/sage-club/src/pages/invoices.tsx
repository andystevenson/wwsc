import { Page } from "@wwsc/lib-hono";
import { factory, refresh } from "../Hono";
import tags from "./pageTags";

let invoiceTags = structuredClone(tags);

invoiceTags.scripts = [
  "https://unpkg.com/htmx.org@2.0.1",
  "https://unpkg.com/htmx-ext-json-enc@2.0.0/json-enc.js",
  "https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js",
  "https://cdn.jsdelivr.net/npm/dayjs@1/plugin/advancedFormat.js",
  "https://cdn.jsdelivr.net/npm/dayjs@1/plugin/duration.js",
  "https://cdn.jsdelivr.net/npm/dayjs@1/plugin/relativeTime.js",
  "https://unpkg.com/gridjs/dist/gridjs.umd.js",
  "/js/invoices.js",
];

const invoices = factory.createApp();
invoices.use(refresh);

invoices.get("/", (c) => {
  return c.html(
    <Page tags={invoiceTags} bodyClass="page">
      <header>
        <img src="favicon.svg" alt="West Warwickshire Sports Club icon" />
        <button class="logout">
          <span>logout</span>
        </button>
      </header>
      <main>
        <h1 class="invoices">Invoices</h1>
        <section class="upload">
          <button>
            <span>upload</span>
          </button>
          <input type="file" name="file" accept=".pdf" multiple />
          <input type="hidden" name="payload" />
          <pre>
            <code class="contents"></code>
          </pre>
        </section>
      </main>
      <footer>
        <p>Copyright © 2024 - West Warwickshire Sports Complex</p>
        <small>(Company registered in England: 05618704)</small>
      </footer>
      <dialog class="errors">
        <p class="message"></p>
        <button class="cancel" autofocus>
          <span>esc</span>
        </button>
      </dialog>
    </Page>,
  );
});

export default invoices;
