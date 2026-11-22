const mapDrawings = {
  watersense: '<path d="M12 2.5C8.8 7 5.8 10.4 5.8 14a6.2 6.2 0 0 0 12.4 0c0-3.6-3-7-6.2-11.5Z" fill="currentColor" stroke="none"/><path class="map-pin-cut" d="M9 14.2a3.4 3.4 0 0 0 2.4 3.2"/>',
  sensor: `<image class="sensor-pin-mark" href="${import.meta.env.BASE_URL}assets/brand/aerosense-mark.png" width="24" height="24"/>`,
  fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  earthquake:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
};

export type MapPinKind = keyof typeof mapDrawings;

export function mapPinArt(kind: MapPinKind, showStatus = false, magnitude = "") {
  return `<svg class="map-pin-art" viewBox="0 0 36 44" aria-hidden="true">
    <path class="map-pin-shape" d="M18 2C9.7 2 3 8.7 3 17c0 8 7 15.6 13.5 24a1.9 1.9 0 0 0 3 0C26 32.6 33 25 33 17 33 8.7 26.3 2 18 2Z"/>
    ${magnitude
      ? `<text class="map-quake-number" x="18" y="20" text-anchor="middle"><tspan class="map-quake-unit">M </tspan>${magnitude}</text>`
      : `<svg x="9" y="8" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${mapDrawings[kind]}</svg>`}
    ${showStatus ? '<circle class="map-pin-status" cx="29" cy="9" r="3.5"/>' : ""}
  </svg>`;
}
