export type Stop = [number, string];
export const HEAT_LAYERS = {
  temperature: {
    label: "Suhu",
    unit: "°C",
    format: (v: number) => `${Math.round(v)}°`,
    stops: [
      [18, "#2f7fd8"],
      [22, "#3fb0c6"],
      [25, "#7fcf7a"],
      [27, "#e9d84f"],
      [29, "#f6a83b"],
      [31, "#ef7a2f"],
      [33, "#e0512b"],
      [36, "#b52a2a"],
    ] as Stop[],
  },
  pm25: {
    label: "PM2.5",
    unit: "µg/m³",
    format: (v: number) => String(Math.round(v)),
    stops: [
      [0, "#3fae6a"],
      [15.5, "#a8cf4f"],
      [35, "#f0d24a"],
      [55.4, "#f39a3a"],
      [100, "#e2533a"],
      [150.4, "#b8323f"],
      [250, "#7b2c74"],
    ] as Stop[],
  },
  rain: {
    label: "Hujan & Petir",
    unit: "mm/jam · ⚡ petir",
    format: (v: number) => (v < 0.1 ? "0" : String(Math.round(v * 10) / 10).replace(".", ",")),
    quiet: 0.1,
    alphaFloor: 0.08,
    alphaCeiling: 2.5,
    stops: [
      [0.1, "#4ec8ff"],
      [1, "#2794f5"],
      [3, "#2059d8"],
      [8, "#6a3ad8"],
      [18, "#b02ec4"],
      [35, "#e02472"],
    ] as Stop[],
  },
  cloud: {
    label: "Awan & Angin",
    unit: "% awan · km/jam",
    format: (v: number) => `${Math.round(v)}%`,
    quiet: 20,
    alphaFloor: 20,
    alphaCeiling: 65,
    stops: [
      [20, "#d7e7f7"],
      [45, "#a3bdd8"],
      [70, "#6d89aa"],
      [90, "#466080"],
      [100, "#2f445e"],
    ] as Stop[],
  },
} as const;
export type HeatLayerKey = keyof typeof HEAT_LAYERS;
