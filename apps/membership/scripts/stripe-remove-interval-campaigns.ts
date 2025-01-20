import { stripe } from '@lib/stripe/wwsc'

async function main() {
  let prices = await stripe.prices.list().autoPagingToArray({ limit: 10000 })
  for (let price of prices) {
    let { metadata, id, nickname, lookup_key } = price
    let { campaign } = metadata

    if (!campaign) continue

    let list = campaign.split(',').map((c) => c.trim())
    let campaigns = new Set<string>(list)
    if (campaigns.has('yearly')) campaigns.delete('yearly')
    if (campaigns.has('monthly')) campaigns.delete('monthly')

    if (campaigns.size !== list.length) {
      console.log(
        `updating ${id} ${nickname || ''}/${lookup_key || ''} \n${list.join(',')}=>${Array.from(campaigns).join(',')}`
      )
      await stripe.prices.update(id, {
        metadata: {
          ...metadata,
          campaign: Array.from(campaigns).join(',')
        }
      })
    }
  }
}

await main()
