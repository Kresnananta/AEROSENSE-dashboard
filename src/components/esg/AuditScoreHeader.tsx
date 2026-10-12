import { Check, Bell } from 'lucide-react'

export function AuditScoreHeader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(140px,0.65fr)_minmax(140px,0.65fr)] gap-3.5 mb-5">
      {/* Compliance Score Card */}
      <article className="rounded-[20px] bg-gradient-to-r from-[#086df0] to-[#2b9bff] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 min-h-[157px] shadow-sm overflow-hidden gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[1.6px] text-[#bde5ff] mb-1.5">
            SKOR KEPATUHAN CONTOH
          </p>
          <h2 className="text-base sm:text-[17px] font-black tracking-[-0.5px] leading-snug mb-2 max-w-[310px]">
            Selangkah lebih dekat ke udara yang lebih baik.
          </h2>
          <p className="text-[10px] leading-relaxed text-[#e3f3ff] max-w-[340px]">
            Skor merangkum kelengkapan data dan kejadian melewati batas yang ditetapkan untuk simulasi ini.
          </p>
        </div>

        {/* Circular Ring */}
        <div className="audit-score-ring self-center sm:self-auto">
          <span className="text-[28px] font-black tracking-[-1.5px] leading-none">
            92<small className="text-[9px] font-bold tracking-normal">/100</small>
          </span>
          <b className="text-[6.5px] font-black tracking-wider uppercase mt-1">
            SANGAT BAIK
          </b>
        </div>
      </article>

      {/* Mini Stat 1: Logged data */}
      <article className="bg-white border border-[#e5eef8] rounded-[20px] shadow-sm min-h-[157px] p-5 flex flex-col justify-between">
        <div className="w-[30px] h-[30px] rounded-[9px] bg-[#e6f1ff] text-[#0d77f4] grid place-items-center">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="block text-[10px] text-[#899aaf] font-bold">
            Data tercatat
          </span>
          <strong className="block text-3xl font-black text-[#11223D] tracking-[-1px] leading-tight mt-1">
            10.240
          </strong>
          <small className="block text-[9.5px] text-[#a4b1c0] font-medium mt-1">
            Pembacaan periode ini
          </small>
        </div>
      </article>

      {/* Mini Stat 2: Review events */}
      <article className="bg-white border border-[#e5eef8] rounded-[20px] shadow-sm min-h-[157px] p-5 flex flex-col justify-between">
        <div className="w-[30px] h-[30px] rounded-[9px] bg-[#fff2e7] text-[#ed8a4c] grid place-items-center">
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-[10px] text-[#899aaf] font-bold">
            Kejadian ditinjau
          </span>
          <strong className="block text-3xl font-black text-[#11223D] tracking-[-1px] leading-tight mt-1">
            2
          </strong>
          <small className="block text-[9.5px] text-[#a4b1c0] font-medium mt-1">
            Perlu catatan tindak lanjut
          </small>
        </div>
      </article>
    </div>
  )
}
