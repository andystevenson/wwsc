import { type RegisterClosure } from '@wwsc/lib-sumup-pos'
import { dayjs } from '@wwsc/lib-dates'

function closuresHTML(closures: RegisterClosure[]) {
  let lis = closures
    .map((closure) => {
      let {
        register_name,
        staff_name,
        time_from,
        time_to,
        cash_balance,
        expected_cash_balance,
        payments,
        notes,
      } = closure

      let from = dayjs(time_from).format('dddd Do, HH:mm')
      let variance = cash_balance - expected_cash_balance
      let varianceClass =
        variance > 0
          ? 'variance positive'
          : variance < 0
          ? 'variance negative'
          : 'variance'
      return `
      <li class="closure">
        <p>${register_name}</p>
        <p>${staff_name}</p>
        <p>${from}</p>
        <ul class="payments">
          ${payments
            .map((payment) => {
              let { method, counted } = payment
              return `<li><span>${method}</span>: <span>${counted}</span></li>`
            })
            .join('')}
        </ul>
        <p class="notes">${notes ? notes : ''}</p>
        <p class="${varianceClass}">
          <span>variance</span>:<span>${variance.toFixed(2)}</span>
        </p>
      </li>`
    })
    .join('')

  let ul = `<ul>${lis}</ul>`
  return ul
}

export { closuresHTML }