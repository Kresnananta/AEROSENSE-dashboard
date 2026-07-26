import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ArrowDownToLine, ArrowUpToLine, Hash, Waves } from 'lucide-react'

const MOCK_STATS = [
  { label: 'Rata-Rata', value: '45.2', unit: 'µg/m³', icon: Activity },
  { label: 'Nilai Min', value: '12.0', unit: 'µg/m³', icon: ArrowDownToLine },
  { label: 'Nilai Max', value: '89.4', unit: 'µg/m³', icon: ArrowUpToLine },
  { label: 'Median', value: '42.0', unit: 'µg/m³', icon: Hash },
  { label: 'Std Dev', value: '±14.5', unit: 'µg/m³', icon: Waves },
]

export function StatsSummary() {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
      {MOCK_STATS.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.unit}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
