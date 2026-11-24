import { ChevronDown } from "@/components/ui/aero-icons";
import { NearbyAlerts } from "@/components/live/NearbyAlerts";
import { WhatsAppSettings } from "@/components/live/WhatsAppSettings";
import { useAuth } from "@/hooks/useAuth";
import { WhatsAppEntry } from "@/components/live/WhatsAppEntry";
export function AlertsPage() {
  const { user } = useAuth();
  return (
    <div className="app-section-stack">
      <NearbyAlerts />
      <section className="wa-alert-entry" aria-labelledby="alert-whatsapp-title">
        <div className="wa-alert-header">
          <div>
            <h2 id="alert-whatsapp-title">Peringatan lewat WhatsApp</h2>
            <p>Terima peringatan sensor atau tanya AERO-BOT.</p>
          </div>
          <WhatsAppEntry />
        </div>
        {user && (
          <details className="insight-disclosure wa-subscription">
            <summary>
              <span>Atur langganan WhatsApp</span>
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            <WhatsAppSettings embedded />
          </details>
        )}
      </section>
    </div>
  );
}
