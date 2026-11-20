import { Link } from "react-router-dom";
import { AeroMascot } from "@/components/environment/AeroMascot";
import { useDayPeriod } from "@/hooks/useDayPeriod";
import { ROUTES } from "@/lib/constants";

export function AuthStory({ confirmed = false }: { confirmed?: boolean }) {
  const dayPeriod = useDayPeriod();
  return (
    <aside className="login-story" data-day-period={dayPeriod}>
      <Link to={ROUTES.HOME} className="login-brand" aria-label="AEROSENSE">
        <img src="/assets/brand/aerosense-mark.png" width="38" height="38" alt="" />
        <span>AERO<strong>SENSE</strong></span>
      </Link>
      <p className="login-story-copy">Pahami lingkungan sekitar.</p>
      <AeroMascot pose={confirmed ? "success" : "welcome"} className="login-scene" />
    </aside>
  );
}
