const fail = (message, status = 400) => Object.assign(new Error(message), { status });

export const LAYERS = {
  temperature: {
    url: "https://api.open-meteo.com/v1/forecast",
    field: "temperature_2m",
    unit: "°C",
    source: "Open-Meteo (model cuaca)",
    minStep: 0.1,
  },
  pm25: {
    url: "https://air-quality-api.open-meteo.com/v1/air-quality",
    field: "pm2_5",
    unit: "µg/m³",
    source: "Open-Meteo / CAMS (model kualitas udara)",
    minStep: 0.2,
  },
  aqi: {
    url: "https://air-quality-api.open-meteo.com/v1/air-quality",
    field: "us_aqi",
    unit: "AQI US",
    source: "Open-Meteo / CAMS (model kualitas udara)",
    minStep: 0.2,
  },
  rain: {
    url: "https://api.open-meteo.com/v1/forecast",
    field: "precipitation",
    unit: "mm/jam",
    source: "Open-Meteo (model cuaca, curah hujan)",
    minStep: 0.1,
  },
  cloud: {
    url: "https://api.open-meteo.com/v1/forecast",
    field: "cloud_cover",
    windSpeed: "wind_speed_10m",
    direction: "wind_direction_10m",
    unit: "%",
    source: "Open-Meteo (tutupan awan & angin 10 m)",
    minStep: 0.1,
  },
  thunder: {
    url: "https://api.open-meteo.com/v1/forecast",
    field: "cape",
    unit: "J/kg",
    source: "Open-Meteo (model cuaca, energi badai CAPE)",
    minStep: 0.1,
  },
  wind: {
    url: "https://api.open-meteo.com/v1/forecast",
    field: "wind_speed_10m",
    direction: "wind_direction_10m",
    unit: "km/jam",
    source: "Open-Meteo (model cuaca, angin 10 m)",
    minStep: 0.1,
  },
};

const TARGET_POINTS = 256;
const MAX_AXIS = 32;
const MAX_SPAN = 60;

export function heatGrid(south, west, north, east, minStep = 0.1) {
  if (![south, west, north, east].every(Number.isFinite)) throw fail("Area peta tidak valid.");
  if (south >= north || west >= east || Math.abs(south) > 85 || Math.abs(north) > 85)
    throw fail("Area peta tidak valid.");
  const latSpan = north - south,
    lngSpan = east - west;
  if (Math.max(latSpan, lngSpan) > MAX_SPAN) throw fail("Perbesar peta untuk melihat heatmap.");

  const area = Math.sqrt((latSpan * lngSpan) / TARGET_POINTS);
  const longest = Math.max(latSpan, lngSpan) / (MAX_AXIS - 2);
  const step = Math.max(minStep, Math.ceil(Math.max(area, longest) * 20) / 20);
  const s = Math.floor(south / step) * step,
    w = Math.floor(west / step) * step;
  const rows = Math.min(MAX_AXIS, Math.ceil((north - s) / step) + 1);
  const cols = Math.min(MAX_AXIS, Math.ceil((east - w) / step) + 1);
  const r = (v) => Math.round(v * 1000) / 1000;
  return { south: r(s), west: r(w), step: r(step), rows, cols };
}

export function heatmapRoutes({ send, rate, request, now = Date.now }) {
  const cache = new Map();
  return async (req, res, url) => {
    if (url.pathname !== "/v1/heatmap" || req.method !== "GET") return false;
    const layer = LAYERS[url.searchParams.get("layer")];
    if (!layer) throw fail("Lapisan heatmap tidak dikenal.");
    const q = (k) => Number(url.searchParams.get(k));
    const g = heatGrid(q("south"), q("west"), q("north"), q("east"), layer.minStep);
    const key = [url.searchParams.get("layer"), g.south, g.west, g.step, g.rows, g.cols].join(":");
    const hit = cache.get(key);
    if (hit && hit.until > now()) return send(res, 200, hit.body), true;
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0];
    rate("heat:" + ip, 30);
    const lats = [],
      lons = [];
    for (let i = 0; i < g.rows; i++)
      for (let j = 0; j < g.cols; j++) {
        lats.push((g.south + i * g.step).toFixed(3));
        lons.push((g.west + j * g.step).toFixed(3));
      }
    const fields = [layer.field, layer.windSpeed, layer.direction].filter(Boolean);
    const data = await request(
      `${layer.url}?latitude=${lats.join(",")}&longitude=${lons.join(",")}&current=${fields.join(",")}&timezone=UTC`,
      { timeout: 15000 },
    ).catch(() => {
      throw fail("Data heatmap sedang tidak tersedia.", 503);
    });
    const list = Array.isArray(data) ? data : [data];
    const gridOf = (fieldName, round = 10) => {
      const flat = list.map((d) => {
        const v = Number(d?.current?.[fieldName]);
        return Number.isFinite(v) ? Math.round(v * round) / round : null;
      });
      return Array.from({ length: g.rows }, (_, i) => flat.slice(i * g.cols, (i + 1) * g.cols));
    };
    if (list.length !== g.rows * g.cols) throw fail("Data heatmap tidak lengkap.", 502);
    const values = gridOf(layer.field, 10);
    const body = {
      layer: url.searchParams.get("layer"),
      ...g,
      values,
      ...(layer.windSpeed ? { wind_speed: gridOf(layer.windSpeed, 10) } : {}),
      ...(layer.direction ? { direction: gridOf(layer.direction, 1) } : {}),
      unit: layer.unit,
      source: layer.source,
      valid_at: list[0]?.current?.time ? list[0].current.time + "Z" : null,
    };
    if (cache.size > 200) cache.clear();
    cache.set(key, { body, until: now() + 1800000 });
    send(res, 200, body);
    return true;
  };
}
