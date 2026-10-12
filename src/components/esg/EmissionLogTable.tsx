import { DEFAULT_REPORT_ROWS } from '../../lib/export-utils'

export function EmissionLogTable() {
  return (
    <article className="card p-5 lg:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            BUKTI PEMANTAUAN
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Cuplikan log emisi
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {DEFAULT_REPORT_ROWS.length} catatan terbaru
        </span>
      </div>

      <div className="overflow-x-auto -mx-5 px-5 lg:-mx-6 lg:px-6">
        <table className="w-full text-left text-sm border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <th className="py-2.5 px-3">Waktu</th>
              <th className="py-2.5 px-3">Lokasi</th>
              <th className="py-2.5 px-3">Parameter</th>
              <th className="py-2.5 px-3">Mentah</th>
              <th className="py-2.5 px-3">Estimasi</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {DEFAULT_REPORT_ROWS.map((row, index) => {
              const isWarning = row.status === 'Ditinjau'
              return (
                <tr
                  key={index}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap text-xs">
                    {row.waktu}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {row.lokasi}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {row.parameter}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {row.mentah}
                  </td>
                  <td className="py-3 px-3 font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                    {row.estimasi}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isWarning
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </article>
  )
}
