import { spinner } from '@wwsc/lib-cli'
import { dailySalesItems, type Sale } from '@wwsc/lib-sumup-pos'

import { writeFileSync } from 'node:fs'
import { insertSalesItem } from '@wwsc/lib-db'

export const writeDailySalesItems = async (
  sales: Sale[],
  directory: string,
) => {
  const salesItems = await spinner(dailySalesItems(sales), {
    text: 'Generating sales items...',
    successText: 'Sales items generated',
    color: 'green',
  })

  let file = `${directory}/sales-items.json`
  writeFileSync(file, JSON.stringify(salesItems, null, 2))

  for (const item of salesItems) {
    await insertSalesItem(item)
  }

  return salesItems
}
