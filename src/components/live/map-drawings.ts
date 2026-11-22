const deviceShell = '<rect class="device-shell" x="3.5" y="2" width="17" height="20" rx="4"/><rect class="device-screen" x="6.5" y="5" width="11" height="10.5" rx="2" stroke-width="1"/><path d="M10.5 18.5h3" stroke-width="1.5"/>';

export const mapDrawings = {
  watersense: deviceShell +
    '<path class="device-drop" d="M12 7.5c-1.3 1.7-2.7 3-2.7 4a2.7 2.7 0 0 0 5.4 0c0-1-1.4-2.3-2.7-4Z" stroke-width="1.25"/>',
  sensor: deviceShell +
    '<path class="device-wave" pathLength="1" d="M8.5 11h1.4l1.5-2.5 1.5 4.1 1.4-1.6h1.2" stroke-width="1.4"/>',
  fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  earthquake:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
};
