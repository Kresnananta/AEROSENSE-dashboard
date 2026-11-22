import { BMKG_EARTHQUAKES_URL } from "@/lib/constants";
import { formatQuakeRegion, sensorSummary } from "@/lib/environment-presentation";
import { NodeStatus } from "./NodeStatus";
import { NodeReadings } from "./NodeReadings";
import { mapIcon } from "./map-icons";
import { HeatField, HeatLegend, type HeatInfo, type HeatScope } from "./HeatField";
import type { HeatLayerKey } from "./heat-layers";
import { DeviceLocation } from "./DeviceLocation";
import { Link } from "react-router-dom";
import type { GeoPoint } from "@/lib/nearby-nodes";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Hazards } from "@/types/weather.types";
import {
  MapContainer,
  TileLayer,
  Pane,
  CircleMarker,
  Circle,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { dateLabel, type EnvironmentEvent, type LiveNode } from "@/types/live.types";
import "leaflet/dist/leaflet.css";
import "@/styles/event-map.css";

function HazardMarkers({
  data,
  showCyclones,
}: {
  data: Hazards | null;
  showCyclones: boolean;
}) {
  const quakes = (data?.quakes ?? []).filter(
    (q) => Number.isFinite(q.latitude) && Number.isFinite(q.longitude),
  );
  return (
    <>
      {showCyclones &&
        (data?.cyclones || []).map((c) => (
          <Circle
            key={c.id}
            center={[c.latitude, c.longitude]}
            radius={250000}
            pathOptions={{
              color: c.level === "red" ? "#b42332" : c.level === "orange" ? "#d9731f" : "#2f7d5b",
              weight: 2,
              dashArray: "6 6",
              fillOpacity: 0.08,
            }}
          >
            <Tooltip direction="top">
              Siklon tropis {c.name} · status {c.level}
              {c.severity ? ` · ${c.severity}` : ""}
            </Tooltip>
          </Circle>
        ))}
      {quakes.map((q) => {
        const region = formatQuakeRegion(q.region || "") || "Wilayah Indonesia";
        const mag = q.magnitude.toLocaleString("id-ID", { maximumFractionDigits: 1 });
        const timeStr =
          new Date(q.time).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Jakarta",
          }) + " WIB";
        return (
          <Marker
            key={q.id}
            position={[q.latitude, q.longitude]}
            icon={mapIcon("earthquake")}
            title={`Gempa M ${mag} · ${region}`}
            alt="Episenter gempa BMKG"
          >
            <Tooltip direction="top">
              Gempa M {mag} · {region} · {timeStr}
            </Tooltip>
            <Popup minWidth={240} maxWidth={290} className="event-popup">
              <strong>Gempa BMKG</strong>
              <p>{region}</p>
              <dl>
                <dt>Magnitudo</dt>
                <dd>M {mag}</dd>
                {q.depth && (
                  <>
                    <dt>Kedalaman</dt>
                    <dd>{q.depth}</dd>
                  </>
                )}
                <dt>Waktu kejadian</dt>
                <dd>{timeStr}</dd>
                <dt>Koordinat</dt>
                <dd>
                  {q.latitude.toFixed(4)}, {q.longitude.toFixed(4)}
                </dd>
              </dl>
              {q.potential && <p>{q.potential}</p>}
              <a href={BMKG_EARTHQUAKES_URL} target="_blank" rel="noreferrer">
                Data resmi BMKG <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
export type WatersensePoint = GeoPoint & {
  id: string;
  name: string;
  node_id: string;
  online: boolean;
};

function WatersenseFocus({ point }: { point?: WatersensePoint }) {
  const map = useMap();
  const id = point?.id;
  const latitude = point?.latitude;
  const longitude = point?.longitude;
  useEffect(() => {
    if (id && latitude != null && longitude != null) map.setView([latitude, longitude], 16);
  }, [map, id, latitude, longitude]);
  return null;
}
function EventFocus({ nodes, events }: { nodes: LiveNode[]; events: EnvironmentEvent[] }) {
  const map = useMap();
  const signature = JSON.stringify([...nodes, ...events].map((p) => [p.latitude, p.longitude]));
  useEffect(() => {
    const points = JSON.parse(signature) as [number, number][];
    if (points.length)
      map.fitBounds(points, { paddingTopLeft: [44, 56], paddingBottomRight: [44, 26], maxZoom: 13 });
  }, [map, signature]);
  return null;
}
function Focus({ node, nodes }: { node?: LiveNode; nodes: LiveNode[] }) {
  const map = useMap();
  const focused = useRef(false);
  const latitude = node?.latitude,
    longitude = node?.longitude;
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    if (!focused.current && nodes.length > 1) {
      map.fitBounds(
        nodes.map((n) => [n.latitude, n.longitude] as [number, number]),
        { padding: [28, 28], maxZoom: 13 },
      );
    } else if (!focused.current) {
      map.setView([latitude, longitude], 13);
    } else {
      map.panTo([latitude, longitude]);
    }
    focused.current = true;
  }, [latitude, longitude, map]);
  return null;
}
function LocationFocus({ point, radiusKm }: { point: GeoPoint; radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    const dy = radiusKm / 111.2;
    const dx = dy / Math.max(0.01, Math.cos((point.latitude * Math.PI) / 180));
    map.fitBounds(
      [
        [point.latitude - dy, point.longitude - dx],
        [point.latitude + dy, point.longitude + dx],
      ],
      { padding: [20, 20], maxZoom: 14 },
    );
  }, [map, point.latitude, point.longitude, radiusKm]);
  return null;
}

const INDONESIA: [[number, number], [number, number]] = [
  [-11.2, 94.8],
  [6.2, 141.2],
];
const INDONESIA_VIEW: [[number, number], [number, number]] = [
  [-15, 90],
  [10, 146],
];
function IndonesiaZoomLimit() {
  const map = useMap();
  useEffect(() => {
    const limit = () => map.setMinZoom(Math.max(3, map.getBoundsZoom(INDONESIA)));
    limit();
    map.on("resize", limit);
    return () => {
      map.off("resize", limit);
    };
  }, [map]);
  return null;
}
function SelectionFocus({ node }: { node?: LiveNode }) {
  const map = useMap();
  const lastId = useRef(node?.id);
  useEffect(() => {
    if (!node || node.id === lastId.current) return;
    lastId.current = node.id;
    map.panInside([node.latitude, node.longitude], { padding: [56, 56], animate: false });
  }, [map, node]);
  return null;
}
export function LiveMap({
  nodes,
  selected,
  previewed,
  onSelect,
  userLocation,
  radiusKm = 5,
  locationLabel = "Lokasi Anda",
  events = [],
  locateUser = false,
  autoLocate = false,
  watersense = [],
  focusedWatersense,
  heat = "off",
  hazards = null,
  showCyclones = true,
}: {
  nodes: LiveNode[];
  selected: string;
  previewed?: string | null;
  onSelect: (id: string) => void;
  userLocation?: GeoPoint;
  radiusKm?: number;
  locationLabel?: string;
  events?: EnvironmentEvent[];
  showNodes?: boolean;
  locateUser?: boolean;
  autoLocate?: boolean;
  watersense?: WatersensePoint[];
  focusedWatersense?: string | null;
  heat?: HeatLayerKey | "off";
  hazards?: Hazards | null;
  showCyclones?: boolean;
}) {
  const [devicePoint, setDevicePoint] = useState<GeoPoint | null>(null);
  const [heatInfo, setHeatInfo] = useState<{ layer: HeatLayerKey; data: HeatInfo } | null>(null);
  const [heatScope, setHeatScope] = useState<HeatScope>("detail");
  const hazardPoints = (hazards?.quakes || [])
    .filter((q) => Number.isFinite(q.latitude) && Number.isFinite(q.longitude))
    .map((q) => ({ latitude: q.latitude, longitude: q.longitude }) as EnvironmentEvent);
  const locationPoint = userLocation || devicePoint;
  const valid = nodes.filter(
    (n) =>
      Number.isFinite(n.latitude) &&
      Number.isFinite(n.longitude) &&
      Math.abs(n.latitude) <= 90 &&
      Math.abs(n.longitude) <= 180,
  );
  const active = valid.find((n) => n.id === selected) || valid[0];
  const highlighted = valid.find((n) => n.id === (previewed || selected));
  const eventPoints = events.filter(
    (e) =>
      Number.isFinite(e.latitude) &&
      Number.isFinite(e.longitude) &&
      Math.abs(e.latitude) <= 90 &&
      Math.abs(e.longitude) <= 180,
  );
  if (!active && !userLocation)
    return <p className="live-notice">Koordinat node belum tersedia.</p>;
  const map = (
    <div className={"live-map" + (heat !== "off" ? " heat-on" : "")} data-heat={heat}>
      <MapContainer
        center={
          userLocation
            ? [userLocation.latitude, userLocation.longitude]
            : [active!.latitude, active!.longitude]
        }
        zoom={13}
        zoomControl={false}
        minZoom={4}
        maxBounds={INDONESIA_VIEW}
        maxBoundsViscosity={1}
        className="h-full w-full"
      >
        {userLocation ? (
          <LocationFocus point={userLocation} radiusKm={radiusKm} />
        ) : eventPoints.length || hazardPoints.length ? (
          <EventFocus nodes={valid} events={[...eventPoints, ...hazardPoints]} />
        ) : devicePoint ? null : (
          <Focus node={active} nodes={valid} />
        )}
        <IndonesiaZoomLimit />
        {!userLocation && <SelectionFocus node={highlighted} />}
        <WatersenseFocus point={watersense.find((point) => point.id === focusedWatersense)} />
        {locateUser && (
          <DeviceLocation point={devicePoint} onPoint={setDevicePoint} autoLocate={autoLocate} />
        )}
        {heat === "off" ? (
          <TileLayer
            key="street-base"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap
            keepBuffer={3}
            className="live-map-tiles"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        ) : (
          <>
            <TileLayer
              key="heat-base"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={12}
              noWrap
              keepBuffer={3}
              opacity={0.66}
              className="heat-basemap"
              attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
            />
            <Pane name="heatPane" style={{ zIndex: 350 }} />
            <Pane name="heatLabelsPane" style={{ zIndex: 450, pointerEvents: "none" }}>
              <TileLayer
                key="heat-labels"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                noWrap
                keepBuffer={3}
                opacity={0.82}
                pane="heatLabelsPane"
              />
            </Pane>
          </>
        )}
        {locationPoint && (
          <>
            {userLocation && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={radiusKm * 1000}
                pathOptions={{ color: "#0b6fe5", weight: 1, dashArray: "5 7", fillOpacity: 0.04 }}
                interactive={false}
              />
            )}
            {locationPoint.accuracy != null && (
              <Circle
                center={[locationPoint.latitude, locationPoint.longitude]}
                radius={locationPoint.accuracy}
                pathOptions={{ color: "#0b6fe5", weight: 1, fillOpacity: 0.1 }}
                interactive={false}
              />
            )}
            <CircleMarker
              center={[locationPoint.latitude, locationPoint.longitude]}
              radius={7}
              pathOptions={{
                className: "map-location-dot",
                color: "#fff",
                weight: 3,
                fillColor: "#197dae",
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                {locationLabel}
              </Tooltip>
              <Popup>
                <strong>{locationLabel}</strong>
                {locationPoint.accuracy != null && (
                  <p>
                    Perkiraan akurasi ±{Math.round(locationPoint.accuracy).toLocaleString("id-ID")}{" "}
                    m.
                  </p>
                )}
              </Popup>
            </CircleMarker>
          </>
        )}
        {heat !== "off" && (
          <HeatField
            key={heat}
            layer={heat}
            onInfo={(data) => setHeatInfo({ layer: heat, data })}
            onScope={setHeatScope}
          />
        )}
        {hazards && (
          <HazardMarkers data={hazards} showCyclones={showCyclones} />
        )}
        {valid.map((n) => (
          <Marker
            key={n.id}
            position={[n.latitude, n.longitude]}
            icon={mapIcon("sensor", sensorSummary(n).tone, n.id === highlighted?.id)}
            zIndexOffset={n.id === highlighted?.id ? 1000 : 0}
            title={n.name}
            alt={`Sensor ${n.name}`}
            eventHandlers={{ click: () => onSelect(n.id) }}
          >
            {n.id === highlighted?.id && (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -3]}
                opacity={1}
                className="node-focus-tooltip"
              >
                {n.name}
              </Tooltip>
            )}
            <Popup minWidth={250} maxWidth={290} className="node-reading-popup">
              <strong className="node-popup-title">{n.name}</strong>
              <NodeStatus node={n} />
              <NodeReadings node={n} />
              <Link className="node-popup-detail" to={`/nodes/${encodeURIComponent(n.id)}`}>
                Lihat detail node <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </Popup>
          </Marker>
        ))}
        {watersense.map((point) => (
          <Marker
            key={"watersense-" + point.id}
            position={[point.latitude, point.longitude]}
            title={point.name}
            alt={`WATERSENSE ${point.name}`}
            icon={mapIcon("watersense", "watersense", point.id === focusedWatersense)}
            zIndexOffset={point.id === focusedWatersense ? 1500 : 500}
          >
            <Tooltip
              key={point.id === focusedWatersense ? "selected" : "preview"}
              permanent={point.id === focusedWatersense}
              direction="top"
              offset={[0, -3]}
              opacity={1}
              className="node-focus-tooltip"
            >
              {point.name}
            </Tooltip>
            <Popup className="node-reading-popup">
              <strong className="node-popup-title">{point.name}</strong>
              <p>WATERSENSE · {point.online ? "Terhubung" : "Offline"}</p>
              <p>
                {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
              </p>
            </Popup>
          </Marker>
        ))}
        {eventPoints.map((e) => {
          const formattedTitle =
            e.category === "earthquake" ? formatQuakeRegion(e.title || "") : e.title;
          const magLabel =
            e.magnitude != null
              ? e.magnitude.toLocaleString("id-ID", { maximumFractionDigits: 1 })
              : null;
          return (
            <Marker
              key={e.id}
              position={[e.latitude, e.longitude]}
              icon={mapIcon(e.category)}
              title={formattedTitle}
              alt={e.category === "fire" ? "Titik panas satelit" : "Episenter gempa"}
              opacity={e.stale ? 0.55 : 1}
            >
              <Tooltip direction="top">
                {e.category === "earthquake"
                  ? `Gempa${magLabel ? ` M ${magLabel}` : ""} · ${formattedTitle} · ${dateLabel(e.observed_at)}`
                  : `Titik panas satelit · ${dateLabel(e.observed_at)}`}
              </Tooltip>
              <Popup minWidth={240} maxWidth={290} className="event-popup">
                <strong>{e.category === "fire" ? "Titik panas satelit" : "Gempa BMKG"}</strong>
                <p>
                  {e.category === "earthquake"
                    ? formattedTitle
                    : "Deteksi anomali termal; belum konfirmasi kebakaran."}
                </p>
                <dl>
                  {e.category === "fire" ? (
                    <>
                      <dt>Keyakinan deteksi</dt>
                      <dd>
                        {(
                          { low: "Rendah", nominal: "Nominal", high: "Tinggi" } as Record<
                            string,
                            string
                          >
                        )[e.confidence || ""] || "Tidak tersedia"}
                      </dd>
                    </>
                  ) : (
                    <>
                      <dt>Magnitudo</dt>
                      <dd>{magLabel ? `M ${magLabel}` : "Tidak tersedia"}</dd>
                      <dt>Kedalaman</dt>
                      <dd>{e.depth_km != null ? `${e.depth_km} km` : "Tidak tersedia"}</dd>
                    </>
                  )}
                  <dt>Waktu kejadian</dt>
                  <dd>{dateLabel(e.observed_at)}</dd>
                  <dt>Koordinat</dt>
                  <dd>
                    {e.latitude.toFixed(4)}, {e.longitude.toFixed(4)}
                  </dd>
                </dl>
                {e.category === "earthquake" ? (
                  <p className="event-stale">Data BMKG tersimpan. Periksa situs BMKG untuk pembaruan.</p>
                ) : (
                  e.stale && <p className="event-stale">Pembaruan tertunda; periksa waktu data.</p>
                )}
                {e.felt && <p>{e.felt}</p>}
                <a href={e.source_url} target="_blank" rel="noreferrer">
                  {e.source} <ArrowUpRight size={12} />
                </a>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
  return (
    <div className="map-figure">
      {map}
      {heat !== "off" && (
        <HeatLegend layer={heat} info={heatInfo?.layer === heat ? heatInfo.data : null} scope={heatScope} />
      )}
    </div>
  );
}
