import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  label: string
  value: string | number
  unit: string
  className?: string
}

function MetricCard({ label, value, unit, className }: MetricCardProps) {
  return (
    <div className={`flex flex-col p-4 rounded-xl border border-border/50 bg-secondary/20 ${className || ''}`}>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export function RealtimeMetrics() {
  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold text-foreground">
          Metrik Real-time
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-4 flex-1">
        <MetricCard label="PM2.5" value="18" unit="µg/m³" className="col-span-2" />
        <MetricCard label="CO2" value="410" unit="ppm" className="col-span-2" />
        <MetricCard label="TVOC" value="142" unit="ppb" className="col-span-2" />
        <MetricCard label="Suhu" value="29" unit="°C" className="col-span-3" />
        <MetricCard label="Kelembapan" value="68" unit="%" className="col-span-3" />
      </CardContent>
    </Card>
  )
}
