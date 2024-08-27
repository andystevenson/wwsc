import { dayjs } from '@wwsc/lib-dates'
import { InsertHoliday } from '../db/db'
import { Big } from 'big.js'

function permanentHolidaysHTML(holidays: InsertHoliday[]) {
  let { who, start, contract, bfwd, accrued, taken, remaining } =
    permanent(holidays)
  let startDate = dayjs(start).format('MMM Do')
  let contractDays = contract === 1 ? `${contract} day` : `${contract} days`
  let bfwdDays = bfwd === 1 ? `${bfwd} day` : `${bfwd} days`
  let accruedDays = accrued === 1 ? `${accrued} day` : `${accrued} days`
  let takenDays = taken === 1 ? `${taken} day` : `${taken} days`
  let remainingDays = remaining === 1 ? `${remaining} day` : `${remaining} days`

  return `
    <section class="permanent summary">
      <div class="start"><span>start</span><span>${startDate}</span></div>
      <div class="contract"><span>contract</span><span>${contractDays}</span></div>
      <div class="broughtforward"><span>brought forward</span><span>${bfwdDays}</span></div>
      <div class="accrued"><span>accrued</span><span>${accruedDays}</span></div>
      <div class="taken"><span>taken</span><span>${takenDays}</span></div>
      <div class="taken"><span>remaining</span><span>${remainingDays}</span></div>
    </section>
    <section class="permanent taken">
        ${holidays
          .map((holiday) => {
            let date = dayjs(holiday.date).format('MMM Do')
            switch (holiday.type) {
              case 'taken':
                let className = holiday.hours < 8 ? 'class=partial' : ''
                return `<span ${className}>${date}</span>`
              case 'acc':
                return `<span class="accrued">${date}</span>`

              default:
                return ''
            }
          })
          .join('')}
    </section>`
}

function zerohoursHolidaysHTML(holidays: InsertHoliday[]) {
  let { who, start, bfwd, accrued, paid, total, taken, days } =
    zerohours(holidays)
  let startDate = dayjs(start).format('MMM Do')

  return `
    <section class="zerohours summary">
      <div class="start"><span>start</span><span>${startDate}</span></div>
      <div class="broughtforward"><span>brought forward</span><span>${bfwd} hrs</span></div>
      <div class="accrued"><span>accrued</span><span>${accrued} hrs</span></div>
      <div class="paid"><span>paid</span><span>${paid} hrs</span></div>
      <div class="total"><span>total</span><span>${total} hrs</span></div>
      <div class="taken"><span>taken</span><span>${taken} hrs</span></div>
      <div class="days"><span>days</span><span>${days}</span></div>
    </section>
    <section class="zerohours taken">
        ${holidays
          .map((holiday) => {
            let date = dayjs(holiday.date).format('MMM Do')
            let { type, hours } = holiday
            switch (type) {
              case 'taken':
                let className = holiday.hours < 8 ? 'class=partial' : ''
                return `<span ${className}>${date}</span>`
              case 'paid':
                return `<div><span class="paid">${date}</span><span class="hours">${hours}</span></div>`

              default:
                return ''
            }
          })
          .join('')}
    </section>`
}

function permanent(holidays: InsertHoliday[]) {
  let accrued = Big(0)
  let taken = Big(0)
  let contract = Big(20)
  let allowed = Big(0)
  let bfwd = Big(0)
  let start = ''
  let who = ''
  for (let holiday of holidays) {
    if (holiday.type === 'bfwd') {
      who = holiday.name
      start = holiday.date
      let startDate = dayjs(start)
      let jan1 = startDate.startOf('year')
      let endOfYear = startDate.endOf('year').add(1, 'day')
      let days = endOfYear.diff(startDate, 'days')
      let fullYear = endOfYear.diff(jan1, 'days')
      allowed = Big(days)
        .div(fullYear)
        .times(contract)
        .round(0, Big.roundUp)
        .times(8)
      console.log('after', { allowed })
      accrued = Big(0)
      bfwd = Big(holiday.hours)
    }

    if (holiday.type === 'acc') {
      accrued = accrued.add(holiday.hours)
    }

    if (holiday.type === 'taken') {
      taken = taken.add(holiday.hours)
    }
  }
  let remaining = bfwd.add(allowed).add(accrued).minus(taken)

  return {
    who,
    start,
    contract: allowed.div(8).toNumber(),
    bfwd: bfwd.div(8).toNumber(),
    accrued: accrued.div(8).toNumber(),
    taken: taken.div(8).toNumber(),
    remaining: remaining.div(8).toNumber(),
  }
}

function zerohours(holidays: InsertHoliday[]) {
  let accrued = Big(0)
  let taken = Big(0)
  let paid = Big(0)
  let bfwd = Big(0)
  let start = ''
  let who = ''
  for (let holiday of holidays) {
    let { type, hours } = holiday
    switch (type) {
      case 'bfwd':
        who = holiday.name
        start = holiday.date
        bfwd = bfwd.add(hours)
        accrued = accrued.add(bfwd)
        break
      case 'acc':
        accrued = accrued.add(hours)
        break
      case 'taken':
        taken = taken.add(hours)
        break
      case 'paid':
        paid = paid.add(hours)
        accrued = accrued.minus(hours)
        break
    }
  }

  return {
    who,
    start,
    bfwd: bfwd.toNumber(),
    accrued: accrued.toNumber(),
    paid: paid.toNumber(),
    total: accrued.add(paid).toNumber(),
    taken: taken.toNumber(),
    days: taken.div(8).toNumber(),
  }
}

export { permanentHolidaysHTML, zerohoursHolidaysHTML, permanent, zerohours }
