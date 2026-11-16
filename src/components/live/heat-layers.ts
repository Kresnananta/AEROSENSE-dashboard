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
    label: "Hujan",
    unit: "mm/jam",
    format: (v: number) => (v < 0.1 ? "0" : String(Math.round(v * 10) / 10).replace(".", ",")),
    quiet: 0.1,
    alphaFloor: 0.05,
    alphaCeiling: 0.4,
    stops: [
      [0.1, "#00b7ff"],
      [0.8, "#0077ff"],
      [2.5, "#2f2cd8"],
      [6, "#a81ee6"],
      [15, "#f01e78"],
      [30, "#ff3b1f"],
    ] as Stop[],
  },
  cloud: {
    label: "Awan & Angin",
    unit: "% awan · km/jam",
    format: (v: number) => `${Math.round(v)}%`,
    quiet: 20,
    alphaFloor: 18,
    alphaCeiling: 55,
    stops: [
      [20, "#b8cde3"],
      [45, "#7a97b8"],
      [70, "#496585"],
      [90, "#273b54"],
      [100, "#172538"],
    ] as Stop[],
  },
} as const;
export type HeatLayerKey = keyof typeof HEAT_LAYERS;
