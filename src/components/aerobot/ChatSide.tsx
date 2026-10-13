import { Sparkles, Check } from 'lucide-react'

export function ChatSide() {
  return (
    <aside className="space-y-5">
      {/* Intro Card */}
      <article className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#e8f6ff] to-[#d8ebff] dark:from-sky-950/40 dark:to-slate-900 border border-[#d1eaff] dark:border-sky-900/40 shadow-sm relative overflow-hidden">
        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 grid place-items-center shadow-md mb-5">
          <Sparkles className="w-5 h-5" />
        </div>

        <p className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
          KENALAN DULU
        </p>
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-2">
          Teman memahami udara, tanpa istilah yang bikin bingung.
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          AERO-BOT mengubah data sensor menjadi penjelasan singkat dan langkah praktis untuk warga Indonesia.
        </p>

        {/* Audio Wave Visualizer */}
        <div className="intro-wave" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </article>

      {/* Scope / Boundaries Card */}
      <article className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-3">
          YANG BISA DITANYAKAN
        </p>

        <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <li className="py-2.5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium">
            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>Arti AQI, PM2.5, eCO₂, dan TVOC</span>
          </li>
          <li className="py-2.5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium">
            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>Status node dan peringatan</span>
          </li>
          <li className="py-2.5 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium">
            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>Langkah umum menjaga kenyamanan napas</span>
          </li>
        </ul>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          Untuk keluhan kesehatan, hubungi tenaga kesehatan.
        </p>
      </article>
    </aside>
  )
}
