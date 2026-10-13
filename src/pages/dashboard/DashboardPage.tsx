import { PageHeading } from '@/components/shared/PageHeading'
import { AqiHeroCard } from '@/components/dashboard/AqiHeroCard'
import { OverviewMetrics } from '@/components/dashboard/OverviewMetrics'
import { MiniMap } from '@/components/dashboard/MiniMap'
import { GreetingCard } from '@/components/dashboard/GreetingCard'
import { RecentAlertsCard } from '@/components/dashboard/RecentAlertsCard'
import { BotTeaser } from '@/components/dashboard/BotTeaser'

export function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* Page Heading */}
      <PageHeading
        eyebrow="RABU, 30 SEPTEMBER 2026 • PEMANTAUAN KAWASAN"
        title="Selamat pagi!"
        titleAccent="Bagaimana udara hari ini?"
        description="Ringkasan kawasan Gresik untuk memulai hari dengan lebih tenang."
        badge={
          <span className="flex items-center gap-2 text-[10px] font-bold text-[#7991aa] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#38c692] shadow-[0_0_0_3px_#d8fae9]" />
            Simulasi • diperbarui 09.41 WIB
          </span>
        }
      />

      {/* Main Grid: Responsive 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_284px] gap-5 items-start">
        {/* Left / Main Column */}
        <div className="space-y-4 sm:space-y-5 min-w-0">
          <AqiHeroCard />
          <OverviewMetrics />
          <MiniMap />
        </div>

        {/* Right Column / Sidebar info */}
        <aside className="space-y-4 sm:space-y-4.5 min-w-0">
          <GreetingCard />
          <RecentAlertsCard />
          <BotTeaser />
        </aside>
      </div>
    </div>
  )
}
