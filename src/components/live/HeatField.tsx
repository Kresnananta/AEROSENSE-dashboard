import { useEffect, useMemo, useRef, useState } from "react";
import { ImageOverlay, Marker, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { apiRequest } from "@/services/api";
import { ID_CITIES } from "@/lib/id-cities";
import { HEAT_LAYERS, type HeatLayerKey, type Stop } from "./heat-layers";

type Grid = {
  south: number;
  west: number;
  step: number;
  rows: number;
  cols: number;
  values: (number | null)[][];
  wind_speed?: (number | null)[][];
  direction?: (number | null)[][];
  cape?: (number | null)[][];
  weather_code?: (number | null)[][];
  source: string;
  valid_at: string | null;
};
export type HeatInfo = { source: string; valid_at: string | null; error?: string } | null;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
function colorAt(stops: readonly Stop[], v: number) {
  if (v <= stops[0][0]) return hex(stops[0][1]);
  for (let i = 1; i < stops.length; i++) {
    const [b, cb] = stops[i];
    if (v <= b) {
      const [a, ca] = stops[i - 1];
      const t = (v - a) / (b - a),
        x = hex(ca),
        y = hex(cb);
      return x.map((k, j) => Math.round(k + (y[j] - k) * t));
    }
  }
  return hex(stops[stops.length - 1][1]);
}

function filledGrid(values: (number | null)[][]) {
  const known = values.flat().filter((v): v is number => typeof v === "number");
  const mean = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
  return values.map((row) => row.map((v) => (typeof v === "number" ? v : mean)));
}
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0)));

