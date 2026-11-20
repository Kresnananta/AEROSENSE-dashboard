export function robotCondition({ latest, rules = [], pm25Validated, now = Date.now() }) {
  const age = now - Date.parse(latest?.observed_at ?? "");
  if (!Number.isFinite(age) || age > 600_000 || latest.stale || latest.quality?.invalid === true) return null;
  const metric = pm25Validated && Number.isFinite(latest.metrics?.pm25_ug_m3) ? "pm25_ug_m3" : "dust_ug_m3";
  const value = latest.metrics?.[metric];
  if (!Number.isFinite(value) || value < 0) return null;
  const [category, defaultBand] = value <= 15.5 ? ["baik", "calm"]
    : value <= 55.4 ? ["sedang", "calm"]
      : value <= 150.4 ? ["tidak sehat", "warning"]
        : value <= 250.4 ? ["sangat tidak sehat", "danger"] : ["berbahaya", "danger"];
  const rule = rules.find((r) => r.enabled && r.metric === metric && Number.isFinite(r.high) && r.high > 0);
  const band = !rule ? defaultBand
    : Number.isFinite(rule.danger_high) && value >= rule.danger_high ? "danger"
      : value >= rule.high ? "warning" : "calm";
  return { band, metric, value, category };
}
