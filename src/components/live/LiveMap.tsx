import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import type { LiveNode } from "@/types/live.types";
import "leaflet/dist/leaflet.css";
function Focus({ node }: { node?: LiveNode }) {
  const map = useMap();
  const latitude = node?.latitude,
    longitude = node?.longitude;
  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined)
      map.setView([latitude, longitude], 13);
  }, [latitude, longitude, map]);
  return null;
}
export function LiveMap({
  nodes,
  selected,
  onSelect,
}: {
  nodes: LiveNode[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const valid = nodes.filter(
    (n) =>
      Number.isFinite(n.latitude) &&
      Number.isFinite(n.longitude) &&
      Math.abs(n.latitude) <= 90 &&
      Math.abs(n.longitude) <= 180,
  );
  const active = valid.find((n) => n.id === selected) || valid[0];
  if (!active)
    return <p className="live-notice">Koordinat node belum tersedia.</p>;
  return (
    <div className="live-map">
      <MapContainer
        center={[active.latitude, active.longitude]}
        zoom={13}
        className="h-full w-full"
      >
        <Focus node={active} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {valid.map((n) => (
          <CircleMarker
            key={n.id}
            center={[n.latitude, n.longitude]}
            radius={n.id === selected ? 10 : 7}
            pathOptions={{
              color:
                n.latest?.stale || !n.latest?.reading_id
                  ? "#6c7f93"
                  : "#0875ff",
              fillOpacity: 0.8,
            }}
            eventHandlers={{ click: () => onSelect(n.id) }}
          >
            <Popup>
              <strong>{n.name}</strong>
              <br />
              {n.latest?.reading_id
                ? n.latest.stale
                  ? "Pembacaan lama"
                  : "Pembacaan tersedia"
                : "Belum ada pembacaan"}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
