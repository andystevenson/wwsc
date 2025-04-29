import Stripe from 'stripe'
import env from './env'

export function getSecrets() {
  type Secrets = {
    secret: string
    webhook: string
  }

  let config: Secrets
  if (env.NODE_ENV === 'production') {
    config = {
      secret: env.WWSC_STRIPE_SECRET,
      webhook: env.WWSC_STRIPE_WEBHOOK_SECRET
    }
    return config
  }

  config = {
    secret: env.WWSC_STRIPE_TEST_SECRET,
    webhook: env.WWSC_STRIPE_TEST_WEBHOOK_SECRET
  }

  return config
}

const config = getSecrets()
const stripe = new Stripe(config.secret)
const webhook = config.webhook
export { stripe, webhook }
