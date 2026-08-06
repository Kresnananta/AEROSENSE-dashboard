import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { supabase } from '@/services/supabase'

const chartConfig = {
  pm25: {
    label: "PM2.5",
    color: "hsl(var(--primary))",
  },
}

export function TrendChart() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const { data, error } = await supabase
          .from('node_readings')
          .select('timestamp, pm25')
          .order('timestamp', { ascending: true })
          .limit(timeRange === '24h' ? 24 : 7)

        if (error) throw error

        if (data && data.length > 0) {
          const formatted = data.map((item) => {
            const date = new Date(item.timestamp)
            const timeString = timeRange === '24h' 
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleDateString('id-ID', { weekday: 'short' })
            return {
              time: timeString,
              pm25: Number(item.pm25)
            }
          })
          setChartData(formatted)
        } else {
          setChartData([])
        }
      } catch (err) {
        console.error('Gagal memuat tren data:', err)
      }
    }

    fetchTrendData()
  }, [timeRange])

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
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}