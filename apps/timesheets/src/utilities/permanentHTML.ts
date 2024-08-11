import { dayjs } from '@wwsc/lib-dates'

function permanentHTML(month: string) {
  let start = dayjs(month).format('MMMM YYYY')
  let html = `
    <details
      class="permanent-${month}"
      id="permanent-${month}"
      name="reports.permanent"
      hx-trigger="toggle[this.open]"
      hx-target=".permanent-${month} .content"
      hx-get="/reports/permanent?start=${month}"
      hx-ext="json-enc"
      hx-indicator=".permanent-${month} summary"
      title="permanent staff reports ${month}">
        <summary>
          <span>${start}</span>
        </summary>
        <section class="content"></section>
    </details>`

  return html
}

export { permanentHTML }
