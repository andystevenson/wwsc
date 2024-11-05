import { dayjs } from '@wwsc/lib-dates'
import Excel from 'exceljs'

export async function xlsx(data: any, filename: string) {
  let rows = data
    .map((row: any) => {
      let { file1, file2, net, vat, total } = row

      let type1 = file1.includes('-pcn-') ? 'credit note' : 'invoice'
      row.file1 = file1
        ? { text: `${type1} ▶️`, hyperlink: file1, tooltip: 'invoice' }
        : ''

      let type2 = file2.includes('-pcn-') ? 'credit note' : 'invoice'
      row.file2 = file2
        ? { text: `${type2} ▶️`, hyperlink: file2, tooltip: 'invoice' }
        : ''

      row.net = +net
      row.vat = +vat
      row.total = +total
      return row
    })
    .map((row: any) => Object.values(row))
  let now = dayjs()
  const wb = new Excel.Workbook()
  wb.creator = 'andy@westwarwicks.co.uk'
  wb.lastModifiedBy = 'andy@westwarwicks.co.uk'
  wb.created = now.toDate()
  wb.modified = wb.created
  wb.lastPrinted = wb.created
  wb.properties.date1904 = true
  wb.calcProperties.fullCalcOnLoad = true
  wb.views = [
    {
      x: 0,
      y: 0,
      width: 30000,
      height: 20000,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible',
    },
  ]

  const ws = wb.addWorksheet('stocktake')
  ws.state = 'visible'
  ws.pageSetup.fitToPage = true
  ws.properties.defaultRowHeight = 15

  let numFmt = '£#,##0.00'
  let style = { font: { size: 18 }, numFmt }
  ws.columns = [
    { key: 'name', width: 40, style },
    { key: 'date', width: 18, style },
    { key: 'ref', width: 30, style, numFmt: '0' },
    { key: 'net', width: 14, style },
    { key: 'vat', width: 14, style },
    { key: 'total', width: 14, style },
    { key: 'file1', width: 20, style: { font: { size: 18, bold: true } } },
    { key: 'file2', width: 20, style: { font: { size: 18, bold: true } } },
  ]

  ws.addTable({
    name: 'stocktake',
    ref: `A1:H${rows.length + 1}`,
    headerRow: true,
    style: {
      theme: 'TableStyleLight1',
      showRowStripes: true,
    },
    columns: [
      { name: 'name', filterButton: true },
      { name: 'date', filterButton: true },
      { name: 'ref', filterButton: true },
      { name: 'net', filterButton: true },
      { name: 'vat', filterButton: true },
      { name: 'total', filterButton: true },
      { name: 'file1', filterButton: true },
      { name: 'file2', filterButton: true },
    ],
    rows,
  })

  // ws.commit()
  await wb.xlsx.writeFile(filename)
}
