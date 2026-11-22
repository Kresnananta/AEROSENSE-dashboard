import { useEffect, useMemo, useRef, useState } from "react";
import { ImageOverlay, Marker, Pane, useMap } from "react-leaflet";
import { divIcon, type LayerEvent, type Map as LeafletMap } from "leaflet";
import { apiRequest } from "@/services/api";
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

function mcSlope(a: number, b: number, c: number) {
  const d0 = b - a,
    d1 = c - b;
  return d0 * d1 <= 0 ? 0 : (2 * d0 * d1) / (d0 + d1);
}
function mc(p0: number, p1: number, p2: number, p3: number, t: number) {
  const m1 = mcSlope(p0, p1, p2),
    m2 = mcSlope(p1, p2, p3);
  const t2 = t * t,
    t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * p1 +
    (t3 - 2 * t2 + t) * m1 +
    (-2 * t3 + 3 * t2) * p2 +
    (t3 - t2) * m2
  );
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function coverage(g: Grid, layer: HeatLayerKey, value: number, row: number, col: number) {
  const cfg = HEAT_LAYERS[layer];
  const edge = Math.min(row, col, g.rows - 1 - row, g.cols - 1 - col);
  const fade = Math.min(1, Math.max(0, edge / (Math.min(g.rows - 1, g.cols - 1) * 0.12)));
  return "alphaFloor" in cfg ? fade * smoothstep(cfg.alphaFloor, cfg.alphaCeiling, value) : fade;
}

