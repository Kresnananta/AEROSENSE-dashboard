import { useId, type CSSProperties } from "react";
import { useIllustrationMotion } from "@/hooks/useIllustrationMotion";
import "@/styles/mascot.css";

export type MascotPose = "calm" | "watch" | "alert" | "welcome" | "talk" | "guide" | "success";

const wavePose = "/assets/aerobot/falcon/welcome.webp";
const arm = "M562 300 680 286 686 376 646 433 582 449 548 406 557 378 568 349Z";
const rays = "M485 67H654V231H550L520 215 488 163Z";
export const GREETING_MS = 1420;

function MascotWave() {
  const id = useId();
  return (
    <svg className="mascot-wave" viewBox="0 0 720 720" focusable="false">
      <defs>
        <clipPath id={id + "-body"}>
          <path d={"M0 0H720V720H0Z " + arm + " " + rays} clipRule="evenodd" />
        </clipPath>
        <clipPath id={id + "-arm"}><path d={arm} /></clipPath>
        <clipPath id={id + "-rays"}><path d={rays} /></clipPath>
      </defs>
      <g className="mascot-wave-move">
        <image href={wavePose} width={720} height={720} clipPath={"url(#" + id + "-body)"} />
        <image className="mascot-wave-arm" href={wavePose} width={720} height={720} clipPath={"url(#" + id + "-arm)"} />
        <image className="mascot-wave-rays" href={wavePose} width={720} height={720} clipPath={"url(#" + id + "-rays)"} />
      </g>
    </svg>
  );
}

export function AeroMascot({ pose = "welcome", className = "", animated = true, greeting }: {
  pose?: MascotPose;
  className?: string;
  animated?: boolean;
  greeting?: boolean;
}) {
  const { ref, playing } = useIllustrationMotion<HTMLDivElement>(animated);
  return (
    <div ref={ref} className={["aero-mascot", playing && "is-playing", greeting && "mascot-greet", className].filter(Boolean).join(" ")} aria-hidden="true"
      style={greeting !== undefined ? { "--greeting-time": GREETING_MS + "ms" } as CSSProperties : undefined}>
      <div className="mascot-frame">
        <img key={pose} className="mascot-pose" src={"/assets/aerobot/falcon/" + pose + ".webp"} alt="" width={320} height={320} decoding="async" />
      </div>
      {greeting !== undefined && <MascotWave />}
    </div>
  );
}
