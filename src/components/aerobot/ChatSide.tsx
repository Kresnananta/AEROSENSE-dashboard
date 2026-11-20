import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Hand, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { AeroMascot, type MascotPose } from "@/components/environment/AeroMascot";
import type { LiveNode } from "@/types/live.types";
import { robotCondition } from "../../../server/api/robot-condition.mjs";

const number = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const time = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const moods = {
  calm: { pose: "calm", title: "Aku tenang", action: "Yuk, jaga udara tetap nyaman. Hindari membakar sampah." },
  warning: { pose: "watch", title: "Aku agak khawatir", action: "Jauhi sumber asap dan kurangi aktivitas berat di luar." },
  danger: { pose: "alert", title: "Aku kurang nyaman", action: "Tunda aktivitas berat di luar dan hindari area berasap." },
  unknown: { pose: "guide", title: "Aku belum tahu", action: "Pilih titik sensor untuk melihat bagaimana perasaanku." },
} satisfies Record<string, { pose: MascotPose; title: string; action: string }>;

export function ChatSide({ node, loading, refreshFailed, fixedLocation }: { node?: LiveNode; loading: boolean; refreshFailed: boolean; fixedLocation: boolean }) {
  const [greeting, setGreeting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const reading = node?.latest;
  const condition = robotCondition({ latest: reading, rules: node?.rules, pm25Validated: node?.pm25_validated });
  const band = condition?.band ?? "unknown";
  const mood = moods[band];
  const observed = reading?.observed_at ? new Date(reading.observed_at) : null;
  const subtitle = condition
    ? `${condition.metric === "pm25_ug_m3" ? "PM2.5" : "Debu sensor"} ${number.format(condition.value)} µg/m³${refreshFailed ? " · terakhir diterima" : ""}`
    : loading ? "Memuat pembacaan…" : refreshFailed ? "Data sensor belum dapat dimuat" : node ? "Belum ada pembacaan terbaru yang valid" : "Belum ada titik acuan";
  return (
    <aside className="robot-mood" data-mood={band} aria-labelledby="robot-mood-heading">
      <h2 id="robot-mood-heading">Perasaanku</h2>
      <div className="robot-mood-scene">
        <AeroMascot pose={mood.pose} greeting={greeting} />
      </div>
      <div className="robot-mood-body">
        <div className="robot-mood-reading" role="status">
          <strong>{loading && !node ? "Aku sedang mengecek" : mood.title}</strong>
          <p>{subtitle}</p>
          {node && <span className="robot-mood-location"><MapPin size={14} aria-hidden="true" />{node.name}
            {observed && Number.isFinite(observed.getTime()) && <> · <time dateTime={reading?.observed_at ?? undefined}>{time.format(observed)} WIB</time></>}
          </span>}
        </div>
        <p className="robot-mood-tip">{band === "unknown" && (node || loading || refreshFailed || fixedLocation) ? "Cek lagi saat pembacaan tersedia." : mood.action}</p>
        <div className="robot-mood-actions">
          <button type="button" className="robot-mood-greet" aria-disabled={greeting} onClick={() => {
            if (greeting) return;
            setGreeting(true);
            timer.current = setTimeout(() => setGreeting(false), 850);
          }}><Hand size={16} aria-hidden="true" />{greeting ? "Halo!" : "Sapa aku"}</button>
          {node && <Link to={`/nodes/${encodeURIComponent(node.id)}`}>Lihat sensor <ArrowUpRight size={15} aria-hidden="true" /></Link>}
        </div>
      </div>
    </aside>
  );
}
