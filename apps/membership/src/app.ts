import { factory, z, zValidator } from "./hono-factory";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";

// routes
import ashbourne from "./routes/ashbourne";

const app = factory.createApp();

app.use(logger());
app.use(cors());
app.use(trimTrailingSlash());

let routes = app.route("/ashbourne", ashbourne);
export type AppType = typeof routes;
export default app;
