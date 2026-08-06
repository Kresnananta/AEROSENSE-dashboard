import { useEffect, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AirQualityGauge } from '@/components/dashboard/AirQualityGauge'
import { RealtimeMetrics } from '@/components/dashboard/RealtimeMetrics'
import { NodeSummary } from '@/components/dashboard/NodeSummary'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { MiniMap } from '@/components/dashboard/MiniMap'
import { RecentAlerts } from '@/components/dashboard/RecentAlerts'
import { supabase } from '@/services/supabase'

export function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [summary, setSummary] = useState({
    total: 0,
    online: 0,
    warning: 0,
    critical: 0
  })

  const [metricData, setMetricData] = useState({
    pm25: 0 as number | '-',
    co2: 0 as number | '-',
    tvoc: 0 as number | '-',
    temperature: 0 as number | '-',
    humidity: 0 as number | '-',
    aqi: 0 as number | '-',
    quality: '-'
  })

  useEffect(() => {
    async function fetchDynamicData() {
      try {
        setLoading(true)

        // 1. Ambil data nodes untuk ringkasan
        const { data: nodesData } = await supabase.from('nodes').select('*')
        if (nodesData && nodesData.length > 0) {
          const total = nodesData.length
          const warning = nodesData.filter((n: any) => n.status === 'warning' || n.status === 'moderate').length
          const critical = nodesData.filter((n: any) => n.status === 'critical' || n.status === 'offline' || n.status === 'hazardous').length
          const online = total - warning - critical

          setSummary({
            total,
            online: online > 0 ? online : 0,
            warning,
            critical
          })
        } else {
          setSummary({ total: 0, online: 0, warning: 0, critical: 0 })
        }

        // 2. Ambil data pembacaan sensor PALING BARU
        const { data: readingsData, error } = await supabase
          .from('node_readings')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1)

        console.log("Readings Terbaru:", readingsData, error)

        if (readingsData && readingsData.length > 0) {
          const item: any = readingsData[0]
          
          setMetricData({
            pm25: item.pm25 !== null && item.pm25 !== undefined ? Number(item.pm25) : '-',
            co2: (item.co2 ?? item.eco2) !== null && (item.co2 ?? item.eco2) !== undefined ? Number(item.co2 ?? item.eco2) : '-',
            tvoc: item.tvoc !== null && item.tvoc !== undefined ? Number(item.tvoc) : '-',
            temperature: item.temperature !== null && item.temperature !== undefined ? Number(item.temperature) : '-',
            humidity: item.humidity !== null && item.humidity !== undefined ? Number(item.humidity) : '-',
            aqi: item.aqi !== null && item.aqi !== undefined ? Number(item.aqi) : '-',
            quality: item.quality ?? '-',
          })
        } else {
          setMetricData({
            pm25: '-',
            co2: '-',
            tvoc: '-',
            temperature: '-',
            humidity: '-',
            aqi: '-',
            quality: '-'
          })
        }
      } catch (err) {
        console.error('Gagal memuat data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDynamicData()
  }, [])

  const mapStatusIndonesian = (q?: string) => {
    switch (q) {
      case 'good': return 'Baik'
      case 'moderate': return 'Sedang'
      case 'unhealthy': return 'Tidak Sehat'
      case 'hazardous': return 'Bahaya'
      default: return '-'
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selamat datang kembali, Kresna 👋
          </p>
        </div>
        
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari node, laporan..." 
            className="rounded-full bg-white/60 backdrop-blur-sm pl-9 border-transparent focus-visible:border-primary-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <AirQualityGauge 
            aqi={typeof metricData.aqi === 'number' ? metricData.aqi : 0} 
            status={metricData.aqi === '-' ? '-' : mapStatusIndonesian(metricData.quality)} 
            activeNodes={summary.total} 
            lastUpdated={metricData.aqi !== '-' ? "Baru saja" : "Tidak ada data"} 
          />
        </div>
        <div className="lg:col-span-2">
          <RealtimeMetrics 
            pm25={typeof metricData.pm25 === 'number' ? metricData.pm25 : 0}
            co2={typeof metricData.co2 === 'number' ? metricData.co2 : 0}
            tvoc={typeof metricData.tvoc === 'number' ? metricData.tvoc : 0}
            temperature={typeof metricData.temperature === 'number' ? metricData.temperature : 0}
            humidity={typeof metricData.humidity === 'number' ? metricData.humidity : 0}
          />
        </div>
        <div className="lg:col-span-1">
          <NodeSummary 
            total={summary.total}
            online={summary.online}
            warning={summary.warning}
            critical={summary.critical}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <TrendChart />
        <MiniMap />
      </div>

      <RecentAlerts />
    </div>
  )
}