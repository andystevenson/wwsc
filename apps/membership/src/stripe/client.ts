import Stripe from "stripe";
import { writeFileSync } from "node:fs";
import env from "../utilities/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export { env, Stripe, stripe, writeFileSync };
export default stripe;
