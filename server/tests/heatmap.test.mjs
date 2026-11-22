import test from "node:test";
import assert from "node:assert/strict";
import { heatGrid, heatmapRoutes } from "../api/heatmap.mjs";
import { openMeteoRequest, weatherService } from "../api/weather.mjs";

const bounds = [-8, 112, -7, 113];
function modelRows(url) {
  return new URL(url).searchParams.get("latitude").split(",").map(() => ({
    current: { time: "2026-11-23T02:00", temperature_2m: 30, precipitation: 0.83, pm2_5: 9, us_aqi: 24 },
  }));
}
function api(request, now) {
  const route = heatmapRoutes({ request, now, send: (res, status, body) => Object.assign(res, { status, body }), rate: () => {} });
  return async (layer, [south, west, north, east] = bounds) => {
    const path = new URL("http://localhost/v1/heatmap");
    for (const [key, value] of Object.entries({ layer, south, west, north, east })) path.searchParams.set(key, value);
    const res = {};
    await route({ method: "GET", headers: {} }, res, path);
    return res.body;
  };
}

test("map requests share weather variables and fetch only the new points on a pan", async () => {
  const calls = [];
  const map = api(async (url) => {
    calls.push(url);
    return modelRows(url);
  }, () => 0);
  const [temperature, rain] = await Promise.all([map("temperature"), map("rain")]);
  assert.equal(calls.length, 1);
  assert.equal(temperature.values[0][0], 30);
  assert.equal(rain.values[0][0], 0.83);
  const first = new URL(calls[0]).searchParams;
  assert.ok(first.get("current").includes("cloud_cover"));
  assert.equal(first.get("latitude").split(",").length, 121);

  const shifted = await map("rain", [-8, 112.1, -7, 113.1]);
  assert.equal(shifted.west, 112.1);
  const second = new URL(calls[1]).searchParams;
  assert.equal(second.get("latitude").split(",").length, 11);
  assert.ok(second.get("longitude").split(",").every((value) => value === "113.100"));

  assert.equal((await map("pm25")).values[0][0], 9);
  assert.equal((await map("aqi")).values[0][0], 24);
  assert.equal(calls.length, 3);
  assert.ok(heatGrid(-13, 92, 8, 143).rows <= 32);
  assert.ok(heatGrid(-13, 92, 8, 143).cols <= 32);
});

test("cold map views cannot use more than the app's minute allowance", async () => {
  let time = 0;
  let points = 0;
  const map = api(async (url) => {
    const response = modelRows(url);
    points += response.length;
    return response;
  }, () => time);

  await map("rain");
  await map("rain", [-10, 115, -9, 116]);
  await assert.rejects(map("rain", [-12, 117, -11, 118]), { status: 503 });
  assert.equal(points, 242);
  assert.equal((await map("temperature")).values[0][0], 30);
  assert.equal(points, 242);
  time += 60_000;
  await map("rain", [-12, 117, -11, 118]);
  assert.equal(points, 363);
});

test("a provider quota limit pauses both map and forecast calls while retaining real map data", async () => {
  let clock = 0;
  let calls = 0;
  let limited = false;
  const request = async (url) => {
    calls++;
    if (limited) throw Object.assign(Error("limited"), { status: 429, retryAfter: "120" });
    return modelRows(url);
  };
  const now = () => clock;
  const openMeteo = openMeteoRequest({ request, now });
  const map = api(openMeteo, now);
  const forecasts = weatherService({ request, openMeteo, now });
  await map("rain");
  clock += 31 * 60_000;
  limited = true;
  const stale = await map("rain");
  assert.equal(stale.stale, true);
  assert.equal(stale.values[0][0], 0.83);
  assert.equal(stale.valid_at, "2026-11-23T02:00Z");
  await assert.rejects(forecasts.outlook(-7.28, 112.79), { status: 503 });
  assert.equal(calls, 2);
});
