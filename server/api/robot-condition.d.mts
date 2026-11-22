export function robotCondition(input: {
  latest?: {
    observed_at?: string | null;
    stale?: boolean;
    quality?: Record<string, unknown> | null;
    metrics?: Record<string, number | null> | null;
  } | null;
  rules?: { enabled: boolean; metric: string; high: number; danger_high?: number | null }[];
  pm25Validated?: boolean;
  now?: number;
}): { band: "calm" | "warning" | "danger"; metric: "pm25_ug_m3" | "dust_ug_m3"; value: number; category: string } | null;
