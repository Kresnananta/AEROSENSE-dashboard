import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AirQualityGauge } from '@/components/dashboard/AirQualityGauge'
import { RealtimeMetrics } from '@/components/dashboard/RealtimeMetrics'
import { NodeSummary } from '@/components/dashboard/NodeSummary'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { MiniMap } from '@/components/dashboard/MiniMap'
import { RecentAlerts } from '@/components/dashboard/RecentAlerts'

/**
 * Dashboard Page
 *
 * Main overview page showing key metrics, recent readings,
 * and sensor status summary.
 */
export function DashboardPage() {
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
        
        {/* Search */}
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Cari node, laporan..." 
            className="rounded-full bg-white/60 backdrop-blur-sm pl-9 border-transparent focus-visible:border-primary-500 shadow-sm"
          />
        </div>
      </div>

      {/* KPI cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <AirQualityGauge 
            aqi={42} 
            status="Baik" 
            activeNodes={12} 
            lastUpdated="2 menit lalu" 
          />
        </div>
        <div className="lg:col-span-2">
          <RealtimeMetrics />
        </div>
        <div className="lg:col-span-1">
          <NodeSummary />
        </div>
      </div>

      {/* Charts section */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <TrendChart />
        <MiniMap />
      </div>

      {/* Alerts section */}
      <RecentAlerts />
    </div>
  )
}
