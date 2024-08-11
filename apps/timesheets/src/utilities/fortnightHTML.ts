import { dayjs } from '@wwsc/lib-dates'

function fortnightHTML(startDate: string, endDate: string) {
  let start = dayjs(startDate).format('dddd MMMM Do, YYYY')
  let end = dayjs(endDate).format('dddd MMMM Do, YYYY')
  let html = `
    <details
      class="zerohours-${startDate}"
      id="zerohours-${startDate}"
      name="reports.zerohours"
      hx-trigger="toggle[this.open]"
      hx-target=".zerohours-${startDate} .content"
      hx-get="/reports/zerohours?start=${startDate}&end=${endDate}"
      hx-ext="json-enc"
      hx-indicator=".zerohours-${startDate} summary"
      title="zero hour staff reports from ${startDate} to ${endDate}">
        <summary>
          <span>${start}</span>
          <span>${end}</span>
        </summary>
        <section class="content"></section>
    </details>`

  return html
}

export { fortnightHTML }
