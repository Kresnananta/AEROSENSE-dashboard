import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AirQualityGaugeProps {
  aqi?: number | string
  status?: 'Baik' | 'Sedang' | 'Tidak Sehat' | 'Bahaya' | string
  activeNodes: number
  lastUpdated: string
}

export function AirQualityGauge({
  aqi,
  status,
  activeNodes,
  lastUpdated,
}: AirQualityGaugeProps) {
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
  } else if (!status || status === '-') {
    colorClass = 'text-muted-foreground'
    strokeClass = 'stroke-transparent'
    badgeClass = 'bg-secondary text-muted-foreground hover:bg-secondary'
  }

  const numericAqi = typeof aqi === 'number' ? aqi : 0
  const circumference = 251.2
  const fillPercentage = aqi !== undefined && aqi !== '-' ? Math.min(Math.max(numericAqi / 500, 0), 1) : 0
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
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="stroke-muted"
                strokeWidth="10"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className={aqi !== undefined && aqi !== '-' ? strokeClass : 'stroke-transparent'}
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
              <span className="text-3xl font-bold text-foreground">{aqi !== undefined ? aqi : '-'}</span>
              <span className="text-xs text-muted-foreground">AQI</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-2xl font-bold ${status && status !== '-' ? colorClass : 'text-muted-foreground'}`}>
              {status ?? '-'}
            </span>
            {status && status !== '-' ? (
              <Badge variant="secondary" className={`mt-1 ${badgeClass} border-transparent`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                {status === 'Baik' ? 'Aman' : status === 'Sedang' ? 'Waspada' : 'Bahaya'}
              </Badge>
            ) : (
              <Badge variant="secondary" className={`mt-1 bg-secondary text-muted-foreground border-transparent`}>
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-1.5" />
                -
              </Badge>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-4 text-center">
          Rata-rata {activeNodes} node aktif · update {lastUpdated}
        </div>
      </CardContent>
    </Card>
  )
}