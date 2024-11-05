import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { encodeBase64 } from "hono/utils/encode";
import { Session, sessionMiddleware } from "hono-sessions";
import { BunSqliteStore } from "hono-sessions/bun-sqlite-store";
import { Database } from "bun:sqlite";
import { refreshToken, type Token } from "@wwsc/lib-sage";

const db = new Database(":memory:");
const store = new BunSqliteStore(db);

export type WithSession = {
  Variables: {
    session: Session;
    session_key_rotation: boolean;
    token: string;
  };
};

const factory = createFactory<WithSession>();

const refresh = factory.createMiddleware(async (c, next) => {
  const session = c.get("session");
  let token = session.get("token") as Token;
  if (!token) return c.redirect("/");

  token = await refreshToken(token) as Token;
  session.set("token", token);
  c.set("token", token.access_token);
  await next();
});

export {
  encodeBase64,
  factory,
  Hono,
  refresh,
  Session,
  sessionMiddleware,
  store,
};
