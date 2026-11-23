import { PageHeading } from "@/components/shared/PageHeading";
import { ChatPanel } from "@/components/aerobot/ChatPanel";
import { WhatsAppEntry } from "@/components/live/WhatsAppEntry";
export function AeroBotPage() {
  return (
    <div className="space-y-5">
      <PageHeading title="Tanya AERO-BOT" actions={<WhatsAppEntry />} />
      <ChatPanel />
    </div>
  );
}
