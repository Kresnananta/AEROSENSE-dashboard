import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeading } from '@/components/shared/PageHeading'
import { ROUTES } from '@/lib/constants'
import { Search, ChevronRight } from 'lucide-react'

const MOCK_NODES = [
  {
    id: 'AS-CRM-01',
    name: 'Cerme',
    status: 'baik',
    pm25: '12,1',
    tvoc: '74',
    eco2: '552',
    temp: '29,8',
    humidity: '68',
    lastUpdate: '1 mnt lalu',
  },
  {
    id: 'AS-GRK-02',
    name: 'Gresik Kota',
    status: 'baik',
    pm25: '15,2',
    tvoc: '89',
    eco2: '590',
    temp: '30,2',
    humidity: '65',
    lastUpdate: 'Sekarang',
  },
  {
    id: 'AS-MYR-03',
    name: 'Manyar',
    status: 'perhatian',
    pm25: '25,8',
    tvoc: '221',
    eco2: '688',
    temp: '31,1',
    humidity: '62',
    lastUpdate: 'Sekarang',
  },
  {
    id: 'AS-BGH-04',
    name: 'Bungah',
    status: 'baik',
    pm25: '13,6',
    tvoc: '81',
    eco2: '568',
    temp: '29,4',
    humidity: '70',
    lastUpdate: '2 mnt lalu',
  },
  {
    id: 'AS-SDY-05',
    name: 'Sidayu',
    status: 'perhatian',
    pm25: '32,4',
    tvoc: '168',
    eco2: '714',
    temp: '31,5',
    humidity: '59',
    lastUpdate: '1 mnt lalu',
  },
  {
    id: 'AS-DRY-06',
    name: 'Driyorejo',
    status: 'baik',
    pm25: '16,8',
    tvoc: '92',
    eco2: '602',
    temp: '30,7',
    humidity: '66',
    lastUpdate: '3 mnt lalu',
  },
  {
    id: 'AS-KBM-07',
    name: 'Kebomas',
    status: 'baik',
    pm25: '14,7',
    tvoc: '86',
    eco2: '584',
    temp: '30,0',
    humidity: '67',
    lastUpdate: '2 mnt lalu',
  },
  {
    id: 'AS-MGT-08',
    name: 'Menganti',
    status: 'baik',
    pm25: '15,9',
    tvoc: '90',
    eco2: '598',
    temp: '30,3',
    humidity: '64',
    lastUpdate: 'Sekarang',
  },
  {
    id: 'AS-UJP-09',
    name: 'Ujungpangkah',
    status: 'baik',
    pm25: '11,8',
    tvoc: '71',
    eco2: '540',
    temp: '29,6',
    humidity: '71',
    lastUpdate: '4 mnt lalu',
  },
  {
    id: 'AS-WRN-10',
    name: 'Wringinanom',
    status: 'baik',
    pm25: '16,3',
    tvoc: '95',
    eco2: '606',
    temp: '30,4',
    humidity: '63',
    lastUpdate: '1 mnt lalu',
  },
]

export function NodeMonitoringPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'semua' | 'baik' | 'perhatian'>('semua')

  const filteredNodes = MOCK_NODES.filter((node) => {
    const matchSearch =
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      node.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'semua' || node.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeading
        eyebrow="JARINGAN SENSOR • GRESIK"
        title="Daftar Node"
        titleAccent="Pemantau"
        description="Ringkasan pengukuran seluruh node sensor IoT aktif di kawasan Gresik."
        badge={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e7f3ff] text-[#086cf0] border border-[#cbe3ff]">
            10 Node Beroperasi
          </span>
        }
      />

      <div className="card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-5 sm:p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau ID node..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-white"
            />
          </div>

          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'semua'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilter('baik')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'baik'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Baik
            </button>
            <button
              type="button"
              onClick={() => setFilter('perhatian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'perhatian'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Perlu Perhatian
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 px-5 sm:-mx-6 sm:px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3">Nama Node</th>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">PM2.5</th>
                <th className="py-2.5 px-3">TVOC</th>
                <th className="py-2.5 px-3">eCO₂</th>
                <th className="py-2.5 px-3">Suhu</th>
                <th className="py-2.5 px-3">Lembap</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Pembaruan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredNodes.map((node) => {
                const isWarn = node.status === 'perhatian'
                return (
                  <tr
                    key={node.id}
                    onClick={() => navigate(ROUTES.NODE_DETAIL.replace(':id', node.id))}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {node.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-400">
                      {node.id}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {node.pm25} µg/m³
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {node.tvoc} ppb
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {node.eco2} ppm
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                      {node.temp}°C
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                      {node.humidity}%
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isWarn
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {isWarn ? 'Perlu perhatian' : 'Baik'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400">
                      {node.lastUpdate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <ChevronRight className="w-4 h-4 inline-block text-slate-400" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
