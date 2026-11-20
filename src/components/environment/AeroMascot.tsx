import { useId } from "react";
import { useIllustrationMotion } from "@/hooks/useIllustrationMotion";
import "@/styles/mascot.css";

export type MascotPose = "calm" | "watch" | "alert" | "welcome" | "talk" | "guide" | "success";

export function AeroMascot({ pose = "welcome", className = "", animated = true }: {
  pose?: MascotPose;
  className?: string;
  animated?: boolean;
}) {
  const id = useId();
  const { ref, playing } = useIllustrationMotion<HTMLDivElement>(animated);
  const worried = pose === "watch" || pose === "alert";
  return (
    <div ref={ref} className={`aero-mascot mascot-${pose}${playing ? " is-playing" : ""} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 320 320" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}-shell`} x2=".75" y2="1" gradientUnits="objectBoundingBox">
            <stop stopColor="#74d8ff" /><stop offset=".48" stopColor="#2e90fa" /><stop offset="1" stopColor="#205cce" />
          </linearGradient>
          <linearGradient id={`${id}-wing`} x2=".6" y2="1" gradientUnits="objectBoundingBox">
            <stop stopColor="#4eaefc" /><stop offset="1" stopColor="#1b58ce" />
          </linearGradient>
          <linearGradient id={`${id}-visor`} x2=".25" y2="1" gradientUnits="objectBoundingBox">
            <stop stopColor="#f7fdff" /><stop offset="1" stopColor="#bce9ff" />
          </linearGradient>
        </defs>
        <ellipse className="mascot-ground" cx="159" cy="291" rx="87" ry="12" fill="#18467f" opacity=".18" />
        <g className="mascot-body">
          <path d="M124 258c-6 7-8 14-8 23 0 9 11 12 26 8l16-8-10-28Zm73 0c6 7 8 14 8 23 0 9-11 12-26 8l-16-8 10-28Z" fill="#215ac6" />
          <path d="M103 234c0-38 21-59 57-59s57 21 57 59c0 31-23 49-57 49s-57-18-57-49Z" fill={`url(#${id}-shell)`} />
          <path d="M121 236c0-23 13-41 39-41s39 18 39 41c0 24-13 37-39 37s-39-13-39-37Z" fill={`url(#${id}-visor)`} />
          <path d="M166 217l-16 19h11l-6 14 17-19h-11Z" fill="#1270df" stroke="#1270df" strokeWidth="2" strokeLinejoin="round" />
          <path className="mascot-wing-left" d="M111 196c-11-1-26 7-38 18-11 10-20 25-14 31 7 7 26 1 41-12 11-9 18-21 20-28 1-5-3-8-9-9Z" fill={`url(#${id}-wing)`} />
          <path className="mascot-wing-right" d="M207 196c13-4 27-16 33-27 6-10 10-16 17-13 10 4 10 16 4 30-8 17-24 35-42 40-10 3-17-3-17-12 0-7 2-14 5-18Z" fill={`url(#${id}-wing)`} />
          <g className="mascot-head">
            <path d="M92 119c0-28 24-48 56-50-13-5-25-14-22-21 2-5 10-2 24 2 10 4 19 2 25 0 20-8 36-21 44-13 4 5-6 19-17 28 14-5 24-5 26 0 3 6-5 14-13 18 19 12 30 33 29 62-1 43-29 72-81 72-48 0-79-27-79-68 0-11 2-22 8-30Z" fill={`url(#${id}-shell)`} />
            <path d="M113 110c19-24 51-33 78-27" fill="none" stroke="#c1f3ff" strokeWidth="4" strokeLinecap="round" opacity=".65" />
            <path d="M86 124c-11 0-19 10-19 22v10c0 12 8 21 20 21l6-9v-38Zm153 0c11 0 19 10 19 22v10c0 12-8 21-20 21l-6-9v-38Z" fill="#164dba" />
            <path d="M92 138h-9m154 0h9" stroke="#62d2fd" strokeWidth="3" strokeLinecap="round" />
            <path d="M101 155c0-20 15-34 35-34 9 0 17 4 24 8 7-4 15-8 24-8 22 0 36 14 36 34 0 27-26 47-60 47-33 0-59-20-59-47Z" fill={`url(#${id}-visor)`} />
            {worried && <path d={pose === "alert" ? "M119 139l17 5m48 0 17-5" : "M118 141c5 0 11-2 17-7m50 0c6 5 12 7 17 7"} stroke="#2465bd" strokeWidth="4" strokeLinecap="round" fill="none" />}
            <g className="mascot-eyes" fill="#122e59">
              {pose === "success" ? <path d="M122 158q7-12 14 0m48 0q7-12 14 0" fill="none" stroke="#122e59" strokeWidth="4.5" strokeLinecap="round" /> : <>
                <ellipse cx="128" cy="156" rx={worried ? 5.5 : 7} ry="9" />
                <ellipse cx="192" cy="156" rx={worried ? 5.5 : 7} ry="9" />
                <circle cx="130" cy="153" r="2.4" fill="white" /><circle cx="194" cy="153" r="2.4" fill="white" />
              </>}
            </g>
            <path d="M111 173h8m82 0h8" stroke={worried ? "#ed9f6d" : "#8ed4ff"} strokeWidth="4" strokeLinecap="round" />
            <path d={worried ? "M148 176q12-11 24 0-4 6-12 7-8-1-12-7Z" : "M147 171q13-9 26 0-3 15-13 15t-13-15Z"} fill="#f2972f" />
            <path d="M147 170q13-10 26 0-13 7-26 0Z" fill="#ffce5a" />
          </g>
        </g>
      </svg>
    </div>
  );
}
