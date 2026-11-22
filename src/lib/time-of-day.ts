export type DayPeriod = "morning" | "day" | "afternoon" | "night";

const wibHourFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "numeric",
  hourCycle: "h23",
  timeZone: "Asia/Jakarta",
});

export function wibHour(at: number | string = Date.now()): number {
  if (typeof at === "string") {
    const localMatch = /^\d{4}-\d{2}-\d{2}T(\d{2}):\d{2}(?::\d{2})?$/.exec(at.trim());
    if (localMatch) {
      const parsed = Number(localMatch[1]);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 23) return parsed;
    }
    const ts = Date.parse(at);
    if (!Number.isFinite(ts)) return NaN;
    return Number(wibHourFormatter.format(ts));
  }
  if (!Number.isFinite(at)) return NaN;
  return Number(wibHourFormatter.format(at));
}

export function dayPeriodFromHour(hour: number): DayPeriod {
  if (!Number.isFinite(hour)) return "day";
  if (hour < 5 || hour >= 18) return "night";
  if (hour < 11) return "morning";
  if (hour < 15) return "day";
  return "afternoon";
}

export function currentDayPeriod(now = Date.now()): DayPeriod {
  return dayPeriodFromHour(wibHour(now));
}

export function dayPeriodLabel(period: DayPeriod): string {
  switch (period) {
    case "morning":
      return "Pagi";
    case "day":
      return "Siang";
    case "afternoon":
      return "Sore";
    case "night":
      return "Malam";
  }
}

export function weatherSceneForPeriod({
  icon,
  code,
  period,
  isDay,
  warm = false,
  hot = false,
}: {
  icon?: string | null;
  code?: number | null;
  period: DayPeriod;
  isDay?: boolean | null;
  warm?: boolean;
  hot?: boolean;
}): string {
  const night = isDay === false || (isDay !== true && period === "night");
  const effectivePeriod: DayPeriod = night
    ? "night"
    : period === "night"
      ? "day"
      : period;

  if (typeof code === "number") {
    if ([95, 96, 97, 99].includes(code)) return night ? "storm-night" : "storm";
    if ([51, 53, 55, 56, 57].includes(code)) return night ? "drizzle-night" : "drizzle";
    if ([61, 66, 80].includes(code)) return night ? "light-rain-night" : "light-rain";
    if ([63, 65, 67, 81, 82].includes(code)) return night ? "rain-night" : "steady-rain";
    if (code === 45 || code === 48) return night ? "fog-night" : "fog";
    if (code === 0) return night ? "sunny-night" : "sunny";
    if (code === 3) return "cloudy";
    if (code === 1 || code === 2) icon = "partly";
  }

  if (icon === "thunder") return night ? "storm-night" : "storm";
  if (icon === "drizzle") return night ? "drizzle-night" : "drizzle";
  if (icon === "rain" || icon === "heavy-rain") return night ? "rain-night" : "steady-rain";
  if (icon === "fog") return night ? "fog-night" : "fog";

  if (icon === "clear") return night ? "sunny-night" : "sunny";
  if (icon === "partly" || hot || warm) {
    if (night) return warm ? "warm-night" : "cloudy-night";
    if (effectivePeriod === "morning") return "sunny-morning";
    if (effectivePeriod === "afternoon") return "sunny-dusk";
    return hot && icon !== "partly" ? "sunny" : "partly-cloudy";
  }
  return icon === "cloudy" ? "cloudy" : night ? "cloudy-night" : "cloudy";
}
