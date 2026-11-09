import { useState, type FormEvent } from "react";
import { Droplets, Square, Radio, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLiveData } from "@/hooks/useLiveData";
import { api } from "@/services/api";
import { MonitoringSelect } from "@/components/shared/MonitoringSelect";
import "./sprinkler-control.css";
type Command = {
  id: string;
  action: "pulse" | "stop";
  state: string;
  reason?: string;
  issued_at: string;
  expires_at: string;
  trigger_band?: "warning" | "danger" | null;
};
type Actuator = {
  id: string;
  name: string;
  enabled: boolean;
  online: boolean;
  can_run: boolean;
  max_duration_ms: number;
  latitude?: number | null;
  longitude?: number | null;
  auto_metric?: string | null;
  next_run_at?: string;
  status: { output?: string; active_command_id?: string; battery_v?: number; battery_ok?: boolean };
  commands: Command[];
};
const labels: Record<string, string> = {
  queued: "Menunggu pengiriman",
  dispatching: "Mengirim ke perangkat",
  published: "Menunggu balasan ESP32",
  accepted: "Perintah berjalan",
  completed: "Selesai",
  rejected: "Ditolak perangkat",
  fault: "Dihentikan pengaman",
  expired: "Balasan belum diterima",
  cancelled: "Dibatalkan",
  stopped: "Dihentikan",
};
function SprinklerCard({ actuator: a, canManage, canRegister, nodeId, pm25, refresh }: {
  actuator: Actuator; canManage: boolean; canRegister: boolean; nodeId: string;
  pm25: boolean; refresh: () => void;
}) {
  const durations = [1, 3, 5, 10].filter((seconds) => seconds * 1000 <= a.max_duration_ms);
  const [seconds, setSeconds] = useState(String(durations.includes(3) ? 3 : durations[0])),
    [busy, setBusy] = useState(false),
    [stopping, setStopping] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [confirm, setConfirm] = useState(false),
    [pending, setPending] = useState<Command | null>(null);
  const durationMs = Number(seconds) * 1000;
  const durationSupported = durations.includes(Number(seconds));
  const latest = a.commands[0];
  const command =
    latest && (!pending || Date.parse(latest.issued_at) >= Date.parse(pending.issued_at))
      ? latest
      : pending;
  const active =
    command &&
    ["queued", "dispatching", "published", "accepted"].includes(command.state) &&
    Date.parse(command.expires_at) > Date.now();
  async function send(action: "pulse" | "stop") {
    if (action === "stop") setStopping(true);
    else setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api.post<{ command: Command }>("/v1/actuators/commands", {
        actuator_id: a.id,
        action,
        duration_ms: action === "pulse" ? durationMs : 0,
        request_id: crypto.randomUUID(),
      });
      setPending((previous) =>
        !previous || Date.parse(result.command.issued_at) >= Date.parse(previous.issued_at)
          ? result.command
          : previous,
      );
      setConfirm(false);
      setNotice("Perintah masuk antrean. Menunggu konfirmasi perangkat.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Perintah belum dapat dikirim.");
    } finally {
      if (action === "stop") setStopping(false);
      else setBusy(false);
    }
  }
  return (
    <article className="sprinkler-card">
      <div className="sprinkler-card-heading">
        <div className="sprinkler-device-icon">
          <Droplets size={24} aria-hidden="true" />
        </div>
        <div>
          <h3>{a.name}</h3>
          <p>WATERSENSE · {a.id}</p>
        </div>
        <span className={"sprinkler-connection " + (a.online ? "online" : "")}>
          <Radio size={14} aria-hidden="true" />
          {a.online ? "Terhubung" : "Offline"}
        </span>
      </div>
      <dl className="sprinkler-facts">
        <div>
          <dt>Perangkat</dt>
          <dd>{a.enabled ? "Kontrol diaktifkan" : "Belum diaktifkan admin"}</dd>
        </div>
        <div>
          <dt>Baterai</dt>
          <dd>
            {a.online && typeof a.status.battery_v === "number"
              ? `${a.status.battery_v.toFixed(1)} V`
              : "Belum tersedia"}
          </dd>
        </div>
        <div>
          <dt>Keluaran ESP32</dt>
          <dd>
            {a.online ? (a.status.output === "on" ? "Aktif" : "Mati") : "Belum terkonfirmasi"}
          </dd>
        </div>
        <div>
          <dt>Aktivasi otomatis</dt>
          <dd>{a.auto_metric && a.enabled ? (a.auto_metric === "pm25_ug_m3" ? "PM2.5" : "Debu optik") : "Nonaktif"}</dd>
        </div>
        {a.latitude != null && a.longitude != null && (
          <div>
            <dt>Posisi WATERSENSE</dt>
            <dd><Link to={`/sensor-map?node_id=${encodeURIComponent(nodeId)}&watersense=${encodeURIComponent(a.id)}`}>Lihat di peta</Link></dd>
          </div>
        )}
      </dl>
      <div className="sprinkler-command-status" role="status" aria-live="polite">
        <strong>
          {command ? labels[command.state] || command.state : a.can_run ? "Siap menerima perintah" : "Perangkat belum siap"}
        </strong>
        {command?.trigger_band && <span>Otomatis · {command.trigger_band === "danger" ? "Bahaya" : "Waspada"}</span>}
        <span>
          {!a.online
            ? "Periksa Wi-Fi dan daya WATERSENSE."
            : a.next_run_at && Date.parse(a.next_run_at) > Date.now()
              ? `Jeda operasi sampai ${new Date(a.next_run_at).toLocaleTimeString("id-ID")}.`
              : "Durasi dibatasi dan pompa berhenti otomatis."}
        </span>
      </div>
      {canManage ? (
        <>
          <label className="sprinkler-duration">
            Durasi semprot
            <MonitoringSelect
              label={"Durasi semprot " + a.name}
              value={seconds}
              onValueChange={(v) => {
                setSeconds(v);
                setConfirm(false);
              }}
              options={durations.map((value) => ({
                value: String(value),
                label: `${value} detik`,
              }))}
            />
          </label>
          <div className="sprinkler-actions">
            <button
              className="live-button"
              disabled={busy || !a.can_run || !!active || !durationSupported}
              onClick={() => setConfirm(true)}
            >
              <Droplets size={16} aria-hidden="true" />
              Aktifkan sprinkler
            </button>
            <button
              className="sprinkler-stop"
              disabled={stopping}
              onClick={() => void send("stop")}
            >
              <Square size={16} aria-hidden="true" />
              Hentikan
            </button>
          </div>
          {confirm && (
            <div className="sprinkler-confirm">
              <p>
                Semprot dengan <strong>{a.name}</strong> selama <strong>{seconds} detik</strong>?
              </p>
              <div>
                <button
                  className="live-button"
                  disabled={busy || !a.can_run || !durationSupported}
                  onClick={() => void send("pulse")}
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : null}Ya, mulai semprot
                </button>
                <button
                  className="live-button secondary"
                  disabled={busy}
                  onClick={() => setConfirm(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="sprinkler-readonly">
          Kontrol memerlukan penugasan admin atau pengelola pada lokasi ini.
        </p>
      )}
      {notice && (
        <p className="sprinkler-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="threshold-error" role="alert">
          {error}
        </p>
      )}
      {canRegister && (
        <SprinklerSettings nodeId={nodeId} actuator={a} pm25={pm25} refresh={refresh} />
      )}
    </article>
  );
}

function SprinklerSettings({ nodeId, actuator, pm25, refresh }: {
  nodeId: string; actuator?: Actuator; pm25: boolean; refresh: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const coordinate = (key: string) => {
      const value = String(form.get(key) || "").trim().replace(",", ".");
      return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : null;
    };
    const values = {
      id: actuator?.id || form.get("id"), node_id: nodeId, name: form.get("name"),
      latitude: coordinate("latitude"), longitude: coordinate("longitude"),
      enabled: form.has("enabled"), auto_metric: form.get("auto_metric") || null,
    };
    if (values.enabled && values.auto_metric &&
        (!actuator?.enabled || values.auto_metric !== actuator.auto_metric) &&
        !window.confirm("Aktifkan semprotan otomatis saat ambang lokasi terpenuhi?")) return;
    setBusy(true);
    setMessage("");
    try {
      if (actuator) await api.patch("/v1/actuators", values);
      else await api.post("/v1/actuators", values);
      setMessage("Pengaturan tersimpan.");
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pengaturan belum tersimpan.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="sprinkler-settings">
      <summary>{actuator ? "Pengaturan WATERSENSE" : "Tambah WATERSENSE"}</summary>
      <form onSubmit={(event) => void save(event)}>
        {!actuator && <label>ID perangkat<input name="id" required maxLength={40} pattern="[a-z0-9\-]+" placeholder="mist-02" /></label>}
        <label>Nama perangkat<input name="name" required maxLength={80} defaultValue={actuator?.name} /></label>
        <label>Latitude<input name="latitude" inputMode="decimal" required defaultValue={actuator?.latitude ?? ""} /></label>
        <label>Longitude<input name="longitude" inputMode="decimal" required defaultValue={actuator?.longitude ?? ""} /></label>
        {actuator && (
          <>
            <label>Aktivasi otomatis
              <select name="auto_metric" defaultValue={actuator.auto_metric ?? ""}>
                <option value="">Nonaktif</option>
                <option value="dust_ug_m3">Ambang debu optik</option>
                {pm25 && <option value="pm25_ug_m3">Ambang PM2.5 tervalidasi</option>}
              </select>
            </label>
            <label className="sprinkler-settings-switch"><input name="enabled" type="checkbox" defaultChecked={actuator.enabled} /> Izinkan kendali perangkat</label>
          </>
        )}
        <div className="sprinkler-actions">
          <button className="live-button" disabled={busy}>{busy ? "Menyimpan…" : "Simpan WATERSENSE"}</button>
          {message && <span role="status">{message}</span>}
        </div>
      </form>
    </details>
  );
}
export function SprinklerControl({ nodeId }: { nodeId: string }) {
  const data = useLiveData<{ actuators: Actuator[]; can_manage: boolean; can_register: boolean; pm25_validated: boolean }>(
    `/v1/actuators?node_id=${encodeURIComponent(nodeId)}`,
    2000,
  );
  return (
    <section className="sprinkler-section" aria-labelledby="sprinkler-heading">
      <header>
        <div>
          <h2 id="sprinkler-heading">Kendali sprinkler</h2>
          <p>Aktifkan WATERSENSE pada area yang menjadi tanggung jawab Anda.</p>
        </div>
        <Droplets size={26} aria-hidden="true" />
      </header>
      {data.loading && !data.data ? (
        <p role="status">Memeriksa perangkat…</p>
      ) : data.error ? (
        <div role="alert">
          <p>{data.error}</p>
          <button className="live-button secondary" onClick={data.refresh}>
            Coba kembali
          </button>
        </div>
      ) : !data.data?.actuators.length ? (
        <div className="sprinkler-empty">
          <Droplets size={24} aria-hidden="true" />
          <div>
            <h3>Belum ada sprinkler di titik ini</h3>
            <p>
              Admin dapat mendaftarkan WATERSENSE pada lokasi yang dilayani. Tidak semua titik
              sensor memerlukan sprinkler.
            </p>
          </div>
        </div>
      ) : (
        <div className="sprinkler-list">
          {data.data.actuators.map((a) => (
            <SprinklerCard key={a.id} actuator={a} canManage={data.data!.can_manage}
              canRegister={data.data!.can_register} nodeId={nodeId} pm25={data.data!.pm25_validated} refresh={data.refresh} />
          ))}
        </div>
      )}
      {data.data?.can_register && (
        <SprinklerSettings nodeId={nodeId} pm25={data.data.pm25_validated} refresh={data.refresh} />
      )}
    </section>
  );
}
