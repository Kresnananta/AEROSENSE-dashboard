import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

// Dummy data for alerts
const ALERTS = [
  {
    id: 1,
    severity: 'warning',
    node: 'Node #02',
    title: 'Waspada',
    message: 'PM2.5 meningkat, gunakan masker saat beraktivitas di luar ruangan.',
    time: '10 menit lalu',
  },
  {
    id: 2,
    severity: 'info',
    node: 'Sistem',
    title: 'Ringkasan Mingguan',
    message: 'Kualitas udara membaik 12% dibanding minggu sebelumnya.',
    time: 'Kemarin',
  },
  {
    id: 3,
    severity: 'normal',
    node: 'Node #01',
    title: 'Normal',
    message: 'Kondisi udara kembali aman, tidak diperlukan tindakan.',
    time: '1 jam lalu',
  },
]

export function RecentAlerts() {
  return (
    <Card className="flex flex-col border-border/50 shadow-sm col-span-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-foreground">
          Peringatan Terbaru
        </CardTitle>
        <a href="#" className="text-xs font-semibold text-primary-600 hover:underline">
          Lihat semua
        </a>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 snap-x">
          {ALERTS.map((alert) => {
            let borderColor = 'border-l-green-500'
            let Icon = CheckCircle2
            let iconColor = 'text-green-500'

            if (alert.severity === 'warning') {
              borderColor = 'border-l-yellow-500'
              Icon = AlertTriangle
              iconColor = 'text-yellow-500'
            } else if (alert.severity === 'info') {
              borderColor = 'border-l-blue-500'
              Icon = Info
              iconColor = 'text-blue-500'
            }

            return (
              <div 
                key={alert.id}
                className={`min-w-[280px] sm:min-w-[320px] flex-1 bg-secondary/20 rounded-xl border border-border/50 border-l-4 ${borderColor} p-4 snap-start`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                  <span className="text-sm font-bold text-foreground">
                    {alert.title} — {alert.node}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {alert.message}
                </p>
                <div className="text-[10px] font-medium text-muted-foreground/60">
                  {alert.time}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
