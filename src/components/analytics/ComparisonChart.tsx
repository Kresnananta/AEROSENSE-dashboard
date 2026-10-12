import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'PM2.5', node1: 18, node2: 35 },
  { name: 'TVOC', node1: 142, node2: 280 },
  { name: 'eCO2', node1: 410, node2: 500 },
  { name: 'Suhu', node1: 29, node2: 30 },
  { name: 'Lembap', node1: 68, node2: 65 },
]

const chartConfig = {
  node1: {
    label: "Node Pabrik 01",
    color: "hsl(var(--primary))",
  },
  node2: {
    label: "Node Kawasan Berikat",
    color: "hsl(var(--destructive))",
  },
}

export function ComparisonChart() {
  const [nodeA, setNodeA] = useState('n1')
  const [nodeB, setNodeB] = useState('n2')

  return (
    <Card className="flex flex-col border-border/50 shadow-sm h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-sm font-bold text-foreground">
            Perbandingan Antar Node
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={nodeA} onValueChange={setNodeA}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Node A" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="n1">Node Pabrik 01</SelectItem>
                <SelectItem value="n3">Node Sidomoro 01</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-xs font-medium">VS</span>
            <Select value={nodeB} onValueChange={setNodeB}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Node B" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="n2">Node Kawasan Berikat</SelectItem>
                <SelectItem value="n4">Node Gudang 02</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
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
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}/>
            <Bar dataKey="node1" fill="var(--color-node1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="node2" fill="var(--color-node2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
