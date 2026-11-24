import { BMKG_EARTHQUAKES_URL } from "@/lib/constants";
import { formatQuakeMagnitude, formatQuakeRegion, formatQuakeTime, sensorSummary } from "@/lib/environment-presentation";
import { NodeStatus } from "./NodeStatus";
import { NodeReadings } from "./NodeReadings";
import { earthquakeGroupIcon, earthquakeIcon, mapIcon } from "./map-icons";
import { HeatField, HeatLegend, type HeatInfo, type HeatScope } from "./HeatField";
import type { HeatLayerKey } from "./heat-layers";
import { DeviceLocation } from "./DeviceLocation";
import { Link } from "react-router-dom";
import type { GeoPoint } from "@/lib/nearby-nodes";
import { ArrowUpRight } from "@/components/ui/aero-icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import type { Hazards, Quake } from "@/types/weather.types";
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

function EarthquakeMarker({
  position, place, magnitude, depth, time, potential, felt, cached, stale,
}: {
  position: [number, number];
  place?: string | null;
  magnitude?: number | null;
  depth?: string | null;
  time?: string | null;
  potential?: string | null;
  felt?: string | null;
  cached?: boolean;
  stale?: boolean;
}) {
  const location = formatQuakeRegion(place || "") || "Lokasi belum tersedia";
  const mag = formatQuakeMagnitude(magnitude);
  const when = formatQuakeTime(time);
  const title = [mag ? "Gempa M " + mag : "Gempa", location].join(" · ");
  return (
    <Marker
      position={position}
      icon={earthquakeIcon(magnitude)}
      title={title}
      alt={title}
      opacity={stale ? 0.55 : 1}
      eventHandlers={{
        popupopen: (event) => event.target.getElement()?.classList.add("quake-selected"),
        popupclose: (event) => event.target.getElement()?.classList.remove("quake-selected"),
      }}
    >
      <Popup
        minWidth={170}
        maxWidth={260}
        autoPanPaddingTopLeft={[12, 65]}
        autoPanPaddingBottomRight={[14, 30]}
        className="event-popup quake-popup"
      >
        <div className="quake-popup-top">
          {mag && <span className="quake-magnitude" aria-label={`Magnitudo ${mag}`}>M {mag}</span>}
          <strong>{location}</strong>
        </div>
        {(when || depth) && (
          <p className="quake-popup-meta">
            {when && <time dateTime={time ?? undefined}>{when}</time>}
            {depth && <span>Kedalaman {depth}</span>}
          </p>
        )}
        {potential && <p>{potential}</p>}
        {cached && <p className="event-stale">Data tersimpan</p>}
        {felt && (
          <details>
            <summary>Dirasakan</summary>
            <p>{felt}</p>
          </details>
        )}
        {mag && <p className="quake-scale-note">Lingkaran menunjukkan magnitudo.</p>}
        <a href={BMKG_EARTHQUAKES_URL} target="_blank" rel="noreferrer">
          Data BMKG <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </Popup>
    </Marker>
  );
}

function HazardMarkers({
  data,
  showCyclones,
}: {
  data: Hazards | null;
  showCyclones: boolean;
}) {
  const [selectedGroup, setSelectedGroup] = useState<Quake[] | null>(null);
  const groupTrigger = useRef<HTMLElement | null>(null);
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useEffect(() => {
    const syncZoom = () => setZoom(map.getZoom());
    map.on("zoomend", syncZoom);
    syncZoom();
    return () => { map.off("zoomend", syncZoom); };
  }, [map]);
  const groups: { quakes: Quake[]; x: number; y: number }[] = [];
  for (const quake of data?.national_quakes ?? data?.quakes ?? []) {
    if (!Number.isFinite(quake.latitude) || !Number.isFinite(quake.longitude)) continue;
    const { x, y } = map.project([quake.latitude, quake.longitude], zoom);
    const group = groups.find((spot) => Math.abs(spot.x - x) < 36 && Math.abs(spot.y - y) < 42);
    if (group) group.quakes.push(quake);
    else groups.push({ quakes: [quake], x, y });
  }
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
      {groups.map(({ quakes }) => {
        const [first] = quakes;
        const position: [number, number] = [first.latitude, first.longitude];
        if (quakes.length === 1) {
          return (
            <EarthquakeMarker
              key={first.id}
              position={position}
              place={first.region}
              magnitude={first.magnitude}
              depth={first.depth}
              time={first.time}
              potential={first.potential}
            />
          );
        }
        const title = `${quakes.length} gempa berdekatan`;
        return (
          <Marker
            key={first.id + "-group"}
            position={position}
            icon={earthquakeGroupIcon(quakes.length)}
            title={title}
            alt={title}
            eventHandlers={{
              click: (event) => {
                groupTrigger.current = event.target.getElement();
                setSelectedGroup(quakes);
              },
            }}
          />
        );
      })}
      <Dialog open={selectedGroup !== null} onOpenChange={(open) => { if (!open) setSelectedGroup(null); }}>
        <DialogContent
          className="quake-group-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            groupTrigger.current?.focus();
          }}
        >
          <DialogTitle>{selectedGroup?.length} gempa berdekatan</DialogTitle>
          <DialogDescription>Gempa M5,0+ dari BMKG</DialogDescription>
          <ol className="quake-group-list">
            {selectedGroup?.map((q) => (
              <li key={q.id}>
                <details>
                  <summary>M {formatQuakeMagnitude(q.magnitude)} · {formatQuakeRegion(q.region)}</summary>
                  <p>{formatQuakeTime(q.time)}{q.depth && ` · Kedalaman ${q.depth}`}</p>
                  {q.potential && <p>{q.potential}</p>}
                </details>
              </li>
            ))}
          </ol>
          <a className="insight-text-link" href={BMKG_EARTHQUAKES_URL} target="_blank" rel="noreferrer">
            Data BMKG <ArrowUpRight size={15} />
          </a>
        </DialogContent>
      </Dialog>
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
  const hazardPoints = (hazards?.national_quakes ?? hazards?.quakes ?? [])
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
          if (e.category === "earthquake") {
            return (
              <EarthquakeMarker
                key={e.id}
                position={[e.latitude, e.longitude]}
                place={e.title}
                magnitude={e.magnitude}
                depth={e.depth_km != null ? `${e.depth_km} km` : null}
                time={e.observed_at}
                potential={e.potential}
                felt={e.felt}
                cached
                stale={e.stale}
              />
            );
          }
          return (
            <Marker
              key={e.id}
              position={[e.latitude, e.longitude]}
              icon={mapIcon("fire")}
              title={e.title}
              alt="Titik panas satelit"
              opacity={e.stale ? 0.55 : 1}
            >
              <Tooltip direction="top">
                Titik panas satelit · {dateLabel(e.observed_at)}
              </Tooltip>
              <Popup minWidth={240} maxWidth={290} className="event-popup">
                <strong>Titik panas satelit</strong>
                <p>Deteksi anomali termal; belum konfirmasi kebakaran.</p>
                <dl>
                  <dt>Keyakinan deteksi</dt>
                  <dd>{({ low: "Rendah", nominal: "Nominal", high: "Tinggi" } as Record<string, string>)[e.confidence || ""] || "Tidak tersedia"}</dd>
                  <dt>Waktu kejadian</dt>
                  <dd>{dateLabel(e.observed_at)}</dd>
                  <dt>Koordinat</dt>
                  <dd>
                    {e.latitude.toFixed(4)}, {e.longitude.toFixed(4)}
                  </dd>
                </dl>
                {e.stale && <p className="event-stale">Pembaruan tertunda; periksa waktu data.</p>}
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