function render(g: Grid, v: number[][], key: HeatLayerKey) {
  const cfg = HEAT_LAYERS[key] as {
    stops: readonly Stop[];
    alphaFloor?: number;
    alphaCeiling?: number;
  };
  const stops = cfg.stops;
  const S = 32;
  const W = (g.cols - 1) * S + 1,
    H = (g.rows - 1) * S + 1;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const at = (i: number, j: number) =>
    v[Math.min(g.rows - 1, Math.max(0, i))][Math.min(g.cols - 1, Math.max(0, j))];
  const lo = stops[0][0],
    hi = stops[stops.length - 1][0];
  const floor = cfg.alphaFloor;
  const ceil = cfg.alphaCeiling;
  const maxAlpha = key === "cloud" ? 215 : key === "rain" ? 235 : 255;

  for (let y = 0; y < H; y++) {
    const gy = ((H - 1 - y) / (H - 1)) * (g.rows - 1);
    const i = Math.min(Math.floor(gy), g.rows - 2),
      ty = gy - i;
    for (let x = 0; x < W; x++) {
      const gx = (x / (W - 1)) * (g.cols - 1);
      const j = Math.min(Math.floor(gx), g.cols - 2),
        tx = gx - j;
      const rowAt = (r: number) => cr(at(r, j - 1), at(r, j), at(r, j + 1), at(r, j + 2), tx);
      const value = cr(rowAt(i - 1), rowAt(i), rowAt(i + 1), rowAt(i + 2), ty);
      let alphaRatio = 1;
      if (floor !== undefined && ceil !== undefined) {
        if (value <= floor) alphaRatio = 0;
        else if (value < ceil) alphaRatio = (value - floor) / (ceil - floor);
      }
      const o = (y * W + x) * 4;
      if (alphaRatio <= 0.01) {
        img.data[o + 3] = 0;
        continue;
      }
      const [r, gr, b] = colorAt(stops, Math.min(hi, Math.max(lo, value)));
      img.data[o] = r;
      img.data[o + 1] = gr;
      img.data[o + 2] = b;
      const edge = Math.min(x, y, W - 1 - x, H - 1 - y) / (Math.min(W, H) * 0.12);
      img.data[o + 3] = Math.round(maxAlpha * alphaRatio * Math.min(1, Math.max(0, edge)));
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function sample(g: Grid, v: number[][], lat: number, lng: number) {
  const gy = (lat - g.south) / g.step,
    gx = (lng - g.west) / g.step;
  if (gy < 0 || gx < 0 || gy > g.rows - 1 || gx > g.cols - 1) return null;
  const at = (i: number, j: number) =>
    v[Math.min(g.rows - 1, Math.max(0, i))][Math.min(g.cols - 1, Math.max(0, j))];
  const i = Math.min(Math.floor(gy), g.rows - 2),
    j = Math.min(Math.floor(gx), g.cols - 2);
  const rowAt = (r: number) => cr(at(r, j - 1), at(r, j), at(r, j + 1), at(r, j + 2), gx - j);
  return cr(rowAt(i - 1), rowAt(i), rowAt(i + 1), rowAt(i + 2), gy - i);
}

function nearestGrid(g: Grid, grid: (number | null)[][] | undefined, lat: number, lng: number) {
  if (!grid) return null;
  const i = Math.round((lat - g.south) / g.step);
  const j = Math.round((lng - g.west) / g.step);
  if (i < 0 || j < 0 || i >= g.rows || j >= g.cols) return null;
  const val = grid[i]?.[j];
  return typeof val === "number" ? val : null;
}

type Layer = { id: number; url: string; bounds: [[number, number], [number, number]] };
type Field = {
  g: Grid;
  v: number[][];
  cape?: number[][];
  zoom: number;
  covers: [[number, number], [number, number]];
  uv?: { u: number[][]; v: number[][] };
};

function windComponents(g: Grid, speed: number[][]) {
  const u: number[][] = [],
    v: number[][] = [];
  for (let i = 0; i < g.rows; i++) {
    u.push([]);
    v.push([]);
    for (let j = 0; j < g.cols; j++) {
      const d = g.direction?.[i]?.[j];
      const rad = ((typeof d === "number" ? d : 0) * Math.PI) / 180;
      const sp = typeof d === "number" ? speed[i][j] : 0;
      u[i].push(-sp * Math.sin(rad));
      v[i].push(-sp * Math.cos(rad));
    }
  }
  return { u, v };
}
const ARROWS = ["→", "↗", "↑", "↖", "←", "↙", "↓", "↘"];
const arrow = (u: number, v: number) =>
  ARROWS[((Math.round(Math.atan2(v, u) / (Math.PI / 4)) % 8) + 8) % 8];

function WindParticles({ field }: { field: Field }) {
  const map = useMap();
  useEffect(() => {
    const uv = field.uv;
    if (!uv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.className = "wind-canvas";
    map.getContainer().appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const CELL = 8,
      SPEED = 0.13,
      LIFE = 90;
    let raf = 0,
      W = 0,
      H = 0,
      cw = 0,
      ch = 0;
    let cells = new Float32Array(0),
      px = new Float32Array(0),
      py = new Float32Array(0),
      age = new Uint16Array(0);

    const build = () => {
      const size = map.getSize();
      W = size.x;
      H = size.y;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = Math.ceil(W / CELL) + 1;
      ch = Math.ceil(H / CELL) + 1;
      cells = new Float32Array(cw * ch * 2);
      for (let y = 0; y < ch; y++)
        for (let x = 0; x < cw; x++) {
          const ll = map.containerPointToLatLng([x * CELL, y * CELL]);
          const u = sample(field.g, uv.u, ll.lat, ll.lng),
            v = sample(field.g, uv.v, ll.lat, ll.lng);
          const k = (y * cw + x) * 2;
          cells[k] = u ?? NaN;
          cells[k + 1] = v ?? NaN;
        }
      const n = Math.min(1800, Math.round((W * H) / 900));
      px = new Float32Array(n);
      py = new Float32Array(n);
      age = new Uint16Array(n);
      for (let i = 0; i < n; i++) reset(i);
    };
    const reset = (i: number) => {
      px[i] = Math.random() * W;
      py[i] = Math.random() * H;
      age[i] = Math.floor(Math.random() * LIFE);
    };
    const frame = () => {
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "rgba(0,0,0,0.88)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.shadowColor = "rgba(16,42,71,0.35)";
      ctx.shadowBlur = 2;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < px.length; i++) {
        const cx = Math.round(px[i] / CELL),
          cy = Math.round(py[i] / CELL);
        if (++age[i] > LIFE || cx < 0 || cy < 0 || cx >= cw || cy >= ch) {
          reset(i);
          continue;
        }
        const k = (cy * cw + cx) * 2,
          u = cells[k],
          v = cells[k + 1];
        if (!Number.isFinite(u) || !Number.isFinite(v)) {
          reset(i);
          continue;
        }
        const nx = px[i] + u * SPEED,
          ny = py[i] - v * SPEED;
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(nx, ny);
        px[i] = nx;
        py[i] = ny;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    };
    const start = () => {
      stop();
      build();
      raf = requestAnimationFrame(frame);
    };
    start();
    map.on("movestart zoomstart", stop);
    map.on("moveend resize", start);
    return () => {
      stop();
      map.off("movestart zoomstart", stop);
      map.off("moveend resize", start);
      canvas.remove();
    };
  }, [map, field]);
  return null;
}

type Label = {
  key: string;
  position: [number, number];
  text: string;
  city: boolean;
  storm?: boolean;
  bg: string;
  fg: string;
};

const CITY_ZOOM = 10;
const REGION = { south: -13, west: 92, north: 8, east: 143 };
const clip = (b: {
  getSouth(): number;
  getWest(): number;
  getNorth(): number;
  getEast(): number;
}) => {
  const s = Math.max(REGION.south, b.getSouth()),
    w = Math.max(REGION.west, b.getWest()),
    n = Math.min(REGION.north, b.getNorth()),
    e = Math.min(REGION.east, b.getEast());
  return s < n && w < e ? { s, w, n, e } : null;
};

const STEPS = [0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5];
const labelStep = (latSpan: number) => STEPS.find((s) => s >= latSpan / 3) ?? 5;

export function HeatField({
  layer,
  onInfo,
}: {
  layer: HeatLayerKey;
  onInfo: (i: HeatInfo) => void;
}) {
  const map = useMap();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const field = useRef<Field | null>(null);
  const [wind, setWind] = useState<Field | null>(null);
  const info = useRef(onInfo);
  info.current = onInfo;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let abort: AbortController | null = null;
    let seq = 0;
    field.current = null;
    setWind(null);
    setLayers([]);
    setLabels([]);

    const relabel = () => {
      const f = field.current;
      if (!f) return setLabels([]);
      const view = map.getBounds();
      const size = map.getSize();
      const zoom = map.getZoom();

      const points: { lat: number; lng: number; city: boolean }[] = [];
      if (zoom <= CITY_ZOOM) {
        const maxRank = zoom <= 5 ? 1 : zoom <= 7 ? 2 : 3;
        for (const [, lat, lng, rank] of [...ID_CITIES].sort((x, y) => x[3] - y[3]))
          if (rank <= maxRank && view.contains([lat, lng])) points.push({ lat, lng, city: true });
      } else {
        const step = labelStep(view.getNorth() - view.getSouth());
        for (
          let lat = Math.ceil(view.getSouth() / step) * step;
          lat <= view.getNorth();
          lat += step
        )
          for (
            let lng = Math.ceil(view.getWest() / step) * step;
            lng <= view.getEast();
            lng += step
          )
            points.push({ lat, lng, city: false });
      }
      const out: Label[] = [];
      const placed: { x: number; y: number }[] = [];
      for (const { lat, lng, city } of points) {
        const p = map.latLngToContainerPoint([lat, lng]);
        if (p.x < 24 || p.y < 24 || p.x > size.x - 24 || p.y > size.y - 24) continue;
        if (p.x < 260 && p.y > size.y - 200) continue;
        if (placed.some((q) => Math.abs(q.x - p.x) < 64 && Math.abs(q.y - p.y) < 34)) continue;
        const value = sample(f.g, f.v, lat, lng);
        if (value == null) continue;

        const wmo = nearestGrid(f.g, f.g.weather_code, lat, lng);
        const capeVal = f.cape ? sample(f.g, f.cape, lat, lng) : null;
        const isThunder = (wmo != null && wmo >= 95) || (capeVal != null && capeVal >= 1000);
        const quiet = (HEAT_LAYERS[layer] as { quiet?: number }).quiet;

        if (layer === "rain") {
          const wet = value >= (quiet ?? 0.1);
          if (!wet && !isThunder) continue;
          const text = isThunder
            ? wet
              ? `⚡ ${HEAT_LAYERS.rain.format(value)}`
              : `⚡ ${Math.round((capeVal || 1000) / 100) * 100}`
            : HEAT_LAYERS.rain.format(value);
          const stops = HEAT_LAYERS.rain.stops;
          const [r, gr, bl] = isThunder
            ? [18, 36, 66]
            : colorAt(stops, Math.min(stops[stops.length - 1][0], Math.max(stops[0][0], value)));
          placed.push(p);
          out.push({
            key: `${city ? "c" : "g"}${lat.toFixed(3)},${lng.toFixed(3)}`,
            position: [lat, lng],
            text,
            city,
            storm: isThunder,
            bg: `rgb(${r} ${gr} ${bl})`,
            fg: isThunder ? "#ffd54f" : "#fff",
          });
          if (out.length >= 40) break;
          continue;
        }

        if (layer === "cloud") {
          const u = f.uv ? sample(f.g, f.uv.u, lat, lng) ?? 0 : 0;
          const vv = f.uv ? sample(f.g, f.uv.v, lat, lng) ?? 0 : 0;
          const spd = Math.round(Math.hypot(u, vv));
          const hasCloud = value >= (quiet ?? 20);
          if (!hasCloud && spd < 3) continue;
          const dir = spd >= 1 ? " " + arrow(u, vv) : "";
          const text = hasCloud ? `${spd}${dir} · ${Math.round(value)}%` : `${spd}${dir}`;
          const stops = HEAT_LAYERS.cloud.stops;
          const [r, gr, bl] = hasCloud
            ? colorAt(stops, Math.min(stops[stops.length - 1][0], Math.max(stops[0][0], value)))
            : [232, 243, 255];
          const light = (0.299 * r + 0.587 * gr + 0.114 * bl) / 255 > 0.62;
          placed.push(p);
          out.push({
            key: `${city ? "c" : "g"}${lat.toFixed(3)},${lng.toFixed(3)}`,
            position: [lat, lng],
            text,
            city,
            bg: `rgb(${r} ${gr} ${bl})`,
            fg: light ? "#102a47" : "#fff",
          });
          if (out.length >= 40) break;
          continue;
        }

        if (quiet !== undefined && value < quiet) continue;
        const text = HEAT_LAYERS[layer].format(value);
        const stops = HEAT_LAYERS[layer].stops;
        const [r, gr, bl] = colorAt(
          stops,
          Math.min(stops[stops.length - 1][0], Math.max(stops[0][0], value)),
        );
        const light = (0.299 * r + 0.587 * gr + 0.114 * bl) / 255 > 0.62;
        placed.push(p);
        out.push({
          key: `${city ? "c" : "g"}${lat.toFixed(3)},${lng.toFixed(3)}`,
          position: [lat, lng],
          text,
          city,
          bg: `rgb(${r} ${gr} ${bl})`,
          fg: light ? "#1d2f43" : "#fff",
        });
        if (out.length >= 40) break;
      }
      setLabels(out);
    };

    const needsData = () => {
      const f = field.current;
      if (!f) return true;
      const v = clip(map.getBounds());
      if (!v) return false;
      const [[s, w], [n, e]] = f.covers;
      return (
        v.s < s - 1e-6 ||
        v.w < w - 1e-6 ||
        v.n > n + 1e-6 ||
        v.e > e + 1e-6 ||
        Math.abs(map.getZoom() - f.zoom) >= 2
      );
    };
    const load = () => {
      relabel();
      if (!needsData()) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        abort?.abort();
        abort = new AbortController();
        const id = ++seq;
        const b = clip(map.getBounds().pad(0.6));
        if (!b) return;
        const qs = new URLSearchParams({
          layer,
          south: b.s.toFixed(3),
          west: b.w.toFixed(3),
          north: b.n.toFixed(3),
          east: b.e.toFixed(3),
        });
        try {
          const g = await apiRequest<Grid>("/v1/heatmap?" + qs, { signal: abort.signal }, false);
          if (g.rows < 2 || g.cols < 2 || id !== seq) return;
          const v = filledGrid(g.values);
          const windGrid = g.wind_speed ? filledGrid(g.wind_speed) : v;
          const capeGrid = g.cape ? filledGrid(g.cape) : undefined;
          const bounds: Layer["bounds"] = [
            [g.south, g.west],
            [g.south + (g.rows - 1) * g.step, g.west + (g.cols - 1) * g.step],
          ];
          field.current = {
            g,
            v,
            ...(capeGrid ? { cape: capeGrid } : {}),
            zoom: map.getZoom(),
            covers: bounds,
            ...(g.direction ? { uv: windComponents(g, windGrid) } : {}),
          };
          setWind(field.current.uv ? field.current : null);

          setLayers((old) => [
            ...old.slice(-1),
            { id, url: render(g, v, layer), bounds },
          ]);
          setTimeout(() => setLayers((old) => old.filter((l) => l.id >= id)), 700);
          relabel();
          info.current({ source: g.source, valid_at: g.valid_at });
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
          info.current({
            source: "",
            valid_at: null,
            error: e instanceof Error ? e.message : "Heatmap belum tersedia.",
          });
        }
      }, 300);
    };
    load();
    map.on("moveend", load);
    return () => {
      clearTimeout(timer);
      abort?.abort();
      map.off("moveend", load);
    };
  }, [map, layer]);
  const icons = useMemo(
    () =>
      new Map(
        labels.map((l) => [
          l.key,
          divIcon({
            className: `heat-label${l.city ? " heat-label-city" : ""}${l.storm ? " heat-label-storm" : ""}`,
            html: `<span style="background:${l.bg};color:${l.fg}">${l.text}</span>`,
            iconSize: [0, 0],
          }),
        ]),
      ),
    [labels],
  );
  return (
    <>
      {wind && <WindParticles field={wind} />}
      {layers.map((l) => (
        <ImageOverlay
          key={l.id}
          url={l.url}
          bounds={l.bounds}
          interactive={false}
          pane="heatPane"
          className="heat-overlay"
        />
      ))}
      {labels.map((l) => (
        <Marker
          key={l.key}
          position={l.position}
          icon={icons.get(l.key)!}
          interactive={false}
          keyboard={false}
          zIndexOffset={l.storm ? -400 : -1000}
        />
      ))}
    </>
  );
}

export function HeatLegend({ layer, info }: { layer: HeatLayerKey; info: HeatInfo }) {
  const l = HEAT_LAYERS[layer];
  const first = l.stops[0][0],
    last = l.stops[l.stops.length - 1][0];
  const gradient = l.stops
    .map(([v, c]) => `${c} ${((v - first) / (last - first)) * 100}%`)
    .join(", ");
  const ticks = [l.stops[0], l.stops[Math.floor(l.stops.length / 2)], l.stops[l.stops.length - 1]];
  const time = info?.valid_at
    ? new Date(info.valid_at).toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : "";
  return (
    <div className="heat-legend">
      <div className="heat-legend-head">
        <strong>{l.label}</strong>
        <span>{l.unit}</span>
      </div>
      <div className="heat-scale" style={{ background: `linear-gradient(90deg, ${gradient})` }} />
      <div className="heat-ticks">
        {ticks.map(([v]) => (
          <span key={v}>{l.format(v)}</span>
        ))}
      </div>
      <p>
        {info?.error
          ? info.error
          : `${info?.source || "Memuat…"}${time ? " · " + time : ""}. Estimasi model, bukan sensor.`}
      </p>
    </div>
  );
}
