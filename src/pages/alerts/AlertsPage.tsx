import { PageHeading } from '@/components/shared/PageHeading'
import { WarningFeatureCard } from '@/components/alerts/WarningFeatureCard'
import { AlertDetailCard } from '@/components/alerts/AlertDetailCard'
import { CommunityGuidanceCard } from '@/components/alerts/CommunityGuidanceCard'
import { NotificationChannelsCard } from '@/components/alerts/NotificationChannelsCard'

export function AlertsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeading
        eyebrow="TINDAKAN CEPAT • UNTUK SEMUA"
        title="Peringatan yang"
        titleAccent="mudah dipahami."
        description="Pesan singkat, langkah jelas, dan informasi yang bisa diakses siapa saja."
        badge={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e7f3ff] text-[#086cf0] border border-[#cbe3ff]">
            Contoh alur peringatan
          </span>
        }
      />

      {/* Grid Layout: Alerts List (Left) + Guidance/Channels Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)] gap-5 items-start">
        <div className="space-y-5">
          <WarningFeatureCard />
          <AlertDetailCard />
        </div>

        <aside className="space-y-5">
          <CommunityGuidanceCard />
          <NotificationChannelsCard />
        </aside>
      </div>
    </div>
  )
}
