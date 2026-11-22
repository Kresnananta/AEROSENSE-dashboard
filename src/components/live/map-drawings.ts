const mapDrawings = {
  watersense: '<path d="M12 3c-2.8 4.1-6 7-6 11a6 6 0 0 0 12 0c0-4-3.2-6.9-6-11Z"/><path d="M9 14a3 3 0 0 0 2 2.8"/>',
  sensor: '<path d="M12 11v9m-4 0h8M8 6a5.7 5.7 0 0 0 0 7m8-7a5.7 5.7 0 0 1 0 7M5 3a9.9 9.9 0 0 0 0 13M19 3a9.9 9.9 0 0 1 0 13"/><circle cx="12" cy="9" r="1.8" fill="currentColor" stroke="none"/>',
  fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  earthquake:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
};

export type MapPinKind = keyof typeof mapDrawings;

export function mapPinArt(kind: MapPinKind, showStatus = false) {
  return `<svg class="map-pin-art" viewBox="0 0 36 44" aria-hidden="true">
    <path class="map-pin-shape" d="M18 2C9.7 2 3 8.7 3 17c0 8 7 15.6 13.5 24a1.9 1.9 0 0 0 3 0C26 32.6 33 25 33 17 33 8.7 26.3 2 18 2Z"/>
    <svg x="9" y="8" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${mapDrawings[kind]}</svg>
    ${showStatus ? '<circle class="map-pin-status" cx="29" cy="9" r="3.5"/>' : ""}
  </svg>`;
}
