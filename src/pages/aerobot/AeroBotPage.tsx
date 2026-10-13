import { PageHeading } from '@/components/shared/PageHeading'
import { ChatPanel } from '@/components/aerobot/ChatPanel'
import { ChatSide } from '@/components/aerobot/ChatSide'

export function AeroBotPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeading
        eyebrow="ASISTEN UDARA • AERO-BOT"
        title="Tanya saja."
        titleAccent="Udara jadi lebih jelas."
        description="Tanyakan arti data, risiko di sekitar, atau langkah yang perlu dilakukan."
        badge={
          <span className="inline-flex items-center rounded-full bg-[#eef7ff] dark:bg-sky-950/60 text-[#3883bf] dark:text-sky-300 border border-[#d6ebfc] dark:border-sky-800 text-[10px] font-bold px-3 py-1.5">
            Demo chat • Gemini API belum terhubung
          </span>
        }
      />

      {/* Grid: Interactive Chat Panel (Left) + Companion Intro & Boundaries (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)] gap-5 items-start">
        <ChatPanel />
        <ChatSide />
      </div>
    </div>
  )
}
