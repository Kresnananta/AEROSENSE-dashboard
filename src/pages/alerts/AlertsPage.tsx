import { SensorWorkspace } from "@/components/live/SensorWorkspace";
import { WhatsAppSettings } from "@/components/live/WhatsAppSettings";
export function AlertsPage() {
  return (
    <div className="space-y-6">
      <SensorWorkspace mode="alerts" />
      <WhatsAppSettings />
    </div>
  );
}
