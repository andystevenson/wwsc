import { Hono, type WithSession } from "../Hono";
import { revokeToken, type Token } from "@wwsc/lib-sage";

const logout = new Hono<WithSession>();

logout.get("/", (c) => {
  const session = c.get("session");

  const token = session.get("token") as Token;
  if (token) {
    revokeToken(token);
  }

  session.deleteSession();
  return c.redirect("/");
});

export default logout;
