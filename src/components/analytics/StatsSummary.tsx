import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ArrowDownToLine, ArrowUpToLine, Hash, Waves } from 'lucide-react'
import { supabase } from '@/services/supabase'

export function StatsSummary() {
  const [avgVal, setAvgVal] = useState('0')
  const [minVal, setMinVal] = useState('0')
  const [maxVal, setMaxVal] = useState('0')
  const [medianVal, setMedianVal] = useState('0')
  const [stdDevVal, setStdDevVal] = useState('±0')

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log("Mulai mengambil data dari tabel node_readings...")
        const response = await supabase.from('node_readings').select('*')
        
        console.log("RESPONS LENGKAP SUPABASE:", response)

        if (response.error) {
          console.error('Error dari Supabase:', response.error.message)
          return
        }

        const data = response.data
        if (!data || data.length === 0) {
          console.warn('Data tabel node_readings kosong!')
          return
        }

        // Ambil dan pastikan nilai pm25 diubah ke Number dengan aman
        const values = data
          .map((item: any) => {
            console.log("Item baris data:", item, "Nilai pm25:", item.pm25)
            return Number(item.pm25 ?? 0)
          })
          .filter((val) => !isNaN(val))

        console.log("Deretan angka PM2.5 yang diproses:", values)

        if (values.length > 0) {
          const sum = values.reduce((acc, val) => acc + val, 0)
          const avg = sum / values.length
          const min = Math.min(...values)
          const max = Math.max(...values)

          const sorted = [...values].sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2

          const squareDiffs = values.map((val) => Math.pow(val - avg, 2))
          const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / values.length
          const stdDev = Math.sqrt(avgSquareDiff)

          setAvgVal(avg.toFixed(1))
          setMinVal(min.toFixed(1))
          setMaxVal(max.toFixed(1))
          setMedianVal(median.toFixed(1))
          setStdDevVal(`±${stdDev.toFixed(1)}`)
        }
      } catch (err) {
        console.error('Terjadi kesalahan exception:', err)
      }
    }

    fetchStats()
  }, [])

  const stats = [
    { label: 'Rata-Rata', value: avgVal, unit: 'µg/m³', icon: Activity },
    { label: 'Nilai Min', value: minVal, unit: 'µg/m³', icon: ArrowDownToLine },
    { label: 'Nilai Max', value: maxVal, unit: 'µg/m³', icon: ArrowUpToLine },
    { label: 'Median', value: medianVal, unit: 'µg/m³', icon: Hash },
    { label: 'Std Dev', value: stdDevVal, unit: 'µg/m³', icon: Waves },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
      {stats.map((stat, i) => {
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