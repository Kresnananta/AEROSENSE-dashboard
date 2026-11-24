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

const WEATHER_FIELDS = "temperature_2m,precipitation,cloud_cover,cape,wind_speed_10m,wind_direction_10m";
const AIR_FIELDS = "pm2_5,us_aqi";
const TARGET_POINTS = 144;
const POINT_TTL = 30 * 60_000;
const POINT_MAX_AGE = 6 * 60 * 60_000;
const MAP_BUDGETS = [[60_000, 350], [3_600_000, 2_000], [86_400_000, 5_000]];
const MAX_AXIS = 32;
const MAX_SPAN = 60;

export function heatGrid(south, west, north, east, minStep = 0.1) {
  if (![south, west, north, east].every(Number.isFinite)) throw fail("Area peta tidak valid.");
  if (south >= north || west >= east || south < -85 || north > 85 || west < -180 || east > 180)
    throw fail("Area peta tidak valid.");
  const latSpan = north - south,
    lngSpan = east - west;
  if (Math.max(latSpan, lngSpan) > MAX_SPAN) throw fail("Perbesar peta untuk melihat heatmap.");

  const area = Math.sqrt((latSpan * lngSpan) / TARGET_POINTS);
  const longest = Math.max(latSpan, lngSpan) / (MAX_AXIS - 2);
  const scale = Math.max(0, Math.ceil(Math.log2(Math.max(area, longest) / minStep)));
  const step = minStep * 2 ** scale;
  const firstRow = Math.floor(south / step + 1e-9);
  const firstCol = Math.floor(west / step + 1e-9);
  const rows = Math.ceil(north / step - 1e-9) - firstRow + 1;
  const cols = Math.ceil(east / step - 1e-9) - firstCol + 1;
  const r = (v) => Math.round(v * 1000) / 1000;
  return { south: r(firstRow * step), west: r(firstCol * step), step: r(step), rows, cols };
}

export function heatmapRoutes({ send, rate, request, now = Date.now }) {
  const cache = new Map();
  const pending = new Map();
  const reservations = [];

  function reserve(count) {
    const timestamp = now();
    while (reservations.length && reservations[0].at <= timestamp - MAP_BUDGETS.at(-1)[0])
      reservations.shift();
    for (const [duration, limit] of MAP_BUDGETS) {
      const used = reservations.reduce((sum, entry) => entry.at > timestamp - duration ? sum + entry.count : sum, 0);
      if (used + count > limit) throw fail("Pembaruan peta sementara dibatasi.", 503);
    }
    const entry = { at: timestamp, count };
    reservations.push(entry);
    return entry;
  }

  async function load(url, points) {
    const reservation = reserve(points.length);
    const latitudes = points.map((point) => point.lat).join(",");
    const longitudes = points.map((point) => point.lng).join(",");
    const fields = url.includes("/air-quality") ? AIR_FIELDS : WEATHER_FIELDS;
    const data = await request(
      `${url}?latitude=${latitudes}&longitude=${longitudes}&current=${fields}&timezone=UTC`,
      { timeout: 15000 },
    ).catch((error) => {
      const i = reservations.indexOf(reservation);
      if (error.code === "open_meteo_cooldown" && i !== -1) reservations.splice(i, 1);
      throw error;
    });
    const list = Array.isArray(data) ? data : [data];
    if (list.length !== points.length || list.some((item) => !item?.current))
      throw fail("Data peta tidak lengkap.", 502);
    const receivedAt = now();
    points.forEach((point, i) => {
      cache.delete(point.key);
      cache.set(point.key, { current: list[i].current, receivedAt });
    });
    while (cache.size > 12_000) cache.delete(cache.keys().next().value);
  }

  return async (req, res, url) => {
    if (url.pathname !== "/v1/heatmap" || req.method !== "GET") return false;
    const name = url.searchParams.get("layer");
    const layer = Object.hasOwn(LAYERS, name) ? LAYERS[name] : null;
    if (!layer) throw fail("Lapisan heatmap tidak dikenal.");
    const q = (k) => url.searchParams.has(k) ? Number(url.searchParams.get(k)) : NaN;
    const g = heatGrid(q("south"), q("west"), q("north"), q("east"), layer.minStep);
    const points = [];
    for (let i = 0; i < g.rows; i++) {
      for (let j = 0; j < g.cols; j++) {
        const lat = Math.max(-90, Math.min(90, g.south + i * g.step)).toFixed(3);
        const lng = Math.max(-180, Math.min(180, g.west + j * g.step)).toFixed(3);
        points.push({ lat, lng, key: `${layer.url}:${lat}:${lng}` });
      }
    }
    const missing = points.filter(({ key }) => (cache.get(key)?.receivedAt ?? -Infinity) <= now() - POINT_TTL);
    const canServeCached = points.every(({ key }) =>
      (cache.get(key)?.receivedAt ?? -Infinity) > now() - POINT_MAX_AGE,
    );
    if (missing.length) {
      const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0];
      const newPoints = [...new Map(missing.filter(({ key }) => !pending.has(key)).map((point) => [point.key, point])).values()];
      if (newPoints.length) {
        try {
          rate("heat:" + ip, 30);
          const update = load(layer.url, newPoints).finally(() => {
            for (const { key } of newPoints) pending.delete(key);
          });
          for (const { key } of newPoints) pending.set(key, update);
        } catch (error) {
          if (!canServeCached) throw error;
        }
      }
      const refresh = Promise.allSettled(new Set(missing.map(({ key }) => pending.get(key))));
      if (!canServeCached) await refresh;
    }
    const samples = points.map(({ key }) => cache.get(key));
    if (samples.some((sample) => !sample || sample.receivedAt <= now() - POINT_MAX_AGE))
      throw fail("Data model peta belum tersedia. Coba lagi nanti.", 503);
    const gridOf = (field, precision = 10) => {
      const flat = samples.map(({ current }) => {
        const value = current[field];
        return Number.isFinite(value) ? Math.round(value * precision) / precision : null;
      });
      return Array.from({ length: g.rows }, (_, i) => flat.slice(i * g.cols, (i + 1) * g.cols));
    };
    const values = gridOf(layer.field, name === "rain" ? 100 : 10);
    if (!values.some((row) => row.some((value) => value !== null)))
      throw fail("Data model peta belum tersedia.", 503);
    const firstTime = samples.map(({ current }) => current.time).filter(Boolean).sort()[0];
    send(res, 200, {
      layer: name,
      ...g,
      values,
      ...(layer.windSpeed ? { wind_speed: gridOf(layer.windSpeed) } : {}),
      ...(layer.direction ? { direction: gridOf(layer.direction, 1) } : {}),
      unit: layer.unit,
      source: layer.source,
      valid_at: firstTime ? firstTime + "Z" : null,
      stale: samples.some(({ receivedAt }) => receivedAt <= now() - POINT_TTL),
    });
    return true;
  };
}
