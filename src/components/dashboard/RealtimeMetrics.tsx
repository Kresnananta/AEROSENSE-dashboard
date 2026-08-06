import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  label: string
  value: string | number | undefined
  unit: string
  className?: string
}

function MetricCard({ label, value, unit, className }: MetricCardProps) {
  return (
    <div className={`flex flex-col p-4 rounded-xl border border-border/50 bg-secondary/20 ${className || ''}`}>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-foreground">{value !== undefined && value !== null ? value : '-'}</span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

interface RealtimeMetricsProps {
  pm25?: number
  co2?: number
  tvoc?: number
  temperature?: number
  humidity?: number
}

export function RealtimeMetrics({ 
  pm25, 
  co2, 
  tvoc, 
  temperature, 
  humidity 
}: RealtimeMetricsProps) {
  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold text-foreground">
          Metrik Real-time
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-4 flex-1">
        <MetricCard label="PM2.5" value={pm25} unit="µg/m³" className="col-span-2" />
        <MetricCard label="CO2" value={co2} unit="ppm" className="col-span-2" />
        <MetricCard label="TVOC" value={tvoc} unit="ppb" className="col-span-2" />
        <MetricCard label="Suhu" value={temperature} unit="°C" className="col-span-3" />
        <MetricCard label="Kelembapan" value={humidity} unit="%" className="col-span-3" />
      </CardContent>
    </Card>
  )
}