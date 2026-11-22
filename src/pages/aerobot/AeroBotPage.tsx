import { PageHeading } from "@/components/shared/PageHeading";
import { ChatPanel } from "@/components/aerobot/ChatPanel";
import { WhatsAppEntry } from "@/components/live/WhatsAppEntry";
import { useAuth } from "@/hooks/useAuth";
export function AeroBotPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-5">
      <PageHeading title="Tanya AERO-BOT" actions={user && <WhatsAppEntry />} />
      <ChatPanel />
    </div>
  );
}
