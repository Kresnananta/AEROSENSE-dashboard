import { divIcon } from "leaflet";
import { mapPinArt, type MapPinKind } from "./map-drawings";

const icons = new Map<string, ReturnType<typeof divIcon>>();
const sensorTones = new Set(["calm", "warning", "danger"]);
export function mapIcon(kind: MapPinKind, tone: string = kind, active = false) {
  const key = `${kind}-${tone}-${active}`;
  const showStatus = kind === "sensor" && sensorTones.has(tone);
  if (!icons.has(key))
    icons.set(
      key,
      divIcon({
        className: "aerosense-map-marker",
        html: `<span class="map-pin pin-${kind}${showStatus ? ` tone-${tone}` : ""}${active ? " is-active" : ""}" aria-hidden="true">${mapPinArt(kind, showStatus)}</span>`,
        iconSize: [36, 44],
        iconAnchor: [18, 42],
        popupAnchor: [0, -40],
        tooltipAnchor: [0, -39],
      }),
    );
  return icons.get(key)!;
}
