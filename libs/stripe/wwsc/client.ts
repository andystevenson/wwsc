import Stripe from 'stripe'

export function getEnv() {
  type Env = {
    secret: string | undefined
    webhook: string | undefined
  }

  let env: Env
  if (process.env.NODE_ENV === 'production') {
    env = {
      secret: process.env.WWSC_STRIPE_SECRET,
      webhook: process.env.WWSC_STRIPE_WEBHOOK_SECRET
    }
    return env
  }

  env = {
    secret: process.env.WWSC_STRIPE_TEST_SECRET,
    webhook: process.env.WWSC_STRIPE_TEST_WEBHOOK_SECRET
  }

  return env
}

const env = getEnv()
if (!env.secret || !env.webhook) {
  throw new TypeError('WWSC stripe secret or webhook secret missing')
}

const stripe = new Stripe(env.secret)
const webhook = env.webhook
export { stripe, webhook }
