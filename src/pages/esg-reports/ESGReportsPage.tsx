import { PageHeading } from '@/components/shared/PageHeading'
import { AuditScoreHeader } from '@/components/esg/AuditScoreHeader'
import { ReportExportCard } from '@/components/esg/ReportExportCard'
import { AuditChecklistCard } from '@/components/esg/AuditChecklistCard'
import { EmissionLogTable } from '@/components/esg/EmissionLogTable'

export function ESGReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeading
        eyebrow="PELAPORAN • ESG"
        title="Audit lebih rapi,"
        titleAccent="lebih transparan."
        description="Ringkasan kepatuhan dan jejak bukti dalam satu tempat."
        badge={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e7f3ff] text-[#086cf0] border border-[#cbe3ff]">
            Laporan contoh, belum untuk audit resmi
          </span>
        }
      />

      {/* Top summary with score ring and stats */}
      <AuditScoreHeader />

      {/* 2-column layout: Export form + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <ReportExportCard />
        <AuditChecklistCard />
      </div>

      {/* Emission log table */}
      <EmissionLogTable />
    </div>
  )
}
