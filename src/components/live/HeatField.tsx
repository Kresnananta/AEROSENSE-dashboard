import { cr, filledGrid, mc, sample, type Grid } from "@/lib/heat-grid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageOverlay, Marker, Pane, useMap } from "react-leaflet";
import { divIcon, Point, popup, type LayerEvent, type LeafletMouseEvent, type Map as LeafletMap } from "leaflet";
import { apiRequest } from "@/services/api";
import referencePoints from "@/lib/indonesia-reference-points.json";
import { HEAT_LAYERS, type HeatLayerKey, type Stop } from "./heat-layers";

export type HeatInfo = { source: string; valid_at: string | null; error?: string } | null;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const rgbStops = new Map(Object.values(HEAT_LAYERS).flatMap(({ stops }) =>
  stops.map(([, color]) => [color, hex(color)] as const),
));
function colorAt(stops: readonly Stop[], v: number) {
  if (v <= stops[0][0]) return rgbStops.get(stops[0][1])!;
  for (let i = 1; i < stops.length; i++) {
    const [b, cb] = stops[i];
    if (v <= b) {
      const [a, ca] = stops[i - 1];
      const t = (v - a) / (b - a),
        x = rgbStops.get(ca)!,
        y = rgbStops.get(cb)!;
      return x.map((k, j) => Math.round(k + (y[j] - k) * t));
    }
  }
  return rgbStops.get(stops[stops.length - 1][1])!;
}

