import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CloudLightning,
  CloudRainWind,
  CloudSnow,
  ChevronRight,
  Droplets,
  Map as MapIcon,
  Sun,
  Thermometer,
  Tornado,
  Umbrella,
  Waves,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { useScrollEdges } from "@/hooks/useScrollEdges";
import { useDayPeriod } from "@/hooks/useDayPeriod";
import { conditionArtUrl } from "@/lib/condition-art";
import { formatQuakeRegion } from "@/lib/environment-presentation";
import {
  dayPeriodFromHour,
  dayPeriodLabel,
  weatherSceneForPeriod,
  wibHour,
  type DayPeriod,
} from "@/lib/time-of-day";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { WeatherOutlook as Outlook, Hazards, WeatherDay, WeatherHour } from "@/types/weather.types";
import "@/styles/weather.css";

function weatherPeriod(weather: WeatherDay | WeatherHour | Outlook["current"], fallback: DayPeriod): DayPeriod {
  const period = "time" in weather ? dayPeriodFromHour(wibHour(weather.time)) : fallback;
  const isDay = "is_day" in weather ? weather.is_day : null;
  if (isDay === false) return "night";
  return isDay === true && period === "night" ? "day" : period;
}

const cardArtScale: Record<string, number> = {
  sunny: 1.21,
  "sunny-night": 0.81,
  "warm-night": 0.88,
  cloudy: 0.91,
  "cloudy-night": 0.87,
  "drizzle-night": 0.83,
  "light-rain": 1.04,
  "light-rain-night": 0.83,
  "steady-rain": 0.93,
  "rain-night": 0.83,
  storm: 0.84,
  "storm-night": 0.83,
  fog: 0.8,
  "fog-night": 0.83,
};

