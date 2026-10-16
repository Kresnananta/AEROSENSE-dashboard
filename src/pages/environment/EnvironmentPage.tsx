import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CloudSun,
  Wind,
  Sprout,
  Flame,
  Waves,
  Leaf,
  Activity,
  RefreshCw,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { DataState } from "@/components/shared/DataState";
import { dateLabel, type EnvironmentResponse } from "@/types/live.types";

const categories = [
  { id: "weather", label: "Cuaca", icon: CloudSun },
  { id: "air_quality", label: "Udara", icon: Wind },
  { id: "soil", label: "Tanah", icon: Sprout },
  { id: "fire", label: "Titik panas", icon: Flame },
  { id: "flood", label: "Sungai", icon: Waves },
  { id: "earthquake", label: "Gempa", icon: Activity },
  { id: "biodiversity", label: "Hayati", icon: Leaf },
];
export function EnvironmentPage({ compact = false }: { compact?: boolean }) {
  const { data, error, loading, refresh } = useLiveData<EnvironmentResponse>(
    "/v1/environment",
    60000,
    false,
  );
  const [category, setCategory] = useState("weather");
  const facts = data?.providers.flatMap((p) => p.facts) || [];
  const selected = facts.filter(
    (f) =>
      f.category === category ||
      (category === "soil" && f.category === "soil_profile"),
  );
  return (
    <section className="environment-hub">
      <header className="live-heading">
        <div>
          <h1>
            {compact ? "Lingkungan sekitar" : "Hub lingkungan"}{" "}
            <span>Surabaya</span>
          </h1>
          <p>
            Cuaca, udara, tanah, dan informasi lingkungan dalam satu tempat.
          </p>
        </div>
        <div className="live-actions">
          {compact && (
            <Link className="live-button secondary" to="/environment">
              Lihat semua <ArrowUpRight size={15} />
            </Link>
          )}
          <button
            className="live-icon-button"
            onClick={refresh}
            aria-label="Perbarui informasi lingkungan"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </header>
      {data && (
        <div className="hub-location">
          <MapPin size={16} />
          <span>
            <strong>{data.area.name}</strong> · {data.area.latitude},{" "}
            {data.area.longitude}
          </span>
          <small>Acuan wilayah kota</small>
        </div>
      )}
      <div
        className="hub-tabs"
        role="group"
        aria-label="Jenis informasi lingkungan"
      >
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            <c.icon size={17} />
            {c.label}
          </button>
        ))}
      </div>
      {loading && !data ? (
        <DataState loading />
      ) : error && !data ? (
        <DataState error={error} retry={refresh} />
      ) : (
        <>
          {error && (
            <p className="live-notice" role="alert">
              Pembaruan gagal. Informasi sebelumnya masih ditampilkan.
            </p>
          )}
          {!selected.length ? (
            <DataState empty="Belum ada informasi untuk kategori ini." />
          ) : (
            <div className="hub-facts">
              {selected.slice(0, compact ? 4 : 30).map((f) => (
                <article className="hub-fact" key={f.id}>
                  <div className="hub-fact-label">
                    {f.label}
                    {f.stale && (
                      <span className="live-tag warning">Data lama</span>
                    )}
                  </div>
                  <p className="hub-value">
                    {typeof f.value === "number"
                      ? f.value.toLocaleString("id-ID", {
                          maximumFractionDigits: 2,
                        })
                      : f.value}{" "}
                    <small>{f.unit}</small>
                  </p>
                  <p className="hub-time">
                    {dateLabel(f.valid_at)} ·{" "}
                    {f.kind === "forecast"
                      ? "Prakiraan"
                      : f.kind === "model" || f.kind === "static_model"
                        ? "Estimasi model"
                        : "Catatan sumber"}
                  </p>
                  <a
                    href={
                      /^https:\/\//.test(f.source_url)
                        ? f.source_url
                        : undefined
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {f.source} <ArrowUpRight size={13} />
                  </a>
                  {!compact && (
                    <p className="hub-spatial">{f.spatial_context}</p>
                  )}
                </article>
              ))}
            </div>
          )}
          {!compact && (
            <details className="hub-providers">
              <summary>Status sumber data</summary>
              <ul>
                {data?.providers.map((p) => (
                  <li key={p.provider}>
                    <strong>{p.provider.replace(/_/g, " ")}</strong>
                    <span>
                      {p.last_error ||
                        (p.facts.length
                          ? `${p.facts.length} informasi tersimpan`
                          : "Belum ada informasi yang sesuai area")}
                    </span>
                    <small>{dateLabel(p.last_attempt_at)}</small>
                  </li>
                ))}
              </ul>
              <p>
                IQAir memerlukan key, BMKG cuaca memerlukan kode kelurahan, dan
                REST SoilGrids sedang tidak tersedia. Sumber yang belum
                dikonfigurasi dapat belum muncul.
              </p>
            </details>
          )}
          <p className="hub-footnote">
            Data publik melengkapi pembacaan sensor AEROSENSE. Lokasi sensor
            mengikuti titik asli node. Titik panas tidak selalu berarti
            kebakaran; debit sungai bukan konfirmasi banjir. Sumber: Open-Meteo
            dan CAMS, BMKG, NASA FIRMS, GBIF, serta IQAir jika diaktifkan.
          </p>
          {!compact && (
            <Link
              className="live-button"
              to="/aerobot?question=Bagaimana%20kondisi%20lingkungan%20Surabaya%20dari%20data%20publik%20terbaru%3F"
            >
              Tanyakan kondisi ini ke AERO-BOT <ArrowUpRight size={16} />
            </Link>
          )}
        </>
      )}
    </section>
  );
}