function render(map: LeafletMap, g: Grid, v: number[][], key: HeatLayerKey) {
  const stops = HEAT_LAYERS[key].stops;
  const monotone = key === "rain";
  const interp = monotone ? mc : cr;
  const S = monotone ? 40 : 32;
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
  const maxAlpha = key === "cloud" ? 215 : key === "rain" ? 215 : 255;
  const top = map.project([g.south + (g.rows - 1) * g.step, g.west], 0).y;
  const bottom = map.project([g.south, g.west], 0).y;

  for (let y = 0; y < H; y++) {
    const lat = map.unproject([0, top + ((bottom - top) * y) / (H - 1)], 0).lat;
    const gy = Math.max(0, Math.min(g.rows - 1, (lat - g.south) / g.step));
    const i = Math.min(Math.floor(gy), g.rows - 2),
      ty = gy - i;
    for (let x = 0; x < W; x++) {
      const gx = (x / (W - 1)) * (g.cols - 1);
      const j = Math.min(Math.floor(gx), g.cols - 2),
        tx = gx - j;
      const rowAt = (r: number) => interp(at(r, j - 1), at(r, j), at(r, j + 1), at(r, j + 2), tx);
      const value = interp(rowAt(i - 1), rowAt(i), rowAt(i + 1), rowAt(i + 2), ty);
      const alphaRatio = coverage(g, key, value, gy, gx);
      const o = (y * W + x) * 4;
      if (alphaRatio <= 0.01) {
        img.data[o + 3] = 0;
        continue;
      }
      const [r, gr, b] = colorAt(stops, Math.min(hi, Math.max(lo, value)));
      img.data[o] = r;
      img.data[o + 1] = gr;
      img.data[o + 2] = b;
      img.data[o + 3] = Math.round(maxAlpha * alphaRatio);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function sample(g: Grid, v: number[][], lat: number, lng: number, monotone = false) {
  const gy = (lat - g.south) / g.step,
    gx = (lng - g.west) / g.step;
  if (gy < 0 || gx < 0 || gy > g.rows - 1 || gx > g.cols - 1) return null;
  const at = (i: number, j: number) =>
    v[Math.min(g.rows - 1, Math.max(0, i))][Math.min(g.cols - 1, Math.max(0, j))];
  const i = Math.min(Math.floor(gy), g.rows - 2),
    j = Math.min(Math.floor(gx), g.cols - 2);
  const interp = monotone ? mc : cr;
  const rowAt = (r: number) => interp(at(r, j - 1), at(r, j), at(r, j + 1), at(r, j + 2), gx - j);
  return interp(rowAt(i - 1), rowAt(i), rowAt(i + 1), rowAt(i + 2), gy - i);
}

type Overlay = { url: string; bounds: [[number, number], [number, number]] };
type Field = {
  g: Grid;
  v: number[][];
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

function RainParticles({ field }: { field: Field }) {
  const map = useMap();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.className = "wind-canvas";
    map.getContainer().appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const CELL = 10;
    let raf = 0,
      W = 0,
      H = 0,
      cw = 0,
      ch = 0;
    let rainGrid = new Float32Array(0);
    let wetCells: { x: number; y: number }[] = [];
    let drops: { x: number; y: number; len: number; vy: number; life: number; maxLife: number }[] = [];

    const spawnDrop = () => {
      const cell = wetCells[Math.floor(Math.random() * wetCells.length)];
      const maxLife = 18 + Math.floor(Math.random() * 18);
      return {
        x: cell.x + Math.random() * CELL,
        y: cell.y + Math.random() * CELL,
        len: 7 + Math.random() * 5,
        vy: 3.4 + Math.random() * 2.2,
        life: Math.floor(Math.random() * maxLife),
        maxLife,
      };
    };

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
      rainGrid = new Float32Array(cw * ch);
      wetCells = [];
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const px = x * CELL;
          const py = y * CELL;
          const ll = map.containerPointToLatLng([px, py]);
          const r = Math.max(0, sample(field.g, field.v, ll.lat, ll.lng, true) ?? 0);
          const row = (ll.lat - field.g.south) / field.g.step;
          const col = (ll.lng - field.g.west) / field.g.step;
          const visible = r >= 0.2 && coverage(field.g, "rain", r, row, col) >= 0.12;
          rainGrid[y * cw + x] = visible ? r : 0;
          if (visible && r >= 0.25) wetCells.push({ x: px, y: py });
        }
      }
      if (!wetCells.length) {
        drops = [];
        return;
      }
      const n = Math.min(260, Math.max(16, Math.round(wetCells.length * 1.1)));
      drops = Array.from({ length: n }, () => spawnDrop());
    };

    const frame = () => {
      if (!wetCells.length) return;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.x -= d.vy * 0.2;
        d.y += d.vy;
        d.life--;
        const cx = Math.min(cw - 1, Math.max(0, Math.floor(d.x / CELL)));
        const cy = Math.min(ch - 1, Math.max(0, Math.floor(d.y / CELL)));
        const mm = rainGrid[cy * cw + cx];
        if (d.life <= 0 || mm < 0.2 || d.y > H || d.x < 0) {
          drops[i] = spawnDrop();
          continue;
        }
        const env = Math.sin(Math.PI * (d.life / d.maxLife));
        const alpha = Math.min(0.65, (0.28 + Math.min(1, mm / 8) * 0.35) * env);
        ctx.strokeStyle = `rgba(232, 246, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.2, d.y + d.len);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    };
    const start = () => {
      stop();
      build();
      if (wetCells.length) raf = requestAnimationFrame(frame);
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
  color: string;
};

const VALUE_PANE = "weatherValues";
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

function fieldLabels(map: LeafletMap, field: Field, layer: HeatLayerKey): Label[] {
  const { g, v, uv } = field;
  const size = map.getSize();
  const container = map.getContainer();
  const viewport = container.getBoundingClientRect();
  const obstacles = Array.from(container.querySelectorAll(
    ".aerosense-map-marker, .leaflet-tooltip, .leaflet-popup, .leaflet-control, .map-location-dot",
  ), (el) => el.getBoundingClientRect());
  const points: { lat: number; lng: number; value: number }[] = [];

  const addPoint = (lat: number, lng: number, value: number | null) => {
    if (value == null || !Number.isFinite(value)) return;
    const numeric = layer === "temperature" ? value : Math.max(0, value);
    const row = (lat - g.south) / g.step;
    const col = (lng - g.west) / g.step;
    if (coverage(g, layer, layer === "cloud" ? 100 : numeric, row, col) >= 0.12)
      points.push({ lat, lng, value: numeric });
  };

  if (layer === "rain") {
    g.values.forEach((row, i) =>
      row.forEach((value, j) => addPoint(g.south + i * g.step, g.west + j * g.step, value)),
    );
  }
  const maxLabels = Math.max(3, Math.min(14, Math.ceil((size.x * size.y) / 28500)));
  const spacing = layer === "rain"
    ? 120
    : Math.max(120, Math.ceil(Math.sqrt((size.x * size.y) / maxLabels)));
  const origin = map.getPixelBounds().getTopLeft();
  const stepPixels = Math.abs(map.project([0, g.west + g.step]).x - map.project([0, g.west]).x);
  if (layer !== "rain" || stepPixels >= spacing / 2) {
    for (let y = (-origin.y % spacing + spacing) % spacing; y < size.y; y += spacing) {
      for (let x = (-origin.x % spacing + spacing) % spacing; x < size.x; x += spacing) {
        const { lat, lng } = map.containerPointToLatLng([x, y]);
        addPoint(lat, lng, sample(g, v, lat, lng, layer === "rain"));
      }
    }
  }
  if (layer === "rain") points.sort((a, b) => b.value - a.value);

  const placed: { x: number; y: number }[] = [];
  const labels: Label[] = [];
  const cfg = HEAT_LAYERS[layer];
  for (const { lat, lng, value } of points) {
    const p = map.latLngToContainerPoint([lat, lng]);
    if (placed.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < spacing - 8)) continue;

    let text = cfg.format(value);
    let tone = colorAt(cfg.stops, value);
    if (layer === "cloud") {
      const u = uv ? sample(g, uv.u, lat, lng) ?? 0 : 0;
      const vv = uv ? sample(g, uv.v, lat, lng) ?? 0 : 0;
      const spd = Math.round(Math.hypot(u, vv));
      const cloud = Math.max(0, Math.min(100, value));
      const showCloud = cloud >= HEAT_LAYERS.cloud.quiet;
      if (!showCloud && spd < 3) continue;
      text = `${spd}${spd ? " " + arrow(u, vv) : ""}${showCloud ? " · " + cfg.format(cloud) : ""}`;
      if (!showCloud) tone = [64, 122, 168];
    }

    const halfWidth = (text.length * 8 + 26) / 2;
    const halfHeight = 16;
    if (p.x < halfWidth || p.x > size.x - halfWidth || p.y < halfHeight || p.y > size.y - halfHeight)
      continue;
    const x = viewport.left + p.x;
    const y = viewport.top + p.y;
    const blocked = obstacles.some((box) =>
      x + halfWidth > box.left && x - halfWidth < box.right &&
      y + halfHeight > box.top && y - halfHeight < box.bottom,
    );
    if (blocked) continue;

    placed.push(p);
    labels.push({
      key: `${lat.toFixed(5)},${lng.toFixed(5)}`,
      position: [lat, lng],
      text,
      color: `rgb(${tone.join(" ")})`,
    });
    if (labels.length >= maxLabels) break;
  }
  return labels;
}

export function HeatField({
  layer,
  onInfo,
}: {
  layer: HeatLayerKey;
  onInfo: (i: HeatInfo) => void;
}) {
  const map = useMap();
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const field = useRef<Field | null>(null);
  const [wind, setWind] = useState<Field | null>(null);
  const [rainField, setRainField] = useState<Field | null>(null);
  const info = useRef(onInfo);
  info.current = onInfo;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let abort: AbortController | null = null;
    field.current = null;
    setWind(null);
    setRainField(null);
    setOverlay(null);
    info.current(null);
    setLabels([]);

    let layoutFrame = 0;
    const relabel = () => {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(() => {
        const active = field.current;
        setLabels(active ? fieldLabels(map, active, layer) : []);
      });
    };
    const relabelOnLayer = (event: LayerEvent) => {
      if (event.layer.options?.pane !== VALUE_PANE) relabel();
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
      clearTimeout(timer);
      if (!needsData()) {
        abort?.abort();
        return;
      }
      timer = setTimeout(async () => {
        const b = clip(map.getBounds().pad(0.6));
        if (!b) return;
        const zoom = map.getZoom();
        abort?.abort();
        const controller = new AbortController();
        abort = controller;
        const qs = new URLSearchParams({
          layer,
          south: b.s.toFixed(3),
          west: b.w.toFixed(3),
          north: b.n.toFixed(3),
          east: b.e.toFixed(3),
        });
        try {
          const g = await apiRequest<Grid>("/v1/heatmap?" + qs, { signal: controller.signal }, false);
          if (controller.signal.aborted) return;
          if (g.rows < 2 || g.cols < 2) throw new Error("Data model untuk area ini belum tersedia.");
          const v = filledGrid(g.values);
          const windGrid = g.wind_speed ? filledGrid(g.wind_speed) : v;
          const bounds: Overlay["bounds"] = [
            [g.south, g.west],
            [g.south + (g.rows - 1) * g.step, g.west + (g.cols - 1) * g.step],
          ];
          const nextOverlay = { url: render(map, g, v, layer), bounds };
          field.current = {
            g,
            v,
            zoom,
            covers: bounds,
            ...(g.direction ? { uv: windComponents(g, windGrid) } : {}),
          };
          setWind(field.current.uv ? field.current : null);
          setRainField(layer === "rain" ? field.current : null);

          setOverlay(nextOverlay);
          relabel();
          info.current({ source: g.source, valid_at: g.valid_at });
        } catch (e) {
          if (controller.signal.aborted) return;
          field.current = null;
          setOverlay(null);
          setWind(null);
          setRainField(null);
          relabel();
          info.current({
            source: "",
            valid_at: null,
            error: e instanceof Error ? e.message : "Heatmap belum tersedia.",
          });
        }
      }, 300);
    };
    load();
    map.on("moveend resize", load);
    map.on("layeradd layerremove", relabelOnLayer);
    map.on("popupopen popupclose tooltipopen tooltipclose", relabel);
    return () => {
      clearTimeout(timer);
      abort?.abort();
      cancelAnimationFrame(layoutFrame);
      map.off("moveend resize", load);
      map.off("layeradd layerremove", relabelOnLayer);
      map.off("popupopen popupclose tooltipopen tooltipclose", relabel);
    };
  }, [map, layer]);
  const icons = useMemo(
    () =>
      new Map(
        labels.map((l) => [
          l.key,
          divIcon({
            className: "heat-label",
            html: `<span style="--value-color:${l.color}">${l.text}</span>`,
            iconSize: [0, 0],
          }),
        ]),
      ),
    [labels],
  );
  return (
    <>
      {wind && <WindParticles field={wind} />}
      {rainField && <RainParticles field={rainField} />}
      {overlay && (
        <ImageOverlay url={overlay.url} bounds={overlay.bounds} interactive={false} pane="heatPane" />
      )}
      <Pane name={VALUE_PANE} style={{ zIndex: 500, pointerEvents: "none" }}>
        {labels.map((l) => (
          <Marker
            key={l.key}
            position={l.position}
            icon={icons.get(l.key)!}
            interactive={false}
            keyboard={false}
            pane={VALUE_PANE}
          />
        ))}
      </Pane>
    </>
  );
}

export function HeatLegend({ layer, info }: { layer: HeatLayerKey; info: HeatInfo }) {
  const l = HEAT_LAYERS[layer];
  const stopPosition = (i: number) => (i / (l.stops.length - 1)) * 100 + "%";
  const gradient = l.stops
    .map(([, c], i) => `${c} ${stopPosition(i)}`)
    .join(", ");
  const time = info?.valid_at
    ? new Date(info.valid_at).toLocaleTimeString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : "";
  return (
    <div className="heat-legend" role="group" aria-label={l.label + " · " + l.unit}>
      <div className="heat-legend-head">
        <strong>{l.label}</strong>
        <span>{l.unit}</span>
      </div>
      <div>
        <div className="heat-scale" style={{ background: `linear-gradient(90deg, ${gradient})` }} />
        <div className="heat-ticks">
          {l.stops.map(([v], i) => (
            <span key={v} style={{ left: stopPosition(i) }}>{l.format(v)}</span>
          ))}
        </div>
      </div>
      <p role="status">
        {info?.error || (info
          ? `${info.source}${time ? " · " + time : ""}. Estimasi model.`
          : "Memuat estimasi model…")}
      </p>
    </div>
  );
}
