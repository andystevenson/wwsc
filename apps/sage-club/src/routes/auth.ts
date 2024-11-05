import { factory } from "../Hono";
import { getToken, type Token } from "@wwsc/lib-sage";

const auth = factory.createApp();

auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.redirect("/");

  const session = c.get("session");
  session.set("callback", c.req.queries());

  let token = await getToken(code) as Token;
  if (!token) return c.redirect("/");

  session.set("token", token);

  return c.redirect("/");
});

export default auth;
