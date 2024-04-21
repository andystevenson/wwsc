import { readFileSync } from 'fs'
const dashboardPayouts = JSON.parse(
  readFileSync('./json/payouts-2024-03-01.json', 'utf-8'),
)
const posPayouts = JSON.parse(
  readFileSync('./json/payouts-2024-03.json', 'utf-8'),
)

dashboardPayouts.forEach((dashboardPayout, index) => {
  const posPayout = posPayouts[index]
  const { date, count, total, fees, refunds } = dashboardPayout

  const sumup = posPayout['SUMUP']
  const { count: pcount, total: ptotal, fees: pfees, refunds: prefunds } = sumup

  console.log(
    { date },
    { count, pcount, diff: +(count - pcount).toFixed(2) },
    { total, ptotal, diff: +(total - ptotal).toFixed(2) },
    { fees, pfees, diff: +(fees - pfees).toFixed(2) },
    { refunds, prefunds, diff: +(refunds - prefunds).toFixed(2) },
  )
})
