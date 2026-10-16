import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Mic } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveData } from "@/hooks/useLiveData";
import { api } from "@/services/api";
export function RobotControls() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const id = params.get("robot_id");
  const robots = useLiveData<{ robots: { id: string; node_id: string }[] }>(
    user ? "/v1/robots" : null,
    60000,
  );
  const robot = robots.data?.robots.find((r) => r.id === id);
  const state = useLiveData<{ caption: string; last_seen_at: string | null }>(
    robot ? "/v1/robot/state?robot_id=" + encodeURIComponent(robot.id) : null,
    5000,
  );
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  if (!user || !robots.data?.robots.length) return null;
  return (
    <section className="live-panel">
      <h2>Layar robot</h2>
      <p>
        Pilih robot untuk membuka percakapan pada layar dada. Perintah suara
        dijalankan oleh perangkat robot.
      </p>
      <div className="live-actions">
        {robots.data.robots.map((r) => (
          <a
            className="live-button secondary"
            key={r.id}
            href={"/aerobot?robot_id=" + encodeURIComponent(r.id)}
          >
            {r.id}
          </a>
        ))}
      </div>
      {robot && (
        <>
          <p>{state.data?.caption || "Belum ada ucapan dari robot."}</p>
          <button
            disabled={busy}
            className="live-button"
            onClick={async () => {
              setBusy(true);
              try {
                await api.post("/v1/robot/listen", { robot_id: robot.id });
                setNotice(
                  "Perintah mendengarkan dikirim. Tunggu indikator mikrofon pada robot.",
                );
              } catch (e) {
                setNotice(e instanceof Error ? e.message : "Perintah gagal.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Mic size={16} />
            Mulai mendengarkan
          </button>
          <p role="status">{notice || state.error}</p>
        </>
      )}
    </section>
  );
}
