import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { time: '00:00', value: 25 },
  { time: '02:00', value: 28 },
  { time: '04:00', value: 35 },
  { time: '06:00', value: 45 },
  { time: '08:00', value: 85 },
  { time: '10:00', value: 92 },
  { time: '12:00', value: 65 },
  { time: '14:00', value: 55 },
  { time: '16:00', value: 58 },
  { time: '18:00', value: 72 },
  { time: '20:00', value: 48 },
  { time: '22:00', value: 38 },
  { time: '24:00', value: 32 },
]

const chartConfig = {
  value: {
    label: "Nilai",
    color: "hsl(var(--primary))",
  },
}

export function TimeSeriesChart() {
  const [metric, setMetric] = useState('pm25')
  const [timeRange, setTimeRange] = useState('24h')

  return (
    <Card className="flex flex-col border-border/50 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4 space-y-0">
        <div>
          <CardTitle className="text-lg font-bold text-foreground">
            Analisis Deret Waktu
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Tren pengukuran dari waktu ke waktu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Pilih Metrik" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="pm25">PM2.5</SelectItem>
              <SelectItem value="tvoc">TVOC</SelectItem>
              <SelectItem value="eco2">eCO₂</SelectItem>
              <SelectItem value="temp">Suhu</SelectItem>
              <SelectItem value="humidity">Kelembapan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Pilih Waktu" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="24h">24 Jam</SelectItem>
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[350px] p-4 pt-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTimeSeries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTimeSeries)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
