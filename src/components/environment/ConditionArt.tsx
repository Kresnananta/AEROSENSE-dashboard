type ArtProps = { scene: string; className?: string; size?: number };
const ink = "#164db3";
const sky = "#75c6fc";
const blue = "#2c89ed";
const ice = "#daefff";
const sun = "#ffcb58";
const teal = "#44b99e";

function Cloud({ night }: { night: boolean }) {
  return <>
    <path d="M35 88a17 17 0 0 1-1-34 24 24 0 0 1 44-6 15 15 0 0 1 21 14 13 13 0 0 1-4 26Z" fill={night ? "#84b1ed" : sky} />
    <path d="M35 80a14 14 0 0 1-1-28 24 24 0 0 1 44-6 15 15 0 0 1 21 14 10 10 0 0 1-4 20Z" fill={night ? "#bbd6ff" : "#f5fcff"} />
    <path d="M38 58a21 21 0 0 1 13-14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </>;
}

function Celestial({ night, behind, warm }: { night: boolean; behind: boolean; warm: boolean }) {
  return <g transform={behind ? "translate(37 -14) scale(.81)" : undefined}>
    {night ? <>
      <path d="M76 35a26 26 0 1 0 21 34A25 25 0 0 1 76 35Z" fill="#fed987" />
      <path d="M100 37v12m-6-6h12" fill="none" stroke="#fdf1c7" strokeWidth="3" strokeLinecap="round" />
    </> : <>
      <path d="M64 21v8m0 70v8m43-43h-8m-70 0h-8m13-29 6 6m48 48 6 6m0-60-6 6M40 89l-6 6" stroke="#efa328" strokeWidth="5" strokeLinecap="round" />
      <circle cx="64" cy="64" r="25" fill={warm ? "#ffb951" : sun} />
      <path d="M48 58a17 17 0 0 1 18-11" fill="none" stroke="#fff0b1" strokeWidth="4" strokeLinecap="round" />
    </>}
  </g>;
}

function Weather({ scene }: { scene: string }) {
  const night = scene.endsWith("-night");
  const clear = scene.startsWith("sunny") || scene === "warm-night";
  const storm = scene.startsWith("storm");
  const fog = scene.startsWith("fog");
  const drizzle = scene.startsWith("drizzle");
  const wet = drizzle || scene.includes("rain") || storm;
  const sunBehind = scene === "partly-cloudy" || (night && !storm && !clear);
  return <>
    {(clear || sunBehind) && <Celestial night={night} behind={sunBehind} warm={scene === "sunny-dusk"} />}
    {!clear && <Cloud night={night || storm} />}
    {fog && <path d="M21 96c17-9 36 6 53 0 11-4 19-5 30-3m-68 12c13-5 31 6 45 1" stroke="#5594d6" strokeWidth="4" strokeLinecap="round" fill="none" />}
    {wet && <g stroke={night ? sky : blue} strokeLinecap="round" strokeWidth={drizzle ? 4 : 5}>
      <path d={drizzle ? "m41 96-3 5m29-4-3 5m29-6-3 5" : "m37 96-5 9m67-9-5 9"} />
      {!drizzle && !storm && <path d={scene.startsWith("light") ? "m68 96-6 9" : "m57 97-7 12m28-12-7 12"} />}
    </g>}
    {storm && <path d="M65 78 51 100h12l-4 15 19-24H66l7-13Z" fill={sun} />}
  </>;
}

function Sensor() {
  return <g transform="rotate(9 64 64)">
    <rect x="29" y="15" width="74" height="99" rx="16" fill={ink} />
    <rect x="25" y="13" width="71" height="95" rx="15" fill={blue} />
    <path d="M32 31v-4q0-7 8-7h39" stroke="#8ad9ff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <rect x="40" y="32" width="41" height="36" rx="7" fill="#e1f6ff" />
    <path d="m46 57 9-12 9 8 10-12" fill="none" stroke="#1972dc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="76" cy="77" r="4" fill="#9cf3d4" />
    <path d="M42 87h16m-16 8h28" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    <circle cx="33" cy="99" r="2.5" fill={ice} /><circle cx="88" cy="22" r="2.5" fill={ice} />
  </g>;
}

