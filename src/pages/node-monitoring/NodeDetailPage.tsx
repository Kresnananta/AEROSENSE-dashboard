import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

// Node components
import { SensorCard } from '@/components/node/SensorCard'
import { HistoricalChart } from '@/components/node/HistoricalChart'
import { AIEstimationPanel } from '@/components/node/AIEstimationPanel'
import { NodeHealthCard } from '@/components/node/NodeHealthCard'

export function NodeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Match node name from ID or default
  const nodeNames: Record<string, string> = {
    'AS-CRM-01': 'Cerme',
    'AS-GRK-02': 'Gresik Kota',
    'AS-MYR-03': 'Manyar',
    'AS-BGH-04': 'Bungah',
    'AS-SDY-05': 'Sidayu',
    'AS-DRY-06': 'Driyorejo',
    'AS-KBM-07': 'Kebomas',
    'AS-MGT-08': 'Menganti',
    'AS-UJP-09': 'Ujungpangkah',
    'AS-WRN-10': 'Wringinanom',
    '1': 'Cerme',
    '2': 'Gresik Kota',
    '3': 'Manyar',
    '4': 'Sidayu',
  }

  const nodeName = (id && nodeNames[id]) || (id ? `Node ${id}` : 'Node Sensor')
  const isWarn = id === 'AS-MYR-03' || id === 'AS-SDY-05' || id === '3' || id === '4'

  return (
    <div className="space-y-5 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.NODE_MONITORING)}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 grid place-items-center transition-colors shadow-xs cursor-pointer"
            aria-label="Kembali ke monitoring"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white">
                {nodeName}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isWarn
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                {isWarn ? 'Perlu perhatian' : 'Aktif • Baik'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ID: {id || 'AS-01'} • Kawasan Gresik, Jawa Timur
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Cards (5 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SensorCard label="PM2.5" value="18" unit="µg/m³" status="normal" trend="stable" />
        <SensorCard label="TVOC" value="142" unit="ppb" status="normal" trend="down" />
        <SensorCard label="eCO₂" value="410" unit="ppm" status="normal" trend="up" />
        <SensorCard label="Suhu" value="29" unit="°C" status="normal" trend="stable" />
        <SensorCard label="Kelembapan" value="68" unit="%" status="normal" trend="up" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="h-[350px]">
            <HistoricalChart />
          </div>
          <div>
            <AIEstimationPanel />
          </div>
        </div>

        {/* Right Column (Info & Health) */}
        <div className="flex flex-col gap-5">
          <div className="h-48">
            <NodeHealthCard />
          </div>

          {/* Node Information Card */}
          <div className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              Informasi Perangkat
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Model</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">AEROSENSE-Node-v2</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Firmware</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">v2.4.1 (GRU Ready)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400">MAC Address</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">00:1B:44:11:3A:B7</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Sumber Daya</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Solar + Li-ion 18650</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Kesehatan Baterai</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">94% (Optimal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
