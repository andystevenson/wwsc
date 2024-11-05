import { Hono, sessionMiddleware, store, type WithSession } from "./Hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";

import login from "./routes/login";
import logout from "./routes/logout";
import auth from "./routes/auth";

// sage imports
import user from "./routes/user";
import sage from "./routes/sage";

import home from "./pages/home";
import sales from "./pages/sales";

import invoices from "./pages/invoices";

const app = new Hono<WithSession>();

app.use(logger());
app.use(cors());
app.use(trimTrailingSlash());
app.use("/*", serveStatic({ root: "./src/public" }));
app.use(
  "*",
  sessionMiddleware({
    store,
    encryptionKey: Bun.env.SAGE_SESSION_ENCRYPTION_KEY,
    cookieOptions: {
      sameSite: "Lax",
      path: "/",
      httpOnly: true,
    },
  }),
);

app.route("/", home);
app.route("/sales", sales);
app.route("/login", login);
app.route("/logout", logout);
app.route("/auth", auth);
app.route("/user", user);
app.route("/sage", sage);
app.route("/invoices", invoices);

export default app;