function LandscapeArt({ scene }: { scene: string }) {
  if (scene === "soil") return <>
    <path d="M18 73 61 56l48 18v22l-47 17-44-17Z" fill="#a97152" />
    <path d="m18 79 44 15 47-15v12l-47 17-44-17Z" fill="#d89863" />
    <path d="m18 73 44-19 47 20-47 17Z" fill="#688b48" />
    <path d="M62 76c2-18 0-27-13-34m13 21c5-13 10-18 19-24" fill="none" stroke="#cff3a6" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M63 54C44 59 33 43 37 27c18-1 30 12 26 27Z" fill={teal} />
    <path d="M64 56c1-20 16-27 29-25 0 17-11 28-29 25Z" fill="#86d369" />
    <path d="M88 56c-3 6-8 12-8 16a8 8 0 0 0 16 0c0-4-5-10-8-16Z" fill={sky} />
  </>;
  if (scene === "fire" || scene === "fire-night") return <>
    <path d="M12 102 48 53l20 28 19-21 29 42Z" fill="#9abf90" />
    <path d="M30 105c7-23 14-28 31-32 16-4 30 4 39 32Z" fill="#5cae8f" />
    <path d="M64 91c-18 0-30-14-27-29 2-9 9-15 13-21 2 7 5 10 8 11 12-11 14-24 13-33 17 13 23 28 21 44-1 17-11 28-28 28Z" fill="#f77d45" />
    <path d="M63 87c-9-1-15-7-14-15 1-5 5-9 8-12 1 5 4 8 7 8 5-4 7-9 8-15 9 9 11 18 7 25-4 6-9 9-16 9Z" fill={sun} />
  </>;
  if (scene === "flood") return <>
    <path d="M13 92 38 53l30 26 21-43 27 56Z" fill="#81c7aa" />
    <path d="M13 92Q37 73 59 82T115 80v18q-3 9-15 9H29q-13 0-16-15Z" fill={blue} />
    <path d="M31 94c13-6 23 6 34 2 14-6 25-8 35-4" stroke="#ade4ff" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M79 79V55l11-11 12 11v23Z" fill="#fcf5df" />
    <path d="m75 56 15-15 16 15" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>;
  if (scene === "earthquake") return <>
    <path d="M16 83 38 54l18 12 14-33 41 50Z" fill="#88c9e9" />
    <path d="M15 84h98v13l-49 15-49-15Z" fill="#7693b9" />
    <path d="M15 84h98L64 99Z" fill="#b3ccea" />
    <path d="M74 71 59 84l12 8-8 16" fill="none" stroke="#324f81" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 47h20l7-9 8 17 10-30 7 22h15" stroke="#e18b43" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>;
  const haze = scene.startsWith("haze");
  const night = scene.endsWith("-night");
  const wind = haze ? "#e3a96e" : night ? "#b3edff" : "#299cb9";
  return <>
    <Celestial night={night} behind warm={haze} />
    <path d="M16 99q27-17 48-10t49 1v12H16Z" fill="#84cbb1" />
    <rect x="32" y="65" width="20" height="30" rx="4" fill={sky} />
    <rect x="51" y="49" width="25" height="46" rx="5" fill={blue} />
    <rect x="76" y="72" width="17" height="24" rx="4" fill="#96d3ed" />
    <path d="M60 59h7m-7 10h7m-29 4h6m37 8h6" stroke="#e4f5ff" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 80c16-17 36 7 61-4 12-6 17-10 26-8M15 91c16-12 34 5 53 2 11-2 22-12 33-7" stroke={wind} strokeWidth={haze ? 6 : 4} fill="none" strokeLinecap="round" />
  </>;
}

export function ConditionArt({ scene, className, size = 128 }: ArtProps) {
  const landscape = /^(air|haze|soil|fire|flood|earthquake)/.test(scene);
  return <svg className={className} viewBox="0 0 128 128" width={size} height={size} aria-hidden="true" focusable="false">
    {scene === "sensor" ? <Sensor /> : landscape ? <LandscapeArt scene={scene} /> : <Weather scene={scene} />}
  </svg>;
}
