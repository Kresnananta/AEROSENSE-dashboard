import test from "node:test";
import assert from "node:assert/strict";
import {
  conditionScene,
  environmentHighlights,
  sensorSummary,
} from "../../src/lib/environment-presentation.ts";
import { visibleSensorResponse } from "../../src/lib/sensor-display.ts";
import { summarizeEnvironment } from "../api/environment-insights.mjs";

const now = Date.now();
const fact = (changes = {}) => ({
  id: "temperature",
  category: "weather",
  label: "Suhu udara",
  value: 30,
  unit: "°C",
  kind: "model",
  valid_at: new Date(now - 300000).toISOString(),
  fresh_until: new Date(now + 3600000).toISOString(),
  stale: false,
  ...changes,
});
test("highlighted numbers ignore expired readings and future measurements", () => {
  const current = fact();
  const expired = fact({
    id: "old",
    value: 99,
    fresh_until: new Date(now - 1).toISOString(),
  });
  const future = fact({
    id: "future",
    value: 55,
    valid_at: new Date(now + 86400000).toISOString(),
  });
  const insight = summarizeEnvironment([expired, future, current], now)[0];
  assert.equal(environmentHighlights(insight, [expired, future, current], now)[0].value, "30");
  assert.deepEqual(environmentHighlights({ ...insight, available: false }, [current], now), []);
});
test("condition illustration follows fresh weather evidence, not temperature alone", () => {
  const current = fact();
  for (const [code, scene] of [
    [0, "sunny"],
    [3, "cloudy"],
    [63, "rain"],
    [95, "storm"],
  ]) {
    const evidence = [
      current,
      fact({
        id: "code",
        label: "Kode kondisi cuaca (WMO)",
        value: code,
        unit: "",
      }),
    ];
    const insight = summarizeEnvironment(evidence, now)[0];
    assert.equal(conditionScene(insight, evidence), scene);
    if (code === 95) assert.match(insight.title, /petir/);
  }
  const oldCode = fact({
    id: "code",
    label: "Kode kondisi cuaca (WMO)",
    value: 0,
    fresh_until: new Date(now - 1).toISOString(),
  });
  assert.equal(
    conditionScene(summarizeEnvironment([current], now)[0], [oldCode, current]),
    "cloudy",
  );
});
test("sensor summary respects hysteresis, validation and missing readings", () => {
  const rule = {
    metric: "dust_ug_m3",
    enabled: true,
    high: 80,
    clear_below: 50,
    active: true,
    unit: "µg/m³",
  };
  const node = {
    pm25_validated: false,
    latest: {
      reading_id: "test",
      stale: false,
      metrics: { dust_ug_m3: 60, pm25_ug_m3: 200 },
    },
  };
  assert.equal(sensorSummary(node, [rule]).tone, "warning");
  assert.equal(sensorSummary(node, [{ ...rule, active: false }]).tone, "calm");
  assert.doesNotMatch(sensorSummary(node, [{ ...rule, metric: "pm25_ug_m3" }]).title, /ambang/);
  assert.equal(
    sensorSummary({ ...node, latest: { ...node.latest, stale: true } }, [rule]).tone,
    "pending",
  );
  assert.equal(sensorSummary(undefined, [rule]).tone, "pending");
});

test("node bands use sensor evidence and configured thresholds, with no invented danger level", () => {
  const rule = {
    metric: "dust_ug_m3",
    enabled: true,
    active: false,
    high: 40,
    danger_high: 60,
    clear_below: 35,
    unit: "µg/m³",
  };
  const node = (value) => ({
    pm25_validated: false,
    rules: [rule],
    latest: { reading_id: "r1", stale: false, metrics: { dust_ug_m3: value } },
  });
  assert.equal(sensorSummary(node(22)).label, "Terpantau baik");
  assert.equal(sensorSummary(node(40)).label, "Waspada");
  assert.equal(sensorSummary(node(60)).label, "Bahaya");
  assert.equal(sensorSummary(node(200), [{ ...rule, danger_high: null }]).label, "Waspada");
  assert.equal(sensorSummary(node(38), [{ ...rule, active: true }]).label, "Waspada");
  assert.equal(sensorSummary(node(35), [{ ...rule, active: true }]).label, "Terpantau baik");
  for (const value of [null, NaN, Infinity, -1])
    assert.equal(sensorSummary(node(value)).label, "Data belum cukup");
  assert.equal(
    sensorSummary({ ...node(22), latest: { ...node(22).latest, stale: true } }).label,
    "Data belum cukup",
  );
  assert.equal(
    sensorSummary({ ...node(22), latest: { ...node(22).latest, quality: { invalid: true } } })
      .label,
    "Data belum cukup",
  );
  assert.equal(sensorSummary(node(22), []).label, "Data belum cukup");
  assert.equal(
    sensorSummary(node(22), [{ ...rule, metric: "temperature_c" }]).label,
    "Data belum cukup",
  );
  assert.equal(
    sensorSummary(node(22), [rule, { ...rule, metric: "tvoc_ppb" }]).label,
    "Data belum cukup",
  );
  assert.equal(
    sensorSummary(node(22), [{ ...rule, metric: "pm25_ug_m3" }]).label,
    "Data belum cukup",
  );
});

test("displayed and exported sensor data omit legacy eCO2 while retaining TVOC and humidity", () => {
  const metrics = { eco2_ppm: 400, tvoc_ppb: 15, humidity_pct: 57 };
  const rule = { metric: "eco2_ppm" };
  const latest = {
    metrics,
    quality: { channels: { eco2_ppm: { flag: "suspect" }, tvoc_ppb: { flag: "suspect" } } },
    gru: {
      task: "fault_detection",
      estimates: metrics,
      fault_scores: { eco2_ppm: 0.2, tvoc_ppb: 0.8 },
      thresholds: { eco2_ppm: 0.4, tvoc_ppb: 0.7 },
      suspect: ["eco2_ppm", "tvoc_ppb"],
    },
  };
  const filtered = visibleSensorResponse({
    nodes: [{ latest, rules: [rule] }],
    readings: [
      { metrics, raw_metrics: metrics, gru: { target: "eco2_ppm", value: 410 } },
      { metrics, gru: { target: "tvoc_ppb", value: 16 } },
    ],
    alerts: [rule, { metric: "tvoc_ppb" }],
  });
  assert.doesNotMatch(JSON.stringify(filtered), /eco2_ppm/);
  assert.deepEqual(filtered.nodes[0].latest.metrics, { tvoc_ppb: 15, humidity_pct: 57 });
  assert.deepEqual(filtered.nodes[0].latest.gru.suspect, ["tvoc_ppb"]);
  assert.equal(filtered.readings[0].gru, null);
  assert.equal(filtered.readings[1].gru.value, 16);
  assert.equal(metrics.eco2_ppm, 400);
});
