import type { EnvironmentFact } from "../types/live.types.ts";

const fields = [
  ["suhu maksimum", "Suhu tertinggi"],
  ["suhu minimum", "Suhu terendah"],
  ["peluang presipitasi maksimum", "Peluang hujan tertinggi"],
  ["total presipitasi", "Curah hujan"],
  ["indeks UV maksimum", "UV tertinggi"],
] as const;

export function savedForecast(facts: EnvironmentFact[], now = Date.now()) {
  const today = new Date(now + 7 * 3_600_000).toISOString().slice(0, 10);
  const days = new Map<string, Map<string, EnvironmentFact>>();
  for (const fact of facts) {
    if (
      fact.category !== "weather" || fact.kind !== "forecast" || fact.stale ||
      !(Date.parse(fact.fresh_until) > now) || !fact.source.startsWith("Open-Meteo") ||
      typeof fact.value !== "number" || !Number.isFinite(fact.value)
    ) continue;
    const match = /^Prakiraan (.+) \(hari WIB (\d{4}-\d{2}-\d{2})\)$/.exec(fact.label);
    if (!match || match[2] < today || !fields.some(([key]) => key === match[1])) continue;
    const [, key, date] = match;
    const values = days.get(date) ?? new Map<string, EnvironmentFact>();
    if (!values.has(key)) values.set(key, fact);
    days.set(date, values);
  }
  return [...days]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 2)
    .map(([date, values]) => ({
      date,
      metrics: fields.flatMap(([key, label]) => {
        const fact = values.get(key);
        return fact ? [{ label, value: fact.value as number, unit: fact.unit }] : [];
      }),
    }));
}
