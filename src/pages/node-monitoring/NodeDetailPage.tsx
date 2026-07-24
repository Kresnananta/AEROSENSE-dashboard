import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/constants'

// Node components
import { SensorCard } from '@/components/node/SensorCard'
import { HistoricalChart } from '@/components/node/HistoricalChart'
import { AIEstimationPanel } from '@/components/node/AIEstimationPanel'
import { NodeHealthCard } from '@/components/node/NodeHealthCard'

export function NodeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // In real app, fetch node detail by ID
  const nodeName = id === '1' ? 'Node Sidomoro 01' : 
                   id === '2' ? 'Node Sidomoro 02' : 
                   id === '3' ? 'Node Pabrik 01' : 
                   id === '4' ? 'Node Kawasan Berikat' : `Node ${id}`
  const status = id === '4' ? 'critical' : id === '2' ? 'warning' : 'online'

  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate(ROUTES.NODE_MONITORING)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {nodeName}
              </h1>
              <Badge className={`text-white border-transparent ${
                status === 'online' ? 'bg-green-500 hover:bg-green-600' :
                status === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                'bg-red-500 hover:bg-red-600'
              }`}>
                {status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {id} • Lokasi: -7.2504, 112.7688
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Cards (5 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SensorCard label="PM2.5" value="18" unit="µg/m³" status="normal" trend="stable" />
        <SensorCard label="TVOC" value="142" unit="ppb" status="normal" trend="down" />
        <SensorCard label="eCO₂" value="410" unit="ppm" status="normal" trend="up" />
        <SensorCard label="Suhu" value="29" unit="°C" status="normal" trend="stable" />
        <SensorCard label="Kelembapan" value="68" unit="%" status="normal" trend="up" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="h-[350px]">
            <HistoricalChart />
          </div>
          <div>
            <AIEstimationPanel />
          </div>
        </div>

        {/* Right Column (Info & Health) */}
        <div className="flex flex-col gap-6">
          <div className="h-48">
            <NodeHealthCard />
          </div>
          
          {/* Node Information Card */}
          <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
            <h3 className="font-semibold mb-4 text-sm">Informasi Perangkat</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">AS-Pro-2026</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Firmware</span>
                <span className="font-medium">v2.4.1</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">MAC Address</span>
                <span className="font-medium">00:1B:44:11:3A:B7</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Power Source</span>
                <span className="font-medium">Solar / Battery</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Baterai</span>
                <span className="font-medium text-green-500">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