function WeatherArt({
  weather,
  size,
  period = "day",
  card = false,
}: {
  weather: WeatherDay | WeatherHour | Outlook["current"];
  size: number;
  period?: DayPeriod;
  card?: boolean;
}) {
  const { icon, code } = weather;
  if (code != null && [71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow className="wx-art wx-snow" width={size} height={size} aria-hidden="true" />;
  }
  const resolvedPeriod = weatherPeriod(weather, period);
  const isDay = "is_day" in weather ? weather.is_day : null;
  const scene = weatherSceneForPeriod({ icon, code, period: resolvedPeriod, isDay });
  return (
    <img
      className="wx-art"
      style={card ? { scale: cardArtScale[scene] ?? 1 } : undefined}
      src={conditionArtUrl(scene)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}
const ALERT_ICON: Record<string, LucideIcon> = {
  thunder: CloudLightning,
  heavy_rain: CloudRainWind,
  wind: Wind,
  heat: Thermometer,
  uv: Sun,
};
const num = (v: number | null | undefined) =>
  v == null ? "–" : String(Math.round(v * 10) / 10).replace(".", ",");
const unit = (value: number | null, suffix: string) => value == null ? "–" : num(value) + suffix;
const clock = (time: string) => time.slice(11, 16).replace(":", ".");
const dateLabel = (date: string) =>
  new Date(date.slice(0, 10) + "T12:00:00+07:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta",
  });
const isWet = (h: WeatherHour) => ["drizzle", "rain", "heavy-rain", "thunder"].includes(h.icon);
const dayName = (date: string, i: number) =>
  i === 0
    ? "Hari ini"
    : i === 1
      ? "Besok"
      : new Date(date + "T12:00:00+07:00").toLocaleDateString("id-ID", {
          weekday: "short",
          timeZone: "Asia/Jakarta",
        });
const uvLabel = (uv: number | null) =>
  uv == null ? "" : uv >= 11 ? "ekstrem" : uv >= 8 ? "sangat tinggi" : uv >= 6 ? "tinggi" : uv >= 3 ? "sedang" : "rendah";

function todayTip(d: { rain_chance: number | null; uv: number | null; max: number | null }) {
  if ((d.rain_chance ?? 0) >= 50) return "Siapkan payung atau jas hujan.";
  if ((d.uv ?? 0) >= 8) return "Pakai topi dan tabir surya saat siang.";
  if ((d.max ?? 0) >= 34) return "Minum air putih lebih sering.";
  return "";
}

export function WeatherOutlook({
  point,
  place,
  compact = false,
}: {
  point?: { latitude: number; longitude: number };
  place?: string;
  compact?: boolean;
}) {
  const path = point
    ? `/v1/weather?lat=${point.latitude.toFixed(3)}&lng=${point.longitude.toFixed(3)}`
    : null;
  const wx = useLiveData<Outlook>(path, 900000, false);
  const hz = useLiveData<Hazards>(compact ? null : "/v1/hazards", 600000, false);
  const dayPeriod = useDayPeriod();
  const [selection, setSelection] = useState<{ path: string | null; time: string } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const o = wx.data;
  const { ref: dailyRail, edges: dailyEdges } = useScrollEdges(o?.daily.length ?? 0);
  if (!point) return null;
  const today = o?.daily[0];

  const allHours = (o?.day_hours ?? o?.hourly ?? []).slice(1);
  const hours = allHours.slice(0, compact ? 12 : 24);
  const selectedTime = selection?.path === path ? selection.time : null;
  const detailHour = allHours.find((h) => h.time === selectedTime);
  const detailDay = o?.daily.find((d) => d.date === selectedTime);
  const detail = detailHour || detailDay;
  const tip = today ? todayTip(today) : "";
  const firstWet = allHours.slice(0, 24).find(isWet);
  const firstWetDay = firstWet?.time.slice(0, 10);
  const openDetail = (time: string, button: HTMLButtonElement) => {
    trigger.current = button;
    setSelection({ path, time });
  };
  return (
    <section
      id="cuaca"
      className={`disaster-section weather-outlook ${compact ? "is-compact" : ""}`}
      aria-labelledby="wx-title"
    >
      <header className="disaster-heading">
        <div>
          <h2 id="wx-title">Prakiraan cuaca</h2>
          <p>
            {place ? `Sekitar ${place}` : "Sekitar lokasi acuan"} · model Open-Meteo
            {o?.valid_at
              ? ` · ${new Date(o.valid_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB`
              : ""}
          </p>
        </div>
        <Link
          className="insight-text-link"
          to={
            compact
              ? "/environment#cuaca"
              : `/aerobot?question=${encodeURIComponent(`Bagaimana prakiraan cuaca dan peluang hujan ${place ? "di sekitar " + place : "di sekitarku"} hari ini dan besok? Apa yang perlu saya siapkan?`)}`
          }
        >
          {compact ? "Prakiraan lengkap" : "Tanya AERO-BOT"} <ArrowUpRight size={15} />
        </Link>
      </header>
      {wx.error && !o && <p className="live-notice">{wx.error} <button type="button" onClick={wx.refresh}>Coba lagi</button></p>}
      {!o && !wx.error && <div className="wx-skeleton" role="status" aria-label="Memuat prakiraan cuaca" />}
      {o && !today && <p className="live-notice">Prakiraan harian belum tersedia.</p>}
      {o && today && (
        <div className="wx-body">
          <article className={`wx-today tone-${o.current?.icon || today.icon}`} data-day-period={weatherPeriod(o.current ?? today, dayPeriod)}>
            <WeatherArt weather={o.current ?? today} period={dayPeriod} size={compact ? 116 : 148} />
            <div className="wx-today-copy">
              <p className="wx-dateline">
                Hari ini · {dayPeriodLabel(dayPeriod)}
                {o.current?.temperature != null && <> · Saat ini {unit(o.current.temperature, "°")}</>}
              </p>
              <h3>{o.current?.label || today.label}</h3>
              <p className="wx-today-range">
                <strong>{unit(today.max, "°")}</strong> / {unit(today.min, "°")}
              </p>
              {firstWet && (
                <p className="wx-next-rain">
                  <Umbrella size={17} aria-hidden="true" />
                  <span>
                    {firstWet.label} diprakirakan mulai{" "}
                    <strong>
                      {firstWetDay !== today.date && `${firstWetDay === o.daily[1]?.date ? "besok" : dateLabel(firstWet.time)}, `}
                      pukul {clock(firstWet.time)} WIB
                    </strong>
                    {firstWet.rain_chance != null && <> · peluang {unit(firstWet.rain_chance, "%")}</>}
                  </span>
                </p>
              )}
              {tip && <p className="wx-today-tip">{tip}</p>}
              <button type="button" className="wx-today-link" aria-haspopup="dialog" onClick={(e) => openDetail(today.date, e.currentTarget)}>
                Rincian hari ini <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
            <dl className="wx-today-stats">
              <div>
                <dt>
                  <Umbrella size={15} aria-hidden="true" /> Peluang hujan tertinggi
                </dt>
                <dd>{unit(today.rain_chance, "%")}</dd>
              </div>
              <div>
                <dt>
                  <Droplets size={15} aria-hidden="true" /> Curah hujan
                </dt>
                <dd>{unit(today.rain, " mm")}</dd>
              </div>
              <div>
                <dt>
                  <Sun size={15} aria-hidden="true" /> UV tertinggi
                </dt>
                <dd>
                  {num(today.uv)} <small>{uvLabel(today.uv)}</small>
                </dd>
              </div>
              {!compact && (
                <div>
                  <dt>
                    <Wind size={15} aria-hidden="true" /> Hembusan angin tertinggi
                  </dt>
                  <dd>{num(today.gust)} km/jam</dd>
                </div>
              )}
            </dl>
          </article>
          {o.alerts.length > 0 && (
            <ul className="wx-alerts" aria-label="Peringatan cuaca 24 jam">
              {o.alerts.slice(0, compact ? 2 : 5).map((a) => {
                const Icon = ALERT_ICON[a.type] || CloudLightning;
                return (
                  <li key={a.type} className={`is-${a.level}`}>
                    <Icon className="wx-alert-icon" size={18} aria-hidden="true" />
                    <div>
                      <strong>{a.title}</strong>
                      <p>{a.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="wx-panel">
              <div className="wx-panel-heading">
                <h3>{compact ? "12 jam ke depan" : "24 jam ke depan"}</h3>
                <span>Waktu WIB</span>
              </div>
            <HourCards hours={hours} onSelect={openDetail} />
          </div>
          {!compact && (
            <div className="wx-panel">
              <h3>7 hari ke depan</h3>
              <div className="scroll-vignette" {...dailyEdges}>
                <ol ref={dailyRail} className="wx-days" aria-label="Prakiraan tujuh hari">
                  {o.daily.map((d, i) => (
                    <li key={d.date}>
                      <button type="button" className={`wx-card tone-${d.icon}`}
                        data-day-period="day" aria-haspopup="dialog" aria-label={`Rincian ${dayName(d.date, i)}, ${d.label}`} onClick={(e) => openDetail(d.date, e.currentTarget)}>
                        <span className="wx-day-name">{dayName(d.date, i)}</span>
                        <WeatherArt weather={d} size={208} card />
                        <span className="wx-day-label">{d.label}</span>
                        <span className="wx-day-temp">
                          <strong>{unit(d.max, "°")}</strong> {unit(d.min, "°")}
                        </span>
                        <span className={`wx-chip ${(d.rain_chance ?? 0) >= 50 ? "is-wet" : ""}`}>
                          <Droplets size={12} aria-hidden="true" /> {unit(d.rain_chance, "%")}
                        </span>
                        <ChevronRight size={13} className="wx-card-arrow" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          {!compact && <HazardList hazards={hz.data} />}
        </div>
      )}
      <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setSelection(null); }}>
        {detail && (
          <DialogContent className="wx-detail" showCloseButton={false} onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}>
            <DialogClose className="wx-close" aria-label="Tutup rincian"><X size={20} /></DialogClose>
            <div className={`wx-detail-head tone-${detail.icon}`}>
              <WeatherArt weather={detail} size={96} />
              <div>
                <DialogDescription>
                  {dateLabel(selectedTime!)}
                  {detailHour && ` · ${clock(detailHour.time)} WIB`}
                </DialogDescription>
                <DialogTitle>{detail.label}</DialogTitle>
              </div>
            </div>
            <dl className="wx-detail-stats">
              <div><dt>Suhu</dt><dd>{detailHour ? unit(detailHour.temperature, " °C") : `${unit(detailDay!.min, "°")} – ${unit(detailDay!.max, "°")}`}</dd></div>
              <div><dt>{detailDay ? "Peluang hujan tertinggi" : "Peluang hujan"}</dt><dd>{unit(detail.rain_chance, "%")}</dd></div>
              <div><dt>{detailDay ? "Total curah hujan" : "Curah hujan satu jam terakhir"}</dt><dd>{unit(detail.rain, " mm")}</dd></div>
              <div><dt>Hembusan angin</dt><dd>{unit(detail.gust, " km/jam")}</dd></div>
            </dl>
            {detailDay && <RainTimes hours={allHours.filter((h) => h.time.startsWith(detailDay.date))} />}
            <small className="wx-detail-source">Prakiraan Open-Meteo · waktu WIB</small>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}

function HourCards({ hours, onSelect }: {
  hours: WeatherHour[];
  onSelect: (time: string, button: HTMLButtonElement) => void;
}) {
  const { ref: rail, edges } = useScrollEdges(hours.length);
  if (!hours.length) return <p className="wx-muted">Prakiraan per jam belum tersedia.</p>;
  return (
    <div className="scroll-vignette" {...edges}>
      <ol ref={rail} className="wx-hours" aria-label="Prakiraan per jam dalam WIB">
        {hours.map((h, i) => (
          <li key={h.time}>
            <button type="button" className={`wx-card tone-${h.icon}`}
              data-day-period={weatherPeriod(h, "day")} aria-haspopup="dialog"
              aria-label={`${dateLabel(h.time)}, pukul ${clock(h.time)} WIB, ${h.label}`}
              onClick={(e) => onSelect(h.time, e.currentTarget)}>
              <span className="wx-card-when">
                <span className="wx-day-name">{clock(h.time)}</span>
                {(i === 0 || h.time.slice(0, 10) !== hours[i - 1].time.slice(0, 10)) && (
                  <span className="wx-hour-date">{h.time.slice(8, 10)}/{h.time.slice(5, 7)}</span>
                )}
              </span>
              <WeatherArt weather={h} size={208} card />
              <span className="wx-day-label">{h.label}</span>
              <span className="wx-day-temp"><strong>{unit(h.temperature, "°")}</strong></span>
              <span className={`wx-chip ${(h.rain_chance ?? 0) >= 50 ? "is-wet" : ""}`}>
                <Droplets size={12} aria-hidden="true" /> {unit(h.rain_chance, "%")}
              </span>
              <ChevronRight size={13} className="wx-card-arrow" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RainTimes({ hours }: { hours: WeatherHour[] }) {
  const periods: { first: WeatherHour; last: WeatherHour }[] = [];
  for (const h of hours.filter(isWet)) {
    const last = periods.at(-1);
    if (last?.last.label === h.label && Number(h.time.slice(11, 13)) - Number(last.last.time.slice(11, 13)) === 1) {
      last.last = h;
    } else {
      periods.push({ first: h, last: h });
    }
  }
  const peak = hours.reduce<WeatherHour | undefined>(
    (best, h) => h.rain_chance != null && h.rain_chance > (best?.rain_chance ?? 0) ? h : best,
    undefined,
  );
  return (
    <section className="wx-rain-times">
      <h3>Perkiraan waktu hujan</h3>
      {periods.length ? (
        <ul>
          {periods.map(({ first, last }) => (
            <li key={first.time}>
              <span>{first.label}</span>
              <strong>{clock(first.time)}{last !== first && `–${clock(last.time)}`} WIB</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="wx-muted">{hours.some((h) => h.code != null)
          ? "Model belum menunjukkan gerimis atau hujan pada jam yang tersedia."
          : "Rincian waktu hujan belum tersedia."}</p>
      )}
      {peak && <p className="wx-muted">Peluang tertinggi pada jam yang tersedia {unit(peak.rain_chance, "%")} sekitar pukul {clock(peak.time)} WIB.</p>}
    </section>
  );
}

function HazardList({ hazards }: { hazards: Hazards | null }) {
  if (!hazards) return null;
  const quakes = [...(hazards.quakes || [])].sort((a, b) => b.magnitude - a.magnitude).slice(0, 3);
  const allQuakesWithoutTsunami = quakes.length > 0 && quakes.every(
    (q) => /^tidak berpotensi tsunami[.!]?$/i.test(q.potential?.trim() ?? ""),
  );
  const quakeDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
  });
  return (
    <div className="wx-panel wx-hazard-panel">
      <h3>Siklon &amp; gempa di sekitar Indonesia</h3>
      <ul className="wx-hazards">
        {hazards.cyclones === null ? (
          <li className="is-muted">
            <Tornado size={18} aria-hidden="true" /> <span>Data siklon belum tersedia.</span>
          </li>
        ) : hazards.cyclones.length === 0 ? (
          <li className="is-muted">
            <Tornado size={18} aria-hidden="true" /> <span>Tidak ada siklon aktif.</span>
          </li>
        ) : (
          hazards.cyclones.map((c) => (
            <li key={c.id} className={`wx-cyclone is-${c.level}`}>
              <Tornado size={18} aria-hidden="true" />
              <div>
                <strong>Siklon tropis {c.name}</strong>
                <p>
                  Status {c.level} · {Math.abs(c.latitude).toFixed(1)}°
                  {c.latitude < 0 ? "LS" : "LU"} {c.longitude.toFixed(1)}°BT
                  {c.severity ? ` · ${c.severity}` : ""}
                </p>
              </div>
            </li>
          ))
        )}
        {hazards.quakes === null && <li className="is-muted"><Waves size={18} aria-hidden="true" /> <span>Data gempa belum tersedia.</span></li>}
        {hazards.quakes?.length === 0 && <li className="is-muted"><Waves size={18} aria-hidden="true" /> <span>Belum ada gempa M5+ di data terbaru.</span></li>}
        {quakes.map((q) => {
          const location = formatQuakeRegion(q.region || "");
          return (
            <li key={q.id} className="wx-quake">
              <div className="wx-quake-content">
                <strong>{location || "Lokasi belum tersedia"}</strong>
                <div className="wx-quake-meta">
                  <time dateTime={q.time}>{quakeDate.format(new Date(q.time))} WIB</time>
                  {q.depth && <span>Kedalaman {q.depth}</span>}
                </div>
                {!allQuakesWithoutTsunami && q.potential && <p>{q.potential}</p>}
              </div>
              <span className="wx-magnitude">M {num(q.magnitude)}</span>
            </li>
          );
        })}
      </ul>
      {allQuakesWithoutTsunami && <p className="wx-quake-summary">Menurut BMKG, gempa di atas tidak berpotensi tsunami.</p>}
      <div className="wx-foot">
        <Link className="insight-text-link" to="/sensor-map?overlay=rain&event_type=all">
          <MapIcon size={15} aria-hidden="true" /> Peta cuaca{" "}
          <ArrowUpRight size={15} />
        </Link>
        <small>GDACS · BMKG (M5+)</small>
      </div>
    </div>
  );
}
