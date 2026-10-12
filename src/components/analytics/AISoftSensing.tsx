import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BrainCircuit, Cpu, TrendingDown, Gauge } from 'lucide-react'

const rawVsEstimatedData = [
  { time: '00:00', raw: 380, estimated: 395 },
  { time: '04:00', raw: 390, estimated: 410 },
  { time: '08:00', raw: 420, estimated: 450 },
  { time: '12:00', raw: 415, estimated: 440 },
  { time: '16:00', raw: 430, estimated: 465 },
  { time: '20:00', raw: 400, estimated: 420 },
  { time: '24:00', raw: 385, estimated: 405 },
]

const chartConfig = {
  raw: {
    label: "Sensor Mentah (eCO2)",
    color: "hsl(var(--muted-foreground))",
  },
  estimated: {
    label: "Estimasi AI (CO2e)",
    color: "hsl(var(--primary))",
  },
}

export function AISoftSensing() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tingkat Kepercayaan</CardTitle>
            <Gauge className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">94.8%</div>
            <p className="text-xs text-green-600 font-medium mt-1">Akurasi tinggi</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-Rata Koreksi</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+8.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Offset dari nilai mentah</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Model Aktif</CardTitle>
            <BrainCircuit className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">GRU-v2.1</div>
            <p className="text-xs text-muted-foreground mt-1">Dilatih: 2026-06-15</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waktu Inferensi</CardTitle>
            <Cpu className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">42 ms</div>
            <p className="text-xs text-muted-foreground mt-1">~1.2M sampel/hari</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Perbandingan Mentah vs Estimasi AI (24 Jam)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Grafik menunjukkan bagaimana model GRU mengoreksi nilai pembacaan sensor murah (eCO2) 
            untuk mendekati nilai emisi karbon aktual (CO2e).
          </p>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart data={rawVsEstimatedData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
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
                domain={['dataMin - 20', 'dataMax + 20']}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}/>
              <Line 
                type="monotone" 
                dataKey="raw" 
                stroke="var(--color-raw)" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="estimated" 
                stroke="var(--color-estimated)" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
