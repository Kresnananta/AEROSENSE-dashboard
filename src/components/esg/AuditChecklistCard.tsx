import { Check } from 'lucide-react'

export function AuditChecklistCard() {
  return (
    <article className="bg-white border border-[#e5eef8] rounded-[20px] shadow-sm p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[1.6px] text-[#6fa0ca] mb-1">
          KELENGKAPAN AUDIT
        </p>
        <h2 className="text-base sm:text-[17px] font-black tracking-[-0.5px] text-[#11223D] mb-4">
          Jejak data yang siap ditelusuri
        </h2>

        {/* Check Rows */}
        <div className="divide-y divide-[#eef3f7]">
          <div className="flex items-start gap-3 py-3">
            <span className="w-5 h-5 rounded-[7px] bg-[#e7f8ee] text-[#25b889] grid place-items-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-[#11223D]">
                Riwayat pembacaan
              </strong>
              <small className="block text-[10px] text-[#9aabbc] leading-relaxed mt-0.5">
                Waktu dan node dicatat per sampel
              </small>
            </div>
          </div>

          <div className="flex items-start gap-3 py-3">
            <span className="w-5 h-5 rounded-[7px] bg-[#e7f8ee] text-[#25b889] grid place-items-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-[#11223D]">
                Perbandingan AI
              </strong>
              <small className="block text-[10px] text-[#9aabbc] leading-relaxed mt-0.5">
                Nilai mentah dan hasil estimasi berdampingan
              </small>
            </div>
          </div>

          <div className="flex items-start gap-3 py-3">
            <span className="w-5 h-5 rounded-[7px] bg-[#e7f8ee] text-[#25b889] grid place-items-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <div>
              <strong className="block text-xs font-bold text-[#11223D]">
                Log peringatan
              </strong>
              <small className="block text-[10px] text-[#9aabbc] leading-relaxed mt-0.5">
                Kejadian dan tindak lanjut terdokumentasi
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Note */}
      <div className="bg-[#eff7ff] border border-[#dceeff] rounded-xl p-3 mt-4">
        <strong className="block text-xs font-bold text-[#3976af]">
          Catatan penting
        </strong>
        <p className="text-[10px] text-[#7893aa] leading-relaxed mt-1">
          eCO₂ pada sensor tidak langsung mewakili emisi karbon perusahaan. Validasi terpisah diperlukan untuk laporan emisi resmi.
        </p>
      </div>
    </article>
  )
}
