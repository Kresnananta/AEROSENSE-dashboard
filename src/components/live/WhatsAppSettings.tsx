import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveData } from "@/hooks/useLiveData";
import { api } from "@/services/api";
import type { LiveNode } from "@/types/live.types";
export function WhatsAppSettings() {
  const { user } = useAuth();
  const nodes = useLiveData<{ nodes: LiveNode[] }>(
    user ? "/v1/dashboard" : null,
    60000,
  );
  const subscriptions = useLiveData<{
    subscriptions: { node_id: string; phone: string }[];
  }>(user ? "/v1/subscriptions" : null, 60000);
  const [selected, setSelected] = useState("");
  const [command, setCommand] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!user || !nodes.data?.nodes.length) return null;
  const id = selected || nodes.data.nodes[0].id;
  return (
    <section className="live-panel">
      <h2>Notifikasi WhatsApp</h2>
      <p>
        Hubungkan nomor WhatsApp ke node yang ingin dipantau. Ketik BERHENTI di
        WhatsApp untuk menghentikan langganan.
      </p>
      <div className="live-actions">
        <select
          aria-label="Node untuk langganan WhatsApp"
          value={id}
          onChange={(e) => {
            setSelected(e.target.value);
            setCommand("");
          }}
        >
          {nodes.data.nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <button
          className="live-button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const p = await api.post<{ command: string }>(
                "/v1/whatsapp/pair",
                { node_id: id },
              );
              setCommand(p.command);
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Kode belum dapat dibuat.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          Buat kode penghubung
        </button>
      </div>
      {command && (
        <p className="pair-code">
          Kirim <code>{command}</code> ke nomor WhatsApp AEROSENSE. Kode berlaku
          10 menit.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {subscriptions.error && <p role="alert">{subscriptions.error}</p>}
      <ul>
        {subscriptions.data?.subscriptions.map((s) => (
          <li key={s.node_id + s.phone}>
            {s.node_id} · +{s.phone}
          </li>
        ))}
      </ul>
    </section>
  );
}
