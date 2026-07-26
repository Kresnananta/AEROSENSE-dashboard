import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeSeriesChart } from '@/components/analytics/TimeSeriesChart'
import { StatsSummary } from '@/components/analytics/StatsSummary'
import { ComparisonChart } from '@/components/analytics/ComparisonChart'
import { CorrelationMatrix } from '@/components/analytics/CorrelationMatrix'
import { AISoftSensing } from '@/components/analytics/AISoftSensing'

export function AnalyticsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analisis mendalam, tren historis, dan AI Soft-Sensing kualitas udara
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Perbandingan</TabsTrigger>
          <TabsTrigger value="correlation">Korelasi</TabsTrigger>
          <TabsTrigger value="ai-soft-sensing" className="text-primary-600 font-medium">AI Soft-Sensing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <StatsSummary />
          <TimeSeriesChart />
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ComparisonChart />
            {/* Can add another chart here later if needed */}
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <CorrelationMatrix />
        </TabsContent>

        <TabsContent value="ai-soft-sensing" className="space-y-4">
          <AISoftSensing />
        </TabsContent>
      </Tabs>
    </div>
  )
}
