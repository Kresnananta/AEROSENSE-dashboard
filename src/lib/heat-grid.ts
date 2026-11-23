export type Grid = {
  south: number;
  west: number;
  step: number;
  rows: number;
  cols: number;
  values: (number | null)[][];
  wind_speed?: (number | null)[][];
  direction?: (number | null)[][];
  source: string;
  valid_at: string | null;
  stale?: boolean;
};

export function filledGrid(values: (number | null)[][]) {
  const known = values.flat().filter((v): v is number => typeof v === "number");
  const mean = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
  return values.map((row) => row.map((v) => (typeof v === "number" ? v : mean)));
}
export const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0)));

function mcSlope(a: number, b: number, c: number) {
  const d0 = b - a,
    d1 = c - b;
  return d0 * d1 <= 0 ? 0 : (2 * d0 * d1) / (d0 + d1);
}
export function mc(p0: number, p1: number, p2: number, p3: number, t: number) {
  const m1 = mcSlope(p0, p1, p2),
    m2 = mcSlope(p1, p2, p3);
  const t2 = t * t,
    t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * p1 +
    (t3 - 2 * t2 + t) * m1 +
    (-2 * t3 + 3 * t2) * p2 +
    (t3 - t2) * m2
  );
}

export function sample(g: Grid, v: number[][], lat: number, lng: number, monotone = false) {
  const gy = (lat - g.south) / g.step,
    gx = (lng - g.west) / g.step;
  if (gy < 0 || gx < 0 || gy > g.rows - 1 || gx > g.cols - 1) return null;
  const at = (i: number, j: number) =>
    v[Math.min(g.rows - 1, Math.max(0, i))][Math.min(g.cols - 1, Math.max(0, j))];
  const i = Math.min(Math.floor(gy), g.rows - 2),
    j = Math.min(Math.floor(gx), g.cols - 2);
  const interp = monotone ? mc : cr;
  const rowAt = (r: number) => interp(at(r, j - 1), at(r, j), at(r, j + 1), at(r, j + 2), gx - j);
  return interp(rowAt(i - 1), rowAt(i), rowAt(i + 1), rowAt(i + 2), gy - i);
}
