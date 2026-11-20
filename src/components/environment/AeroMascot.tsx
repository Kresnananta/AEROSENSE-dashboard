import { useIllustrationMotion } from "@/hooks/useIllustrationMotion";
import "@/styles/mascot.css";

export type MascotPose = "calm" | "watch" | "alert" | "welcome" | "talk" | "guide" | "success";

export function AeroMascot({ pose = "welcome", className = "", animated = true, greeting }: {
  pose?: MascotPose;
  className?: string;
  animated?: boolean;
  greeting?: boolean;
}) {
  const { ref, playing } = useIllustrationMotion<HTMLDivElement>(animated);
  return (
    <div ref={ref} className={["aero-mascot", playing && "is-playing", greeting && "mascot-greet", className].filter(Boolean).join(" ")} aria-hidden="true">
      <img className="mascot-pose" src={"/assets/aerobot/falcon/" + pose + ".webp"} alt="" width={320} height={320} decoding="async" />
      {greeting !== undefined && pose !== "welcome" && (
        <img className="mascot-wave" src="/assets/aerobot/falcon/welcome.webp" alt="" width={320} height={320} decoding="async" />
      )}
    </div>
  );
}
