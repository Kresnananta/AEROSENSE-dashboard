import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AirQualityGaugeProps {
  aqi: number
  status: 'Baik' | 'Sedang' | 'Tidak Sehat' | 'Bahaya'
  activeNodes: number
  lastUpdated: string
}

export function AirQualityGauge({
  aqi,
  status,
  activeNodes,
  lastUpdated,
}: AirQualityGaugeProps) {
  // Determine colors based on status
  let colorClass = 'text-green-500'
  let strokeClass = 'stroke-green-500'
  let badgeClass = 'bg-green-100 text-green-700 hover:bg-green-100'

  if (status === 'Sedang') {
    colorClass = 'text-yellow-500'
    strokeClass = 'stroke-yellow-500'
    badgeClass = 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
  } else if (status === 'Tidak Sehat') {
    colorClass = 'text-orange-500'
    strokeClass = 'stroke-orange-500'
    badgeClass = 'bg-orange-100 text-orange-700 hover:bg-orange-100'
  } else if (status === 'Bahaya') {
    colorClass = 'text-red-500'
    strokeClass = 'stroke-red-500'
    badgeClass = 'bg-red-100 text-red-700 hover:bg-red-100'
  }

  // Calculate SVG stroke dasharray for the gauge
  // Circumference = 2 * pi * r. r=40 -> ~251.2
  const circumference = 251.2
  // Maximum AQI we display for the full circle could be 500
  const fillPercentage = Math.min(Math.max(aqi / 500, 0), 1)
  const strokeDashoffset = circumference - fillPercentage * circumference

  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Indeks Kualitas Udara
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="flex items-center justify-center flex-1 gap-6">
          {/* Gauge SVG */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="stroke-muted"
                strokeWidth="10"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              {/* Foreground circle */}
              <circle
                className={strokeClass}
                strokeWidth="10"
                strokeLinecap="round"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s ease-in-out',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{aqi}</span>
              <span className="text-xs text-muted-foreground">AQI</span>
            </div>
          </div>

          {/* Status Text & Badge */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-2xl font-bold ${colorClass}`}>{status}</span>
            <Badge variant="secondary" className={`mt-1 ${badgeClass} border-transparent`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {status === 'Baik' ? 'Aman' : status === 'Sedang' ? 'Waspada' : 'Bahaya'}
            </Badge>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground mt-4 text-center">
          Rata-rata {activeNodes} node aktif · update {lastUpdated}
        </div>
      </CardContent>
    </Card>
  )
}
