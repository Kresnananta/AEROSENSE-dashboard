import { divIcon } from "leaflet";
import { formatQuakeMagnitude } from "@/lib/environment-presentation";
import { mapPinArt, type MapPinKind } from "./map-drawings";

const icons = new Map<string, ReturnType<typeof divIcon>>();
const sensorTones = new Set(["calm", "warning", "danger"]);
const pinGeometry = {
  iconSize: [36, 44] as [number, number],
  iconAnchor: [18, 42] as [number, number],
  popupAnchor: [0, -40] as [number, number],
  tooltipAnchor: [0, -39] as [number, number],
};
export function earthquakeIcon(magnitude: number | null | undefined) {
  const amount = formatQuakeMagnitude(magnitude);
  if (!amount || magnitude == null) return mapIcon("earthquake");

  const key = "quake-" + amount;
  if (!icons.has(key)) {
    const rippleSize = Math.round(36 + (Math.max(4, Math.min(8, magnitude)) - 4) * 13);
    icons.set(key, divIcon({
      className: "aerosense-map-marker quake-marker",
      html: `<span class="map-pin pin-earthquake" aria-hidden="true">
        <span class="map-quake-ripple" style="--quake-size:${rippleSize}px"></span>
        ${mapPinArt("earthquake", false, amount)}
      </span>`,
      ...pinGeometry,
    }));
  }
  return icons.get(key)!;
}

export function earthquakeGroupIcon(count: number) {
  const key = "quake-group-" + count;
  if (!icons.has(key)) {
    icons.set(key, divIcon({
      className: "aerosense-map-marker quake-group-marker",
      html: `<span class="map-pin pin-earthquake map-quake-group" aria-hidden="true">${count}</span>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    }));
  }
  return icons.get(key)!;
}

export function mapIcon(kind: MapPinKind, tone: string = kind, active = false) {
  const key = `${kind}-${tone}-${active}`;
  const showStatus = kind === "sensor" && sensorTones.has(tone);
  if (!icons.has(key))
    icons.set(
      key,
      divIcon({
        className: "aerosense-map-marker",
        html: `<span class="map-pin pin-${kind}${showStatus ? ` tone-${tone}` : ""}${active ? " is-active" : ""}" aria-hidden="true">${mapPinArt(kind, showStatus)}</span>`,
        ...pinGeometry,
      }),
    );
  return icons.get(key)!;
}
