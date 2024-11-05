import env from "./utilities/env";
import app from "./app";

const port = env.MEMBERSHIP_PORT;
console.log("Starting Membership Server...", port);
const server = Bun.serve({ port, fetch: app.fetch });
