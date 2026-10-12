import { PageHeading } from '@/components/shared/PageHeading'

export function AeroBotPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="ASISTEN UDARA • AERO-BOT"
        title="Tanya saja."
        titleAccent="Udara jadi lebih jelas."
        description="Tanyakan arti data, risiko di sekitar, atau langkah yang perlu dilakukan."
        badge={
          <span className="rounded-full bg-[#eef7ff] text-[#3883bf] border border-[#d6ebfc] text-[10px] font-bold px-3 py-1.5">
            Demo chat • Gemini API belum terhubung
          </span>
        }
      />
    </div>
  )
}
