import { Stripe } from 'stripe'

export type WebhookEvent = { type: Stripe.Event.Type; object: any }
export type WebhookQueue = WebhookEvent[]
export type Webhook = (event: WebhookEvent) => Promise<void>
export type WebhookHandlers = Map<Stripe.Event.Type, Webhook>

export type ResyncRequest = { action: string; type?: string; id?: string }
export type ResyncResponse = { action: string; result: any }
