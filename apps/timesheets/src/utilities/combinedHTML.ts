import { dayjs } from '@wwsc/lib-dates'

function combinedHTML(month: string) {
  let start = dayjs(month).format('MMMM YYYY')
  let html = `
    <details
      class="combined-${month}"
      id="combined-${month}"
      name="reports.combined"
      hx-trigger="toggle[this.open]"
      hx-target=".combined-${month} .content"
      hx-get="/reports/combined?start=${month}"
      hx-ext="json-enc"
      hx-indicator=".combined-${month} summary"
      title="combined staff reports ${month}">
        <summary>
          <span>${start}</span>
        </summary>
        <section class="content"></section>
    </details>`

  return html
}

export { combinedHTML }
