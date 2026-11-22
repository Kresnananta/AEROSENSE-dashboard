import { environmentGlyphs } from "@/lib/aero-glyphs";

const mapDrawings = {
  watersense: `<path d="${environmentGlyphs.water}"/>`,
  sensor: `<image class="sensor-pin-mark" href="${import.meta.env.BASE_URL}assets/brand/aerosense-mark.png" width="24" height="24"/>`,
  fire: `<path d="${environmentGlyphs.heat}"/>`,
  earthquake: `<path d="${environmentGlyphs.quake}"/>`,
};

export type MapPinKind = keyof typeof mapDrawings;

export function mapPinArt(kind: MapPinKind, showStatus = false, magnitude = "") {
  return `<svg class="map-pin-art" viewBox="0 0 36 44" aria-hidden="true">
    <path class="map-pin-shape" d="M18 2C9.7 2 3 8.7 3 17c0 8 7 15.6 13.5 24a1.9 1.9 0 0 0 3 0C26 32.6 33 25 33 17 33 8.7 26.3 2 18 2Z"/>
    ${magnitude
      ? `<text class="map-quake-number" x="18" y="20" text-anchor="middle"><tspan class="map-quake-unit">M </tspan>${magnitude}</text>`
      : `<svg class="map-pin-glyph" x="9" y="8" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${mapDrawings[kind]}</svg>`}
    ${showStatus ? '<circle class="map-pin-status" cx="29" cy="9" r="3.5"/>' : ""}
  </svg>`;
}
