export interface ReportRow {
  waktu: string
  lokasi: string
  parameter: string
  mentah: string
  estimasi: string
  status: string
}

export const DEFAULT_REPORT_ROWS: ReportRow[] = [
  {
    waktu: '30 Sep 2026 09:25',
    lokasi: 'Sidayu',
    parameter: 'PM2.5',
    mentah: '37,8 µg/m³',
    estimasi: '32,4 µg/m³',
    status: 'Ditinjau',
  },
  {
    waktu: '30 Sep 2026 08:50',
    lokasi: 'Manyar',
    parameter: 'TVOC',
    mentah: '235 ppb',
    estimasi: '221 ppb',
    status: 'Ditinjau',
  },
  {
    waktu: '30 Sep 2026 08:30',
    lokasi: 'Gresik Kota',
    parameter: 'PM2.5',
    mentah: '16,5 µg/m³',
    estimasi: '15,2 µg/m³',
    status: 'Tercatat',
  },
  {
    waktu: '30 Sep 2026 08:15',
    lokasi: 'Cerme',
    parameter: 'PM2.5',
    mentah: '13,4 µg/m³',
    estimasi: '12,1 µg/m³',
    status: 'Tercatat',
  },
]

function downloadBlob(name: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function xmlEscape(value: string | number) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function downloadCsv(period: string, region: string, rows: ReportRow[] = DEFAULT_REPORT_ROWS) {
  const header = [
    ['AEROSENSE — DATA SIMULASI'],
    ['Periode', period],
    ['Wilayah', region],
    [],
    ['Waktu', 'Lokasi', 'Parameter', 'Mentah', 'Estimasi', 'Status'],
  ]

  const dataRows = rows.map((r) => [r.waktu, r.lokasi, r.parameter, r.mentah, r.estimasi, r.status])
  const csvContent =
    '\ufeff' +
    header
      .concat(dataRows)
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n')

  downloadBlob('AEROSENSE_Laporan_Contoh.csv', 'text/csv;charset=utf-8', csvContent)
}

export function downloadExcelXml(period: string, region: string, rows: ReportRow[] = DEFAULT_REPORT_ROWS) {
  const allRows = [
    ['AEROSENSE — DATA SIMULASI'],
    ['Periode', period],
    ['Wilayah', region],
    [],
    ['Waktu', 'Lokasi', 'Parameter', 'Mentah', 'Estimasi', 'Status'],
    ...rows.map((r) => [r.waktu, r.lokasi, r.parameter, r.mentah, r.estimasi, r.status]),
  ]

  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Audit ESG"><Table>${allRows
    .map(
      (row) =>
        `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`).join('')}</Row>`
    )
    .join('')}</Table></Worksheet></Workbook>`

  downloadBlob('AEROSENSE_Laporan_Contoh.xml', 'application/vnd.ms-excel;charset=utf-8', xml)
}

export function openPrintablePdf(period: string, region: string, rows: ReportRow[] = DEFAULT_REPORT_ROWS) {
  const win = window.open('', '_blank')
  if (!win) {
    return false
  }

  const periodEsc = xmlEscape(period)
  const regionEsc = xmlEscape(region)

  win.document.write(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan contoh AEROSENSE</title>
  <style>
    body { font-family: Arial, sans-serif; color: #153052; padding: 36px; max-width: 900px; margin: auto; }
    h1 { color: #076cf0; font-size: 26px; }
    p { line-height: 1.5; }
    .note { background: #eaf5ff; padding: 12px; border-radius: 8px; border: 1px solid #cce5ff; }
    table { border-collapse: collapse; width: 100%; margin-top: 24px; }
    th, td { text-align: left; border-bottom: 1px solid #dce7f3; padding: 10px; font-size: 12px; }
    th { background: #eff7ff; font-weight: bold; }
    small { color: #6f839a; }
  </style>
</head>
<body>
  <h1>AEROSENSE™ — Laporan ESG</h1>
  <p>Periode: <b>${periodEsc}</b><br>Wilayah: <b>${regionEsc}</b></p>
  <p class="note"><b>Data simulasi.</b> Dokumen ini dibuat untuk pratinjau antarmuka dan tidak berlaku sebagai bukti audit resmi. Skor kepatuhan contoh: 92/100. Estimasi jejak karbon memerlukan data aktivitas dan faktor emisi tervalidasi.</p>
  <h2>Cuplikan log pemantauan</h2>
  <table>
    <thead>
      <tr>
        <th>Waktu</th>
        <th>Lokasi</th>
        <th>Parameter</th>
        <th>Mentah</th>
        <th>Estimasi</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r) =>
            `<tr>
          <td>${xmlEscape(r.waktu)}</td>
          <td>${xmlEscape(r.lokasi)}</td>
          <td>${xmlEscape(r.parameter)}</td>
          <td>${xmlEscape(r.mentah)}</td>
          <td>${xmlEscape(r.estimasi)}</td>
          <td>${xmlEscape(r.status)}</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>
  <p><small>AEROSENSE • Simulasi antarmuka • 30 September 2026</small></p>
</body>
</html>`)

  win.document.close()
  setTimeout(() => {
    win.focus()
    win.print()
  }, 350)

  return true
}
