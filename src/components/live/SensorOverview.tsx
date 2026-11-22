import { NodeStatus } from "./NodeStatus";
import { AeroMascot } from "@/components/environment/AeroMascot";
import { MonitoringSelect } from "@/components/shared/MonitoringSelect";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, ArrowRight, ChevronDown, MapPin, RefreshCw, Radio } from "@/components/ui/aero-icons";
import { useAuth } from "@/hooks/useAuth";
import { useLiveData } from "@/hooks/useLiveData";
import { useScrollEdges } from "@/hooks/useScrollEdges";
import { useDayPeriod } from "@/hooks/useDayPeriod";
import { DataState } from "@/components/shared/DataState";
import { ConditionScene } from "@/components/environment/ConditionScene";
import { sensorSummary, TEMP_STATUS_PM25_ONLY, type SensorRule } from "@/lib/environment-presentation";
import { dateLabel, metricLabels, type LiveNode } from "@/types/live.types";
import "@/styles/insights.css";

export function SensorOverview() {
  const { user, isLoading } = useAuth();
  const dayPeriod = useDayPeriod();
  const dashboard = useLiveData<{ nodes: LiveNode[] }>(
    `/v1/dashboard?account=${encodeURIComponent(user?.id || "guest")}`,
  );
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState("");
  const nodes = dashboard.data?.nodes || [];
  const { ref: nodeRail, edges: nodeEdges } = useScrollEdges(nodes.length);
  const node =
    nodes.find((n) => n.id === params.get("node_id")) ||
    nodes.find((n) => n.id === selected) ||
    nodes[0];
  const rules = useLiveData<{ rules: SensorRule[] }>(
    node ? `/v1/rules?node_id=${encodeURIComponent(node.id)}` : null,
    60000,
  );
  const summary = sensorSummary(node, rules.data?.rules || node?.rules);
  const reading = node?.latest;
  const hasReading = !!reading?.reading_id;
  const stale = hasReading && reading.stale;
  const invalid = hasReading && reading.quality?.invalid === true;
  const fresh = hasReading && !stale && !invalid;
  const lastReadingTime = reading?.observed_at || reading?.received_at;
  const pose =
    summary.tone === "danger"
      ? "alert"
      : summary.tone === "warning" || summary.tone === "pending"
        ? "watch"
        : "calm";
  const recommendation =
    summary.tone === "danger"
      ? "Tetap di dalam ruangan. Pakai masker KN95/N95 bila harus keluar."
      : summary.tone === "warning"
        ? "Kurangi aktivitas berat di luar dan pakai masker bila perlu."
        : stale || invalid
          ? "Kondisi terkini di titik ini belum diketahui."
          : !hasReading
            ? "Pembacaan pertama akan muncul saat node mulai mengirim data."
            : summary.tone === "pending"
              ? "Status belum dapat dinilai dari pembacaan ini."
              : "Kadar masih di bawah batas waspada. Tetap hindari asap dan pembakaran.";
  const heroTitle = !node
    ? "Node belum tersedia."
    : !hasReading
      ? "Belum ada pembacaan."
      : stale
        ? "Data sensor sudah lama."
        : invalid
          ? "Pembacaan tidak valid."
          : summary.tone === "calm"
            ? "Udara dalam batas baik."
            : summary.title;
  const pm25 = reading?.metrics.pm25_ug_m3;

  const showPm25 = TEMP_STATUS_PM25_ONLY ||
    (node?.pm25_validated === true && typeof pm25 === "number" && Number.isFinite(pm25));
  const keys = [showPm25 ? "pm25_ug_m3" : "dust_ug_m3", "temperature_c", "humidity_pct"];
  return (
    <section className="insights-hub sensor-overview" aria-labelledby="sensor-heading">
      <header className="insights-heading">
        <div>
          <h1 id="sensor-heading">Kondisi udara di titik sensor</h1>
        </div>
        <button
          className="live-icon-button"
          onClick={() => {
            dashboard.refresh();
            rules.refresh();
          }}
          aria-label="Perbarui pembacaan node"
        >
          <RefreshCw size={17} className={dashboard.loading ? "refreshing" : ""} />
        </button>
      </header>
      {isLoading || (dashboard.loading && !dashboard.data) ? (
        <DataState loading />
      ) : dashboard.error ? (
        <DataState error={dashboard.error} retry={dashboard.refresh} />
      ) : (
        <>
          <div className={`sensor-focus-grid${fresh ? "" : " sensor-focus-grid--unavailable"}`}>
            <article
              className={`sensor-hero tone-${summary.tone}${fresh ? "" : " sensor-hero--unavailable"}`}
              data-day-period={dayPeriod}
            >
              <div className="sensor-hero-copy">
                <span className={`insight-status ${fresh ? "" : "status-pending"}`}>
                  {summary.tone === "calm" ? "Estimasi sensor terbaru" : summary.label}
                </span>
                <h2 className="sensor-status-title">{heroTitle}</h2>
                <p className="sensor-recommendation">
                  <ArrowRight size={17} aria-hidden="true" />
                  <span>
                    {!node ? "Cek prakiraan dan estimasi wilayah." : recommendation}
                  </span>
                </p>
                {hasReading && !fresh && (
                  <div className="sensor-reading-time">
                    Pembacaan terakhir · <time dateTime={lastReadingTime || undefined}>
                      {dateLabel(lastReadingTime)}
                    </time>
                  </div>
                )}
                <div className="sensor-node-controls">
                  {nodes.length > 0 && (
                    <label className="sensor-select">
                      <MapPin size={15} aria-hidden="true" />
                      <span className="sr-only">Pilih node AEROSENSE</span>
                      <MonitoringSelect
                        label="Pilih node AEROSENSE"
                        value={node?.id || ""}
                        options={nodes.map((n) => ({ value: n.id, label: n.name }))}
                        onValueChange={(value) => {
                          setSelected(value);
                          const next = new URLSearchParams(params);
                          next.set("node_id", value);
                          setParams(next);
                        }}
                      />
                    </label>
                  )}
                  <Link
                    className="panel-link"
                    to={node ? `/nodes/${encodeURIComponent(node.id)}` : "/environment"}
                  >
                    {node ? "Lihat detail sensor" : "Lihat cuaca dan lingkungan"}
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
              {fresh && (
                <dl className="panel-metrics sensor-key-metrics">
                  {keys.map((key) => {
                    const value = reading?.metrics[key];
                    return (
                      <div key={key}>
                        <dt>{metricLabels[key][0]}</dt>
                        <dd>
                          {typeof value === "number" && Number.isFinite(value) &&
                          (key === "temperature_c" || value >= 0)
                            ? value.toLocaleString("id-ID", {
                                maximumFractionDigits: 1,
                              })
                            : "—"}
                          <small>{metricLabels[key][1]}</small>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
              {fresh && (
                <footer className="sensor-panel-footer">
                  <span>
                    <Radio size={13} aria-hidden="true" />
                    <time dateTime={lastReadingTime || undefined}>{dateLabel(lastReadingTime)}</time>
                  </span>
                </footer>
              )}
              <ConditionScene scene="sensor" />
            </article>
            <aside className={`aero-assist assist-${summary.tone}`}>
              <div className="assist-copy">
                <h2>Butuh penjelasan?</h2>
                <p>Tanyakan arti pembacaan udara dan cuaca.</p>
              </div>
              <div className="assist-visual">
                <AeroMascot pose={pose === "calm" ? "welcome" : pose} />
              </div>
              <Link to="/aerobot" className="assist-link">
                Tanya AERO-BOT <ArrowUpRight size={15} />
              </Link>
            </aside>
          </div>
          {nodes.length > 1 && (
            <div className="scroll-vignette" {...nodeEdges}>
              <div ref={nodeRail} className="node-strip" aria-label="Status perangkat">
                {nodes.map((n) => (
                  <button
                    key={n.id}
                    aria-pressed={n.id === node?.id}
                    onClick={() => {
                      setSelected(n.id);
                      const next = new URLSearchParams(params);
                      next.set("node_id", n.id);
                      setParams(next);
                    }}
                  >
                    <strong>{n.name}</strong>
                    <NodeStatus node={n} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {node?.rules && node.rules.length > 0 && (
            <details className="insight-disclosure status-method">
              <summary>
                <span>Ambang status perangkat</span>
                <ChevronDown size={17} />
              </summary>
              <div className="insight-detail-body">
                {node.rules.map((r) => (
                  <p key={r.metric}>
                    {metricLabels[r.metric]?.[0] || r.metric}: waspada ≥ {r.high} {r.unit}
                    {r.danger_high != null ? ` · bahaya ≥ ${r.danger_high} ${r.unit}` : ""}
                  </p>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </section>
  );
}
