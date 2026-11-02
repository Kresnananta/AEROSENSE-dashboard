import { PageHeading } from "@/components/shared/PageHeading";
import { ChatPanel } from "@/components/aerobot/ChatPanel";
import { ChatSide } from "@/components/aerobot/ChatSide";
import { RobotControls } from "@/components/aerobot/RobotControls";
import { WhatsAppEntry } from "@/components/live/WhatsAppEntry";
import { Link } from 'react-router-dom';
export function AeroBotPage() {
  return (
    <div className="space-y-5">
      <PageHeading
        title="Tanya AERO-BOT"
        actions={<><Link to="/robot-face" target="_blank" rel="noopener" className="live-button secondary">Layar wajah</Link><WhatsAppEntry /></>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)] gap-5 items-start">
        <ChatPanel />
        <aside className="space-y-5">
          <ChatSide />
          <RobotControls />
        </aside>
      </div>
    </div>
  );
}
