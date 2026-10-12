import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { downloadCsv, downloadExcelXml, openPrintablePdf } from '@/lib/export-utils'
import { useToast } from '@/components/shared/Toast'

export function ReportExportCard() {
  const [period, setPeriod] = useState('September 2026')
  const [region, setRegion] = useState('Seluruh kawasan Gresik')
  const { showToast } = useToast()

  const handleExportPdf = () => {
    const ok = openPrintablePdf(period, region)
    if (!ok) {
      showToast('Izinkan jendela baru (pop-up) untuk mencetak atau menyimpan PDF.')
    } else {
      showToast('Jendela pratinjau PDF siap dicetak dibuka.')
    }
  }

  const handleExportCsv = () => {
    downloadCsv(period, region)
    showToast('CSV contoh berhasil diunduh.')
  }

  const handleExportExcel = () => {
    downloadExcelXml(period, region)
    showToast('File yang dapat dibuka di Excel berhasil diunduh.')
  }

  const cleanPeriod = period.replace(/\s+/g, '_')

  return (
    <article className="bg-white border border-[#e5eef8] rounded-[20px] shadow-sm p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[1.6px] text-[#6fa0ca] mb-1">
              BUAT LAPORAN
            </p>
            <h2 className="text-base sm:text-lg font-black text-[#11223D]">
              Ekspor ringkasan ESG
            </h2>
            <p className="text-[10px] text-[#8c9db1] mt-0.5">
              Pilih periode dan format dokumen yang dibutuhkan.
            </p>
          </div>
          <div className="w-[35px] h-[35px] rounded-[10px] bg-[#e7f3ff] text-[#0b77f1] grid place-items-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Dropdown Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
          <div>
            <label htmlFor="esg-period-select" className="block text-[10px] font-extrabold text-[#60758e] mb-1.5">
              Periode laporan
            </label>
            <select
              id="esg-period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full min-h-[38px] rounded-[9px] border border-[#dfe9f4] bg-[#fbfdff] text-[#274363] px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#76bcff]"
            >
              <option>September 2026</option>
              <option>Agustus 2026</option>
              <option>Juli 2026</option>
            </select>
          </div>

          <div>
            <label htmlFor="esg-region-select" className="block text-[10px] font-extrabold text-[#60758e] mb-1.5">
              Wilayah
            </label>
            <select
              id="esg-region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full min-h-[38px] rounded-[9px] border border-[#dfe9f4] bg-[#fbfdff] text-[#274363] px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#76bcff]"
            >
              <option>Seluruh kawasan Gresik</option>
              <option>Gresik Kota & Manyar</option>
              <option>Zona penyangga industri</option>
            </select>
          </div>
        </div>

        {/* Document Preview Box */}
        <div className="flex items-center gap-3 border border-dashed border-[#cee3f8] rounded-xl bg-[#f6fbff] p-3.5 my-3">
          <div className="w-8 h-8 rounded-lg bg-[#e5f3ff] text-[#147cf4] grid place-items-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <strong className="block text-xs font-bold text-[#11223D] truncate">
              Ringkasan_AEROSENSE_{cleanPeriod}
            </strong>
            <small className="block text-[10px] text-[#93a2b5] mt-0.5">
              Berisi status node, metrik PM2.5 & TVOC, serta log peringatan contoh.
            </small>
          </div>
        </div>
      </div>

      <div>
        {/* Export Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="rounded-[9px] bg-[#0876f4] hover:bg-[#005fda] text-white px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Simpan PDF
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-[9px] border border-[#cfe3f7] bg-white hover:bg-[#f1f8ff] text-[#2275c6] px-3.5 py-2 text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
          >
            Unduh CSV
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="rounded-[9px] border border-[#cfe3f7] bg-white hover:bg-[#f1f8ff] text-[#2275c6] px-3.5 py-2 text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
          >
            Unduh Excel
          </button>
        </div>

        {/* Footnote */}
        <p className="text-[9.5px] text-[#91a2b6] leading-relaxed mt-3">
          Laporan ini berisi data simulasi. Estimasi jejak karbon membutuhkan data aktivitas dan faktor emisi yang tervalidasi.
        </p>
      </div>
    </article>
  )
}
