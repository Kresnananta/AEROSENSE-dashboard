import { useEffect, useState } from "react";
import { currentDayPeriod, type DayPeriod } from "@/lib/time-of-day";

export function useDayPeriod(): DayPeriod {
  const [period, setPeriod] = useState<DayPeriod>(() => currentDayPeriod());

  useEffect(() => {
    const sync = () => setPeriod(currentDayPeriod());
    const timer = window.setInterval(sync, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return period;
}
