import { getActiveSubscriptions } from '@lib/stripe/wwsc'

console.log('Getting active subscriptions...')
let subscriptions = await getActiveSubscriptions()
console.log('Active subscriptions:', subscriptions.length)
