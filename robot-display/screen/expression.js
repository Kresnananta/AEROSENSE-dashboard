export const MOODS = ["neutral", "happy", "concerned", "warning", "danger", "surprised"];
export function expressionFor(text = "", severity, supplied) {
  if (severity === "danger" || severity === "warning") return severity;
  if (MOODS.includes(supplied)) return supplied;
  const clean = String(text)
    .toLowerCase()
    .replace(
      /\b(tidak|belum|tanpa|no|not)\s+(ada\s+)?(bahaya|berbahaya|danger|dangerous|waspada|darurat)\b/g,
      " ",
    );
  if (/\b(bahaya|berbahaya|darurat|evakuasi|danger|dangerous|tidak aman)\b/.test(clean))
    return "danger";
  if (/\b(waspada|meningkat|hati-hati|warning|caution)\b/.test(clean)) return "warning";
  if (
    /\b(bencana|banjir|gempa|longsor|tsunami|korban|kebakaran|karhutla|disaster|flood|earthquake)\b/.test(
      clean,
    )
  )
    return "concerned";
  if (/\b(maaf|khawatir|sedih|belum tersedia|belum dapat|sorry)\b/.test(clean)) return "concerned";
  if (/\b(wah|wow|ternyata)\b/.test(clean)) return "surprised";
  if (/\b(halo|hello|senang|terima kasih|berhasil|bagus|great|thank)\b/.test(clean)) return "happy";
  return "neutral";
}
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
export function poseFor(mode, mood, t, volume = 0, reduced = false) {
  let open = reduced
    ? 1
    : 1 - Math.pow(Math.max(0, Math.cos(((t + 0.8) * 2 * Math.PI) / 5.7)), 100);
  if (mode === "sleeping") open = 0.015;
  if (mode === "waking") open = ease(t / 1.1) * (1 - 0.97 * Math.exp(-((t - 1.35) ** 2) / 0.009));
  const worried = mood === "concerned",
    urgent = mood === "danger",
    warn = mood === "warning",
    happy = mood === "happy";
  const emphasis = mode === "speaking" && !reduced ? Math.sin(t * 0.8) ** 2 * clamp(volume) : 0;
  return {
    open: open * (mood === "surprised" ? 1.12 : worried ? 0.87 : 1),
    brow: urgent ? 1 : warn ? 0.65 : worried ? -1.12 : happy ? -0.3 : 0,
    browLift:
      (mode === "sleeping"
        ? 8
        : mood === "surprised"
          ? -22
          : worried
            ? -6
            : happy
              ? -9
              : urgent
                ? 5
                : 0) -
      emphasis * 3,
    browAsym: mode === "thinking" ? 5 : worried ? 2 : 0,
    smile: happy ? 1 : worried ? -0.65 : urgent ? -0.3 : 0,
    sparkle: mood === "surprised" ? 1 : 0,
    gaze: mode === "thinking" ? 22 : 0,
    beak: mode === "speaking" ? clamp(volume) : 0,
    tilt: reduced
      ? 0
      : mode === "thinking"
        ? -4
        : worried
          ? 2
          : happy
            ? Math.sin(t * 1.7) * 1.4
            : Math.sin(t * 0.75) * 0.5,
    lift: reduced ? 0 : Math.sin(t * (mode === "sleeping" ? 1.4 : 1)) * 3,
    hue: mood === "danger" ? 140 : mood === "warning" ? -165 : 0,
  };
}
export function parts(p) {
  const jaw = (x, y, angle) => {
    const r = (angle * Math.PI) / 180;
    return `${688 + (x - 688) * Math.cos(r) - (y - 918) * Math.sin(r)} ${918 + (x - 688) * Math.sin(r) + (y - 918) * Math.cos(r)}`;
  };
  const eye = (x, y) => {
    const joy = clamp(p.smile),
      alert = clamp(p.brow),
      h = Math.max(2, (108 - alert * 35) * p.open),
      sm = p.smile * 20;
    return `M${x - 48} ${y + sm}C${x - 55} ${y - h} ${x + 43} ${y - h} ${x + 49} ${y + sm}C${x + 32} ${y + h * (1 - joy * 1.65) - sm} ${x - 32} ${y + h * (1 - joy * 1.65) - sm} ${x - 48} ${y + sm}Z`;
  };
  const brow = (x, y, side) => {
    const outer = y + p.browLift - p.brow * 5 + side * p.browAsym,
      inner = y + p.browLift + p.brow * 30 - side * p.browAsym;
    const mid = (outer + inner) / 2 - 12;
    const point = (offset, height) => `${x + side * offset} ${height}`;
    return `M${point(-61, outer)}C${point(-36, mid - 5)} ${point(23, mid - 5)} ${point(61, inner)}Q${point(65, inner + 6)} ${point(59, inner + 10)}C${point(21, mid + 23)} ${point(-34, mid + 23)} ${point(-58, outer + 10)}Q${point(-65, outer + 10)} ${point(-61, outer)}Z`;
  };
  return {
    "head-rig": { transform: `translate(0 ${p.lift}) rotate(${p.tilt} 600 790)` },
    "eye-left": {
      d: eye(431, 759),
      opacity: String(1 - p.sparkle),
      transform: `translate(${p.gaze} 0) rotate(${p.brow * 12} 431 759)`,
    },
    "eye-right": {
      d: eye(744, 750),
      opacity: String(1 - p.sparkle),
      transform: `translate(${p.gaze} 0) rotate(${-p.brow * 12} 744 750)`,
    },
    "star-left": { opacity: String(clamp(p.sparkle * p.open)) },
    "star-right": { opacity: String(clamp(p.sparkle * p.open)) },
    "brow-left": { d: brow(431, 635, 1) },
    "brow-right": { d: brow(744, 626, -1) },
    "glint-left": {
      opacity: String(clamp((p.open - 0.15) * 5) * (1 - clamp(p.smile)) * (1 - p.sparkle)),
      transform: `translate(${p.gaze} 0)`,
    },
    "glint-right": {
      opacity: String(clamp((p.open - 0.15) * 5) * (1 - clamp(p.smile)) * (1 - p.sparkle)),
      transform: `translate(${p.gaze} 0)`,
    },
    "upper-beak": { transform: `rotate(${p.beak * 4} 688 918)` },
    "lower-beak": { transform: `rotate(${-p.beak * 32} 688 918)` },
    "mouth-cavity": {
      opacity: String(clamp(p.beak * 5)),
      d: `M${jaw(548, 951, p.beak * 4)}Q${jaw(550, 950, p.beak * 4)} ${jaw(554, 945, p.beak * 4)}C${jaw(575, 925, p.beak * 4)} ${jaw(610, 908, p.beak * 4)} ${jaw(642, 920, p.beak * 4)}C${jaw(661, 928, p.beak * 4)} ${jaw(680, 929, p.beak * 4)} 688 918C${jaw(680, 929, -p.beak * 32)} ${jaw(661, 928, -p.beak * 32)} ${jaw(642, 920, -p.beak * 32)}C${jaw(610, 908, -p.beak * 32)} ${jaw(575, 925, -p.beak * 32)} ${jaw(554, 945, -p.beak * 32)}Q${jaw(550, 950, -p.beak * 32)} ${jaw(548, 951, -p.beak * 32)}Z`,
    },
  };
}
