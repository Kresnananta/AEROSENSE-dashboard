import { PageHeading } from '@/components/shared/PageHeading'
import { ModelStatTiles } from '@/components/analytics/ModelStatTiles'
import { RawVsEstimateChart } from '@/components/analytics/RawVsEstimateChart'
import { MethodStepsCard } from '@/components/analytics/MethodStepsCard'

export function AnalyticsPage() {
  return (
    <div className="space-y-4">
      {/* Page Heading */}
      <PageHeading
        eyebrow="ANALITIK • EDGE AI"
        title="Data yang bisa"
        titleAccent="Anda percaya."
        description="Bandingkan pembacaan sensor mentah dengan estimasi setelah koreksi AI."
        badge={
          <span className="rounded-full bg-[#eef7ff] text-[#3883bf] border border-[#d6ebfc] text-[10px] font-bold px-3 py-1.5 whitespace-nowrap">
            Visualisasi data contoh
          </span>
        }
      />

      {/* 4 Performance Metric Tiles */}
      <ModelStatTiles />

      {/* 2-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.9fr)] gap-4 items-stretch">
        <RawVsEstimateChart />
        <MethodStepsCard />
      </div>
    </div>
  )
}
