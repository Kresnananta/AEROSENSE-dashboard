import { divIcon } from "leaflet";
import { mapDrawings } from "./map-drawings";

const icons = new Map<string, ReturnType<typeof divIcon>>();
const sensorTones = new Set(["calm", "warning", "danger"]);
export function mapIcon(kind: keyof typeof mapDrawings, tone: string = kind, active = false) {
  const key = `${kind}-${tone}-${active}`;
  if (!icons.has(key))
    icons.set(
      key,
      divIcon({
        className: "aerosense-map-marker",
        html: `<span class="map-pin pin-${kind}${sensorTones.has(tone) ? ` tone-${tone}` : ""}${active ? " is-active" : ""}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${mapDrawings[kind]}</svg></span>`,
        iconSize: [36, 40],
        iconAnchor: [18, 38],
        popupAnchor: [0, -36],
        tooltipAnchor: [0, -35],
      }),
    );
  return icons.get(key)!;
}
