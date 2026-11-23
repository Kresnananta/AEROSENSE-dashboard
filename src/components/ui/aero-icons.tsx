import type { ComponentPropsWithRef } from "react";

import { environmentGlyphs } from "@/lib/aero-glyphs";

type IconProps = ComponentPropsWithRef<"svg"> & { size?: number | string };
export type AeroIcon = (props: IconProps) => React.JSX.Element;

function renderIcon(
  { size = 24, className, children, ...props }: IconProps,
  stroke: string,
  accent?: string,
) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? "aero-icon " + className : "aero-icon"}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {accent && <path d={accent} fill="currentColor" fillOpacity=".2" stroke="none" />}
      <path d={stroke} />
      {children}
    </svg>
  );
}

export function Activity(props: IconProps) { return renderIcon(props, environmentGlyphs.quake, "M4 13l3-4 3 1 4-5 6 7L17 15l-4-2-3 3Z"); }
export function ArrowRight(props: IconProps) { return renderIcon(props, "M4 12h15m-5.5-5.5L19 12l-5.5 5.5"); }
export function ArrowUp(props: IconProps) { return renderIcon(props, "M12 20V4m-5.5 5.5L12 4l5.5 5.5"); }
export function ArrowUpRight(props: IconProps) { return renderIcon(props, "M5.5 18.5 18.5 5.5m-8 0h8v8"); }
export function Bell(props: IconProps) {
  return renderIcon(props,
    "M4 17.6c1.8-1.6 2.4-3 2.4-6.1V9a5.6 5.6 0 0 1 11.2 0v2.5c0 3.1.6 5 2.4 6.1H4Zm5.7 2.9a2.9 2.9 0 0 0 4.6 0 M12 2v1.4", "M12 4c-3.4 0-5 2.1-5 5v4h5Z",
  );
}
export function Building2(props: IconProps) { return renderIcon(props, "M4 21V8l9-4v17M2.5 21h19M13 10h6.5v11M7.5 10.5h2m-2 4h2m-2 4h2m6.5-5h.8m-.8 4h.8", "M4 8l9-4v4L4 12Z"); }
export function CheckIcon(props: IconProps) { return renderIcon(props, "m5.2 12.5 4.5 4.5 9-10"); }
export function CircleCheck(props: IconProps) { return renderIcon(props, "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Zm-13-.2 2.7 2.6 5-5.2"); }
export function ChevronDown(props: IconProps) { return renderIcon(props, "m6 9.2 5.3 5.4a1 1 0 0 0 1.4 0L18 9.2"); }
export function ChevronRight(props: IconProps) { return renderIcon(props, "m9.2 6 5.4 5.3a1 1 0 0 1 0 1.4L9.2 18"); }
export function ChevronUpIcon(props: IconProps) { return renderIcon(props, "m6 14.8 5.3-5.4a1 1 0 0 1 1.4 0l5.3 5.4"); }
export function CircleAlert(props: IconProps) { return renderIcon(props, "M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9ZM12 7.5v5m0 3.8v.1"); }
export function Clock3(props: IconProps) {
  return renderIcon(props,
    "M20.6 12A8.6 8.6 0 1 1 12 3.4a8.6 8.6 0 0 1 8.6 8.6ZM12 6.7v5.5h4.1 M6 4l1.2-1.2", "M12 3.4V12h8.6A8.6 8.6 0 0 0 12 3.4Z",
  );
}
export function CloudLightning(props: IconProps) { return renderIcon(props, "M8 15H7a4.4 4.4 0 0 1-.9-8.7 5.6 5.6 0 0 1 10.8-.6 4.5 4.5 0 0 1 .7 9H16 M12 11l-3 5h3l-2 5 5-6h-3Z"); }
export function CloudOff(props: IconProps) { return renderIcon(props, "m3 3 18 18 M8 16H6.8a4.5 4.5 0 0 1-2.2-8.5 M8.4 5.6a5.6 5.6 0 0 1 8.3 1.1 4.7 4.7 0 0 1 3.5 7.4"); }
export function CloudRain(props: IconProps) {
  return renderIcon(props,
    "M7 13.5a4 4 0 0 1-.7-8 5.1 5.1 0 0 1 9.7.4 3.9 3.9 0 1 1 1 7.6H7Zm1 3.2-1 3.1m5-2.7-1 3.2m5-3.6-1 3.1", "M5 11h14l-2 2.5H7Z",
  );
}
export function CloudRainWind(props: IconProps) { return renderIcon(props, "M6.8 13a4 4 0 0 1-.5-8 5 5 0 0 1 9.7.4 3.8 3.8 0 1 1 1 7.5h-3.5M7 16l-1 3m4-2h10m-6 4h5"); }
export function CloudSnow(props: IconProps) { return renderIcon(props, "M6.8 13a4 4 0 0 1-.5-8 5 5 0 0 1 9.7.4 3.8 3.8 0 1 1 1 7.5H7 M12 15v7m-3-5.3 6 3.5m0-3.5-6 3.5"); }
export function CloudSun(props: IconProps) {
  return renderIcon(props,
    "M8 11a3 3 0 1 1 3-3 M8 2v1.5 M3.76 3.76l1.06 1.06 M2 8h1.5 M8 20a3.5 3.5 0 0 1 0-7c.5 0 .9.1 1.3.3A5 5 0 0 1 19 14.4a2.8 2.8 0 0 1 0 5.6Z",
  );
}
export function Download(props: IconProps) { return renderIcon(props, "M12 3.5v11m-4-3.7 4 4 4-4M4.5 15.5v3.4c0 .8.7 1.6 1.6 1.6h11.8c.9 0 1.6-.8 1.6-1.6v-3.4"); }
export function Droplets(props: IconProps) {
  return renderIcon(props,
    environmentGlyphs.water + " M18.2 4.4c.9 1.3 2.2 2.4 2.2 3.6a2 2 0 0 1-1.4 2", "M12 9v11.2c-3.5 0-5.8-2.5-5.8-5.9 0-1.5.7-2.6 2-4.4Z",
  );
}
export function Ear(props: IconProps) {
  return renderIcon(props,
    "M6 10.2a6 6 0 1 1 12 0c0 3.8-4.2 4.4-4.3 7.4-.1 2-1.2 3.3-3.1 3.3-1.7 0-2.7-1.1-2.9-2.4m1.3-8.4a3 3 0 1 1 6 0c0 1.5-1.2 2.1-2.2 2.8",
  );
}
export function ExternalLink(props: IconProps) { return renderIcon(props, "M13 4.5h6.5V11m0-6.5-8 8m7 1V19H5V5.5h5.5"); }
export function FileText(props: IconProps) { return renderIcon(props, "M6 3.5h8.5l4.3 4.6V20.5H6V3.5Zm8.1.4v4.7h4.5M9 12.5h6.6m-6.6 4h5", "M14 3.8v5h4.7Z"); }
export function FileSpreadsheet(props: IconProps) { return renderIcon(props, "M5.5 3.5h9l4 4.7v12.3h-13V3.5Zm8.6.6V8.5h4M8 11.5h8v5.8H8zm4 0v5.8m-4-3h8", "M14 3.5v5h4.5Z"); }
export function Flame(props: IconProps) {
  return renderIcon(props,
    environmentGlyphs.heat, "M11.6 11.7c3-3.3 1.9-5.6.6-8.3 2.4 3.2 5.5 5.9 6.6 9 .9 2.6-.5 5.6-2.7 6.8.3-3.9-1.5-5.3-4.5-7.5Z",
  );
}
export function Footprints(props: IconProps) {
  return renderIcon(props,
    "M8 9.3C6.6 9.6 5.5 8 5.1 6.4 4.6 4.5 5.4 3 6.6 2.8c1.5-.2 2.6 1.6 2.9 3.1C9.8 7.4 9 9.1 8 9.3Zm1.1 2.5c1.1-.3 1.8.7 2 1.8.3 1.2-.4 2-1.3 2.1-1 .2-1.8-.8-2-1.8-.2-1 .3-1.9 1.3-2.1Zm6.5 2.6c-1.2-.3-1.8-1.8-1.5-3.6.3-1.6 1.4-3.2 2.7-3 1.3.2 2 1.8 1.6 3.6-.3 1.7-1.6 3.3-2.8 3Zm-1.1 2.4c1 .3 1.4 1.2 1.1 2.4-.3 1.2-1.1 1.9-2 1.6-1-.2-1.4-1.2-1.1-2.3.3-1.2 1-1.9 2-1.7Z",
  );
}
export function Hand(props: IconProps) {
  return renderIcon(props,
    "M7 12V7.5a1.3 1.3 0 0 1 2.6 0v3.1-5a1.3 1.3 0 0 1 2.6 0V10 4.8a1.3 1.3 0 0 1 2.6 0v5-3.2a1.3 1.3 0 0 1 2.6 0v7.3c0 4-2.4 6.6-5.7 6.6-2.6 0-4.2-1.4-5.5-3.4l-2-3.1c-.8-1.5.8-2.4 2-1.3l2 1.9 M20 7.5l1.5-1.1",
  );
}
export function HeartHandshake(props: IconProps) {
  return renderIcon(props,
    "M12 20.4 4 13a4.5 4.5 0 1 1 6.3-6.3L12 8.4l1.7-1.7a4.5 4.5 0 1 1 6.3 6.3L12 20.4Z M12 8.4l-2.5 2.5c-1 1 .2 2.7 1.5 1.8l1.7-1.2 4.4 4.3 M8 16l2.4-2.3",
  );
}
export function LayoutGrid(props: IconProps) { return renderIcon(props, "M4 4.5h7v6.8H4zm9.7 0H20v6.8h-6.3zM4 14h7v5.5H4zm9.7 0H20v5.5h-6.3z", "M4 4.5h7v6.8H4Z"); }
export function Leaf(props: IconProps) {
  return renderIcon(props,
    "M20.4 4.1c-5.4 1.8-11.4-.2-14.1 5.5C3.8 14.9 8 19.7 13 17.9c5.8-2 6.7-7.6 7.4-13.8ZM3.8 20.3l9.2-8.6m-5 4.6-.6-4.3", "M20.4 4.1c-5 5.5-9 8.6-13.5 13 1.4 1.3 3.5 1.6 6.1.8 5.8-2 6.7-7.6 7.4-13.8Z",
  );
}
export function LineChart(props: IconProps) { return renderIcon(props, "M4 4v15.5h16M7.2 14.9l4.2-5 3.6 2.8 4.5-6m-3.6 0h3.6v3.8"); }
export function LoaderCircle(props: IconProps) { return renderIcon(props, "M20.5 12a8.5 8.5 0 1 1-8.5-8.5"); }
export function LocateFixed(props: IconProps) {
  return renderIcon(props,
    "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0-2v4m0 12v4M2 12h4m12 0h4m-7.4 0a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0Z", "M14.6 12a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0Z",
  );
}
export function Lock(props: IconProps) {
  return renderIcon(props,
    "M6 10h12a1 1 0 0 1 1 1v8.1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1Zm2-1V7a4 4 0 1 1 8 0v2m-4 5v2.8", "M5 17h14v3H5Z",
  );
}
export function LockKeyhole(props: IconProps) {
  return renderIcon(props,
    "M6 10h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm2-.5V7a4 4 0 1 1 8 0v2.5m-4 6v1.5m1.3-2.6a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0Z",
  );
}
export function Mail(props: IconProps) {
  return renderIcon(props,
    "M5 5.5h14a1.4 1.4 0 0 1 1.4 1.4v10.2a1.4 1.4 0 0 1-1.4 1.4H5a1.4 1.4 0 0 1-1.4-1.4V6.9A1.4 1.4 0 0 1 5 5.5Zm-.6 2.4 7.6 5.2 7.6-5.2", "M4 6h16l-8 6.6-8-5.4Z",
  );
}
export function Map(props: IconProps) {
  return renderIcon(props,
    "m3.5 6.5 5.6-2.4 5.8 2.4 5.6-2.4v13.4l-5.6 2.4-5.8-2.4-5.6 2.4V6.5Zm5.6-2.4v13.4m5.8-11v13.4", "m9.1 4.1 5.8 2.4v13.4l-5.8-2.4Z",
  );
}
export function MapPin(props: IconProps) {
  return renderIcon(props,
    "M12 21c-1.8-2.3-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-4.7 8.7-6.5 11ZM14.3 10a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0Z", "M14.3 10a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0Z",
  );
}
export function Menu(props: IconProps) { return renderIcon(props, "M5 6.8h14M5 12h10M5 17.2h14"); }
export function MessageCircle(props: IconProps) {
  return renderIcon(props,
    "M20.5 11.5a8.7 8.7 0 0 1-8.7 8.2 9.4 9.4 0 0 1-3.4-.6L4 20l.9-4a7.7 7.7 0 0 1-1.4-4.5 8.5 8.5 0 0 1 17 0Zm-12-.7h7.5m-7.5 3.4h4.1", "M5 15.5c3.4 2 7.4 2.9 12.4 1.9-2.3 2.4-5.6 2.6-9 1.6l-4.4 1Z",
  );
}
export function Mic(props: IconProps) {
  return renderIcon(props,
    "M9 6.2a3 3 0 0 1 6 0v5.3a3 3 0 0 1-6 0V6.2Zm-3.2 5a6.2 6.2 0 0 0 12.4 0M12 17.4v3.2m-3.2 0h6.4", "M9 9h6v2.5a3 3 0 0 1-6 0Z",
  );
}
export function MicOff(props: IconProps) {
  return renderIcon(props,
    "m3 3 18 18M9 9.1v2.4a3 3 0 0 0 4.5 2.6M9.4 4.8a3 3 0 0 1 5.6 1.4v4.6m-9.2.4a6.2 6.2 0 0 0 10.2 4.7m2.1-3.5.1-1.2M12 17.4v3.2m-3.2 0h6.4",
  );
}
export function Mountain(props: IconProps) { return renderIcon(props, environmentGlyphs.slope, "M2.8 19.6 9.8 5 8.3 15.8l3.3 3.8Z"); }
export function Navigation(props: IconProps) { return renderIcon(props, "M19.5 4.5 3.8 11.2l7 2 2 7 6.7-15.7ZM11 13.1l4.4-4.4", "M19.5 4.5 11 13.1l2 7.1Z"); }
export function OctagonAlert(props: IconProps) { return renderIcon(props, "M8 3.5h8l4.5 4.5v8L16 20.5H8L3.5 16V8L8 3.5Zm4 4.5v5m0 3.3v.1"); }
export function Pause(props: IconProps) { return renderIcon(props, "M9 5.5v13m6-13v13"); }
export function Phone(props: IconProps) {
  return renderIcon(props,
    "M8.2 4.2c1.3 1.7 2.2 3.2 1.2 4.3L8 9.9c1.2 2.5 3.6 4.9 6.1 6.1l1.5-1.4c1-1 2.7-.1 4.3 1.2.9.6 1 1.9.2 2.9-1.1 1.6-3.5 2-6.1.9-4.4-1.8-7.9-5.3-9.7-9.8-1.1-2.6-.7-5 1-6.1 1-.8 2.2-.6 2.9.5Z",
  );
}
export function Play(props: IconProps) { return renderIcon(props, "M8 5.4 19 12 8 18.7V5.4Z", "M8 5.4 19 12 8 18.7Z"); }
export function Plus(props: IconProps) { return renderIcon(props, "M5 12h14M12 5v14"); }
export function Radio(props: IconProps) {
  return renderIcon(props,
    "M4.7 17.4a8 8 0 0 1 0-10.8m3 8.3a4.5 4.5 0 0 1 0-5.8m8.6 0a4.5 4.5 0 0 1 0 5.8m3-8.3a8 8 0 0 1 0 10.8M12 10l2 2-2 2-2-2 2-2Z", "M12 10l2 2-2 2-2-2Z",
  );
}
export function RefreshCw(props: IconProps) { return renderIcon(props, "M19.8 9a8.2 8.2 0 0 0-13-3L4.4 8.4m0-4.2v4.2h4.2m-4.4 6.4a8.2 8.2 0 0 0 13 3l2.4-2.4m0 4.3v-4.3h-4.2"); }
export function Save(props: IconProps) { return renderIcon(props, "M5 3.8h11.6l3.5 3.4V20H4V4.8c0-.5.4-1 1-1Zm2 0v5.5h8.3V3.8M7.5 20v-6.3h9V20", "M7 3.8h8.3v5.5H7Z"); }
export function Search(props: IconProps) { return renderIcon(props, "M16.1 10.5a5.6 5.6 0 1 1-11.2 0 5.6 5.6 0 0 1 11.2 0Zm-1.5 4.2 4.8 4.8"); }
export function Send(props: IconProps) { return renderIcon(props, "m20.5 3.8-6.7 16.7-3.4-7-6.9-3.2 17-6.5Zm-10.1 9.7 5.8-5.7", "m20.5 3.8-6.7 16.7-3.4-7Z"); }
export function Settings(props: IconProps) {
  return renderIcon(props,
    "m8 4 .4 2.4-2 2.1L4 8.1 3 11l2 1.4v2L3.7 16l2.2 2.4 2.3-.7 1.7 1.1.5 2.2h3.2l.5-2.2 1.7-1.1 2.3.7 2.2-2.4-1.3-1.6v-2l2-1.4-.9-2.9-2.4.3-2-2.1L16 4l-3.2-1.1-1.4 1.8H10L8 4Zm7 8.4a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  );
}
export function Settings2(props: IconProps) {
  return renderIcon(props,
    "M4 6.5h8m4.5 0H20M4 12h3m4.5 0H20M4 17.5h10m4.5 0H20 M16.5 6.5a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0Zm-5 5.5a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0Zm7 5.5a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0Z",
  );
}
export function ShieldCheck(props: IconProps) {
  return renderIcon(props,
    "M4.7 6.2 12 3.5l7.3 2.7v5.2c0 4.5-3.2 7.2-7.3 9-4.1-1.8-7.3-4.5-7.3-9V6.2Zm4.6 5.7 1.8 1.9 3.7-3.7", "M12 3.5v16.9c4.1-1.8 7.3-4.5 7.3-9V6.2Z",
  );
}
export function Sprout(props: IconProps) {
  return renderIcon(props,
    "M12 18.5v-7m0 3.5c-5.3.3-8.1-2-8.5-6.2 4.4-.2 7.1 1.1 8.5 3.9m0-.4c-.3-5.4 2.5-8.1 7.5-8.5-.1 4.9-2.7 7.5-7.5 8.5M6.5 20.5c3.4-2 7.6-2 11 0", "M12 12.3c-.3-5.4 2.5-8.1 7.5-8.5-.6 2.4-2.4 5.5-7.5 8.5Z",
  );
}
export function Square(props: IconProps) { return renderIcon(props, "M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"); }
export function Sun(props: IconProps) {
  return renderIcon(props,
    "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17m10-10 1.4-1.4", "M12 8v8a4 4 0 1 0 0-8Z",
  );
}
export function Thermometer(props: IconProps) { return renderIcon(props, "M10 14.2V5.8a2 2 0 1 1 4 0v8.4a3.8 3.8 0 1 1-4 0Zm2-4v7.2m5-10.5h2m-2 3.1h2"); }
export function Tornado(props: IconProps) {
  return renderIcon(props,
    "M3.3 6.5c2.1-2.2 10.3-2.9 15.2-.4 3.4 1.8 1.4 4.4-3.4 4.3-4.7-.2-7.6-1.2-8.2.4-.6 1.7 4.2 2.1 7 2.4 4 .4 3.8 2.3.5 3.1-2 .4-4 .4-5.2 1.5 M8.6 20.5h2.1",
  );
}
export function TriangleAlert(props: IconProps) { return renderIcon(props, "m11 4.6-8.1 14a1.2 1.2 0 0 0 1 1.8h16.2a1.2 1.2 0 0 0 1-1.8L13 4.6a1.2 1.2 0 0 0-2 0ZM12 9.4v4.8m0 3.2v.1"); }
export function Umbrella(props: IconProps) {
  return renderIcon(props,
    "M3 12.2a9 9 0 0 1 18 0c-2-1.2-4-1.2-6 0-2-1.2-4-1.2-6 0-2-1.2-4-1.2-6 0Zm9-1v7a1.8 1.8 0 1 0 3.6 0M12 2.5v1", "M12 3.5a9 9 0 0 0-9 8.7c2-1.2 4-1.2 6 0 0-4.3 1.4-7 3-8.7Z",
  );
}
export function User(props: IconProps) { return renderIcon(props, "M15.5 8a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 20c.4-4 2.8-6 7-6s6.6 2 7 6"); }
export function Volume2(props: IconProps) {
  return renderIcon(props,
    "M4.5 9h3l4-3.7v13.4l-4-3.7h-3V9Zm10.5.3a4 4 0 0 1 0 5.4m2.7-8.1a7.7 7.7 0 0 1 0 10.8", "M7.5 9l4-3.7v13.4l-4-3.7Z",
  );
}
export function Waves(props: IconProps) { return renderIcon(props, environmentGlyphs.flow, "M3 17c4-2 6-2 9 1 2 2 5 2 8 0v2H3Z"); }
export function Wind(props: IconProps) { return renderIcon(props, "M3.3 7.2H13c3.1 0 3.2-4.1.1-4 M3 11.6h14c3.6 0 4.5-4.8 1.3-5.5M5.8 16h7.3c3.4 0 3.4 4.5.3 4.5"); }
export function X(props: IconProps) { return renderIcon(props, "m6.5 6.5 11 11m0-11-11 11"); }

export {
  CircleCheck as CheckCircle2,
  ChevronDown as ChevronDownIcon,
  LoaderCircle as Loader2,
  User as UserRound,
  X as XIcon,
};
