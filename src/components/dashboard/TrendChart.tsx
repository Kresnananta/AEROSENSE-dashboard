import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Dummy data for 24 hours
const hourlyData = [
  { time: '00:00', pm25: 18 },
  { time: '04:00', pm25: 22 },
  { time: '08:00', pm25: 35 },
  { time: '12:00', pm25: 28 },
  { time: '16:00', pm25: 42 },
  { time: '20:00', pm25: 30 },
  { time: '24:00', pm25: 24 },
]

// Dummy data for 7 days
const dailyData = [
  { time: 'Sen', pm25: 25 },
  { time: 'Sel', pm25: 32 },
  { time: 'Rab', pm25: 28 },
  { time: 'Kam', pm25: 45 },
  { time: 'Jum', pm25: 35 },
  { time: 'Sab', pm25: 22 },
  { time: 'Min', pm25: 18 },
]

const chartConfig = {
  pm25: {
    label: "PM2.5",
    color: "hsl(var(--primary))",
  },
}

export function TrendChart() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h')
  const data = timeRange === '24h' ? hourlyData : dailyData

  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm col-span-full md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold text-foreground">
          Tren PM2.5 — {timeRange === '24h' ? '24 Jam Terakhir' : '7 Hari Terakhir'}
        </CardTitle>
        <div className="flex bg-secondary/50 rounded-full p-1">
          <button 
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              timeRange === '24h' ? 'bg-primary-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            24 Jam
          </button>
          <button 
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              timeRange === '7d' ? 'bg-primary-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7 Hari
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px] p-4 pt-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-pm25)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-pm25)" stopOpacity={0} />
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
              dataKey="pm25"
              stroke="var(--color-pm25)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPm25)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