function colorText(rgb: number[]) {
  const linear = rgb.map((channel) => {
    const v = channel / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const light = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return light >= 0.179 ? "#000" : "#fff";
}

function modelTime(timestamp: string | null | undefined) {
  return timestamp ? new Date(timestamp).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB" : "";
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
  const W = Math.min(720, (g.cols - 1) * 32 + 1),
    H = Math.min(520, (g.rows - 1) * 32 + 1);
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

type Overlay = { url: string; bounds: [[number, number], [number, number]] };
type Field = {
  g: Grid;
  v: number[][];
  zoom: number;
  covers: [[number, number], [number, number]];
  uv?: { u: number[][]; v: number[][] };
};
type CachedField = { field: Field; overlay: Overlay; expires: number };

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
  color: number[];
  name?: string;
  shift: Point;
};

export type HeatScope = "province" | "district" | "detail";
const heatScope = (zoom: number): HeatScope => zoom <= 7 ? "province" : zoom <= 10 ? "district" : "detail";
const scopeText = {
  province: "Titik acuan provinsi",
  district: "Titik acuan kota dan kabupaten",
  detail: "Detail warna",
};
const labelOrigin = new Point(0, 0);
const regionLabelShifts = [labelOrigin, new Point(0, 44), new Point(0, -44)];
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

function containsView([[south, west], [north, east]]: Overlay["bounds"], view: NonNullable<ReturnType<typeof clip>>) {
  return view.s >= south - 1e-6 && view.w >= west - 1e-6 &&
    view.n <= north + 1e-6 && view.e <= east + 1e-6;
}

type WeatherPoint = {
  point: Point;
  position: [number, number];
  value: number;
  band: number;
  text: string;
  cloud?: boolean;
  name?: string;
};

function weatherPoint(
  { g, v, uv }: Field,
  layer: HeatLayerKey,
  point: Point,
  position: [number, number],
  name?: string,
): WeatherPoint | null {
  const [lat, lng] = position;
  const raw = sample(g, v, lat, lng, layer === "rain");
  if (raw == null || !Number.isFinite(raw)) return null;
  const value = layer === "temperature" ? raw : Math.max(0, raw);
  const row = (lat - g.south) / g.step;
  const col = (lng - g.west) / g.step;
  const opacity = coverage(g, layer, value, row, col);
  const cfg = HEAT_LAYERS[layer];

  if (layer === "cloud") {
    if (!name && coverage(g, layer, 100, row, col) < 0.12) return null;
    const u = uv ? sample(g, uv.u, lat, lng) ?? 0 : 0;
    const vv = uv ? sample(g, uv.v, lat, lng) ?? 0 : 0;
    const speed = Math.round(Math.hypot(u, vv));
    const cloud = opacity >= 0.12;
    if (!name && !cloud && speed < 3) return null;
    const wind = uv ? `${speed}${speed ? " " + arrow(u, vv) : ""}` : "";
    const cloudText = name || cloud ? cfg.format(Math.min(100, value)) : "";
    const text = [wind, cloudText].filter(Boolean).join(" · ");
    const band = cloud ? 100 + Math.round(value / 10) : Math.floor(speed / 8);
    return { point, position, value, band, text, cloud, name };
  }

  if (!name && opacity < 0.12) return null;
  const band = layer === "rain"
    ? HEAT_LAYERS.rain.stops.slice(1).reduce((index, [stop], i) => {
        const midpoint = (stop + HEAT_LAYERS.rain.stops[i][0]) / 2;
        return index + Number(value >= midpoint) + Number(value >= stop);
      }, 0)
    : Math.round(value / (layer === "pm25" ? 5 : 1));
  return { point, position, value, band, text: cfg.format(value), name };
}

function weatherRegions(map: LeafletMap, field: Field, layer: HeatLayerKey) {
  const { x: width, y: height } = map.getSize();
  const stride = 12;
  const origin = map.getPixelBounds().getTopLeft();
  const startX = ((-origin.x % stride) + stride) % stride;
  const startY = ((-origin.y % stride) + stride) % stride;
  const cols = Math.ceil((width - startX) / stride);
  const rows = Math.ceil((height - startY) / stride);
  const cells = Array.from({ length: Math.max(0, cols * rows) }, (_, i): WeatherPoint | null => {
    const point = new Point(startX + (i % cols) * stride, startY + Math.floor(i / cols) * stride);
    const { lat, lng } = map.containerPointToLatLng(point);
    return weatherPoint(field, layer, point, [lat, lng]);
  });

  const regions: WeatherPoint[][] = [];
  cells.forEach((start, i) => {
    if (!start) return;
    const region = [start];
    const queue = [i];
    cells[i] = null;
    for (let read = 0; read < queue.length; read++) {
      const j = queue[read];
      const neighbors = [j - cols, j + cols];
      if (j % cols > 0) neighbors.push(j - 1);
      if (j % cols < cols - 1) neighbors.push(j + 1);
      for (const next of neighbors) {
        const candidate = cells[next];
        if (candidate?.band !== start.band) continue;
        region.push(candidate);
        queue.push(next);
        cells[next] = null;
      }
    }
    regions.push(region);
  });

  regions.sort((a, b) => layer === "rain" || layer === "pm25"
    ? b[0].band - a[0].band || b.length - a.length
    : b.length - a.length);
  return regions;
}

function fieldLabels(map: LeafletMap, field: Field, layer: HeatLayerKey, scope: HeatScope): Label[] {
  const size = map.getSize();
  const container = map.getContainer();
  const viewport = container.getBoundingClientRect();
  const obstacles = Array.from(container.querySelectorAll(
    ".aerosense-map-marker, .leaflet-tooltip, .leaflet-popup, .leaflet-control, .map-location-dot",
  ), (el) => el.getBoundingClientRect());
  const labelSize = ({ text, name }: WeatherPoint) => name
    ? { halfWidth: Math.min(75, Math.max(text.length * 4 + 13, name.length * 3.3 + 10)),
        halfHeight: name.length > 22 ? 26 : 20 }
    : { halfWidth: text.length * 4 + 13, halfHeight: 14 };
  const fitsMap = (candidate: WeatherPoint, point = candidate.point) => {
    const { halfWidth, halfHeight } = labelSize(candidate);
    if (point.x < halfWidth || point.x > size.x - halfWidth ||
        point.y < halfHeight || point.y > size.y - halfHeight) return false;
    const x = viewport.left + point.x;
    const y = viewport.top + point.y;
    return !obstacles.some((box) =>
      x + halfWidth > box.left && x - halfWidth < box.right &&
      y + halfHeight > box.top && y - halfHeight < box.bottom,
    );
  };

  const areas: WeatherPoint[][] = [];
  if (scope === "detail") {
    areas.push(...weatherRegions(map, field, layer));
  } else {
    const bounds = map.getBounds();
    for (const [name, lat, lng] of referencePoints[scope] as [string, number, number][]) {
      const position: [number, number] = [lat, lng];
      if (!bounds.contains(position)) continue;
      const label = weatherPoint(field, layer, map.latLngToContainerPoint(position), position,
        name.replace(/^Kabupaten /, "Kab. "));
      if (label) areas.push([label]);
    }
  }
  const regions = areas.map((area) => ({
    center: area.reduce((sum, { point }) => sum.add(point), new Point(0, 0)).divideBy(area.length),
    candidates: scope === "detail" ? area.filter((candidate) => fitsMap(candidate)) : area,
  })).filter((region) => region.candidates.length > 0);
  const firstByColor = new Map<number, (typeof regions)[number]>();
  if (scope === "detail") {
    for (const region of regions) {
      const { band } = region.candidates[0];
      if (!firstByColor.has(band)) firstByColor.set(band, region);
    }
  }
  const colorRegions = [...firstByColor.values()];
  const priority = layer === "temperature" && colorRegions.length
    ? [
        colorRegions.reduce((a, b) => a.candidates[0].band <= b.candidates[0].band ? a : b),
        colorRegions.reduce((a, b) => a.candidates[0].band >= b.candidates[0].band ? a : b),
      ]
    : [];
  const ordered = new Set([...priority, ...colorRegions, ...regions]);

  const named = scope !== "detail";
  const areaPerLabel = named ? 64000 : 30000;
  const maxLabels = Math.max(2, Math.min(named ? 10 : 16, Math.round(size.x * size.y / areaPerLabel)));
  const placed: WeatherPoint[] = [];
  const labels: Label[] = [];

  for (const { center, candidates } of ordered) {
    candidates.sort((a, b) =>
      (layer === "rain" ? b.value - a.value : 0) ||
      a.point.distanceTo(center) - b.point.distanceTo(center),
    );
    for (const candidate of candidates) {
      const { point, position, text, value, cloud, name, band } = candidate;
      const { halfWidth, halfHeight } = labelSize(candidate);
      const shift = !named || fitsMap(candidate) ? labelOrigin
        : regionLabelShifts.find((offset) => fitsMap(candidate, point.add(offset)));
      if (!shift) continue;
      const target = point.add(shift);
      const overlaps = placed.some((other) => {
        if (target.distanceTo(other.point) < (named ? 122 : other.band === band ? 108 : 50))
          return true;
        const otherSize = labelSize(other);
        return Math.abs(target.x - other.point.x) < halfWidth + otherSize.halfWidth &&
          Math.abs(target.y - other.point.y) < halfHeight + otherSize.halfHeight;
      });
      if (overlaps) continue;

      const tone = cloud === false ? [64, 122, 168] : colorAt(HEAT_LAYERS[layer].stops, value);
      placed.push({ ...candidate, point: target });
      labels.push({
        key: position.map((coordinate) => coordinate.toFixed(6)).join(","),
        position,
        text,
        color: tone,
        name,
        shift,
      });
      break;
    }
    if (labels.length >= maxLabels) break;
  }
  return labels;
}

export function HeatField({
  layer,
  onInfo,
  onScope,
}: {
  layer: HeatLayerKey;
  onInfo: (i: HeatInfo) => void;
  onScope: (scope: HeatScope) => void;
}) {
  const map = useMap();
  const [snapshot, setSnapshot] = useState<CachedField | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const readingPopup = useMemo(() => popup({ className: "heat-inspection", minWidth: 180, maxWidth: 264 }), []);
  const inspect = useCallback((position: [number, number], name = "Titik pada peta", fromKeyboard = false) => {
    if (!snapshot) return;
    const { field } = snapshot;
    const cfg = HEAT_LAYERS[layer];
    const reading = weatherPoint(field, layer, map.latLngToContainerPoint(position), position, name);
    const card = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = name;
    card.append(title);

    const value = document.createElement("p");
    if (!reading) value.textContent = "Estimasi model belum tersedia di titik ini.";
    else if (layer === "cloud") {
      const [first, second] = reading.text.split(" · ");
      value.textContent = second ? `${first} km/jam · ${second} awan` : `${first} awan`;
    } else {
      const unit = layer === "temperature" ? "C" : " " + cfg.unit;
      value.textContent = cfg.label + " " + reading.text + unit;
    }
    card.append(value);

    const detail = document.createElement("small");
    const time = modelTime(field.g.valid_at);
    detail.textContent = ["Estimasi model", field.g.source, time].filter(Boolean).join(" · ");
    card.append(detail);
    readingPopup.setLatLng(position).setContent(card).openOn(map);
    if (fromKeyboard) readingPopup.getElement()?.querySelector<HTMLElement>(".leaflet-popup-close-button")?.focus();
  }, [layer, map, readingPopup, snapshot]);
  useEffect(() => () => { readingPopup.remove(); }, [readingPopup]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const cancel = () => clearTimeout(timer);
    const inspectMap = ({ latlng, originalEvent }: LeafletMouseEvent) => {
      if (originalEvent.target instanceof Element &&
          originalEvent.target.closest(".leaflet-interactive, .aerosense-map-marker, .leaflet-control, .leaflet-popup"))
        return;
      cancel();
      timer = setTimeout(() => inspect([latlng.lat, latlng.lng]), 240);
    };
    map.on("click", inspectMap);
    map.on("dblclick movestart", cancel);
    return () => {
      cancel();
      map.off("click", inspectMap);
      map.off("dblclick movestart", cancel);
    };
  }, [inspect, map]);
  const info = useRef(onInfo);
  info.current = onInfo;
  useEffect(() => {
    const cache: CachedField[] = [];
    let active: CachedField | null = null;
    let failed = false;
    let pending: { controller: AbortController; bounds: Overlay["bounds"]; zoom: number } | null = null;
    let timer: ReturnType<typeof setTimeout>;
    setSnapshot(null);
    info.current(null);
    setLabels([]);

    let layoutFrame = 0;
    const relabel = () => {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(() => {
        const scope = heatScope(map.getZoom());
        onScope(scope);
        setLabels(active ? fieldLabels(map, active.field, layer, scope) : []);
      });
    };
    const relabelOnLayer = (event: LayerEvent) => {
      if (event.layer.options?.pane !== VALUE_PANE) relabel();
    };

    const remember = (entry: CachedField) => {
      const index = cache.indexOf(entry);
      if (index >= 0) cache.splice(index, 1);
      cache.unshift(entry);
      if (cache.length > 8) cache.pop();
    };
    const show = (entry: CachedField) => {
      remember(entry);
      if (active === entry && !failed) return;
      active = entry;
      failed = false;
      setSnapshot(entry);
      info.current({
        source: entry.field.g.source,
        valid_at: entry.field.g.valid_at,
        ...(entry.field.g.stale ? { error: "Pembaruan tertunda. Peta menampilkan data tersimpan." } : {}),
      });
      relabel();
    };
    const stopPending = () => {
      pending?.controller.abort();
      pending = null;
    };
    const stopTimer = () => clearTimeout(timer);
    const load = () => {
      relabel();
      stopTimer();
      const view = clip(map.getBounds());
      if (!view) return;
      const zoom = map.getZoom();
      const cached = cache.find((entry) =>
        entry.expires > Date.now() && zoom <= entry.field.zoom + 1 && containsView(entry.field.covers, view),
      );
      if (cached) {
        stopPending();
        show(cached);
        return;
      }
      if (pending && zoom <= pending.zoom + 1 && containsView(pending.bounds, view)) return;

      timer = setTimeout(async () => {
        const b = clip(map.getBounds().pad(0.6));
        if (!b) return;
        const zoom = map.getZoom();
        stopPending();
        const controller = new AbortController();
        pending = { controller, zoom, bounds: [[b.s, b.w], [b.n, b.e]] };
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
          const entry: CachedField = {
            field: {
              g, v, zoom, covers: bounds,
              ...(g.direction ? { uv: windComponents(g, windGrid) } : {}),
            },
            overlay: { url: render(map, g, v, layer), bounds },
            expires: Date.now() + (g.stale ? 60_000 : 10 * 60_000),
          };
          const current = clip(map.getBounds());
          const coversCurrent = current && containsView(bounds, current) && map.getZoom() <= zoom + 1;
          if (!active || coversCurrent) show(entry);
          else remember(entry);
        } catch (e) {
          if (controller.signal.aborted) return;
          failed = true;
          info.current({
            source: active?.field.g.source ?? "",
            valid_at: active?.field.g.valid_at ?? null,
            error: active ? "Pembaruan tertunda. Lapisan terakhir masih ditampilkan."
              : e instanceof Error ? e.message : "Heatmap belum tersedia.",
          });
        } finally {
          if (pending?.controller === controller) pending = null;
        }
      }, 300);
    };
    load();
    map.on("movestart zoomstart", stopTimer);
    map.on("moveend resize", load);
    map.on("layeradd layerremove", relabelOnLayer);
    map.on("popupopen popupclose tooltipopen tooltipclose", relabel);
    return () => {
      stopTimer();
      stopPending();
      cancelAnimationFrame(layoutFrame);
      map.off("movestart zoomstart", stopTimer);
      map.off("moveend resize", load);
      map.off("layeradd layerremove", relabelOnLayer);
      map.off("popupopen popupclose tooltipopen tooltipclose", relabel);
    };
  }, [map, layer, onScope]);
  const icons = useMemo(
    () =>
      new Map(
        labels.map((label) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = label.name ? "heat-chip heat-place" : "heat-chip";
          chip.style.setProperty("--label-fill", `rgb(${label.color.join(" ")})`);
          chip.style.setProperty("--label-ink", colorText(label.color));
          chip.setAttribute("aria-label", [label.name, HEAT_LAYERS[layer].label, label.text].filter(Boolean).join(" · "));
          chip.onclick = (event) => {
            event.stopPropagation();
            inspect(label.position, label.name, event.detail === 0);
          };
          chip.ondblclick = (event) => event.stopPropagation();
          if (label.name) {
            const name = document.createElement("b");
            name.textContent = label.name;
            chip.append(name);
          }
          const value = document.createElement("span");
          value.className = "heat-value";
          value.textContent = label.text;
          chip.append(value);
          const { x, y } = label.shift;
          const length = Math.hypot(x, y);
          let html: HTMLElement = chip;
          if (length) {
            html = document.createElement("div");
            const leader = document.createElement("i");
            leader.className = "heat-leader";
            leader.style.width = length + "px";
            leader.style.transform = `rotate(${Math.atan2(y, x)}rad)`;
            leader.setAttribute("aria-hidden", "true");
            chip.style.left = x + "px";
            chip.style.top = y + "px";
            html.append(leader, chip);
          }
          return [label.key, divIcon({
            className: "heat-label",
            html,
            iconSize: [0, 0],
          })];
        }),
      ),
    [inspect, labels, layer],
  );
  return (
    <>
      {snapshot?.field.uv && <WindParticles field={snapshot.field} />}
      {snapshot && layer === "rain" && <RainParticles field={snapshot.field} />}
      {snapshot && (
        <ImageOverlay url={snapshot.overlay.url} bounds={snapshot.overlay.bounds} interactive={false} pane="heatPane" />
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

export function HeatLegend({ layer, info, scope }: { layer: HeatLayerKey; info: HeatInfo; scope: HeatScope }) {
  const l = HEAT_LAYERS[layer];
  const stopPosition = (i: number) => (i / (l.stops.length - 1)) * 100 + "%";
  const gradient = l.stops
    .map(([, c], i) => `${c} ${stopPosition(i)}`)
    .join(", ");
  const time = modelTime(info?.valid_at);
  const estimate = info?.source
    ? `${info.source}${time ? " · " + time : ""}. Estimasi model di ${scope === "detail" ? "titik label" : "titik acuan wilayah"}.`
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
      <div className="heat-legend-context">
        <strong>{scopeText[scope]}</strong>
        <p role="status">
          {info?.error || estimate || "Memuat estimasi model…"}
        </p>
        {info?.error && estimate && <p>{estimate}</p>}
        {info?.source && <p className="heat-inspect-hint">Pilih titik atau label untuk melihat detail.</p>}
      </div>
    </div>
  );
}
