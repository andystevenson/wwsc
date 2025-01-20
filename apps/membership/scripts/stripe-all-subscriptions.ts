import { getAllSubscriptions } from '@lib/stripe/wwsc'

console.log('Getting all subscriptions...')
let subscriptions = await getAllSubscriptions()
console.log('all subscriptions:', subscriptions.length)
