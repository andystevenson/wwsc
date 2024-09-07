import { spinner } from '@wwsc/lib-cli'
import { dailySalesItems, type Sale } from '@wwsc/lib-sumup-pos'

import { writeFileSync } from 'node:fs'
import {
  db,
  salesItems,
  insertSalesItem,
  type InsertSalesItem,
} from '@wwsc/lib-db'
import { eq } from 'drizzle-orm'

export const writeDailySalesItems = async (
  sales: Sale[],
  directory: string,
) => {
  const items = await spinner(dailySalesItems(sales), {
    text: 'Generating sales items...',
    successText: 'Sales items generated',
    color: 'green',
  })

  let file = `${directory}/sales-items.json`
  writeFileSync(file, JSON.stringify(items, null, 2))

  type SalesItem = (typeof items)[number]
  let uniqueItems: SalesItem[] = []
  for (const item of items) {
    let exists = await db
      .select()
      .from(salesItems)
      .where(eq(salesItems.id, item.id))
    if (exists.length) {
      continue
    }
    uniqueItems.push(item)
    await insertSalesItem(item)
  }

  // console.log(
  //   `Unique sales items: ${uniqueItems.length} ${items.length} ${sales.length}`,
  // )
  return uniqueItems
}
