import { useEffect, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { LayerSwitcher, type MapLayer } from './LayerSwitcher'
import { NodeMarker, type NodeData } from './NodeMarker'
import 'leaflet/dist/leaflet.css'

// Mock Data
const MOCK_NODES: NodeData[] = [
  {
    id: '1',
    name: 'Node Sidomoro 01',
    lat: -7.2504,
    lng: 112.7688,
    status: 'online',
    readings: { aqi: 42, pm25: 18, tvoc: 142, eco2: 410 },
    lastUpdate: '2 menit lalu'
  },
  {
    id: '2',
    name: 'Node Sidomoro 02',
    lat: -7.2520,
    lng: 112.7710,
    status: 'warning',
    readings: { aqi: 85, pm25: 35, tvoc: 280, eco2: 500 },
    lastUpdate: '5 menit lalu'
  },
  {
    id: '3',
    name: 'Node Pabrik 01',
    lat: -7.2490,
    lng: 112.7700,
    status: 'online',
    readings: { aqi: 35, pm25: 15, tvoc: 120, eco2: 400 },
    lastUpdate: '1 menit lalu'
  },
  {
    id: '4',
    name: 'Node Kawasan Berikat',
    lat: -7.2515,
    lng: 112.7675,
    status: 'critical',
    readings: { aqi: 150, pm25: 75, tvoc: 500, eco2: 800 },
    lastUpdate: 'Sekarang'
  },
]

export function SensorMapContainer() {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('aqi')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-full w-full bg-secondary/20 flex items-center justify-center">Loading Map...</div>

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-border/50 shadow-sm z-0">
      <MapContainer 
        center={[-7.2504, 112.7688]} 
        zoom={15} 
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {MOCK_NODES.map(node => (
          <NodeMarker key={node.id} node={node} activeLayer={activeLayer} />
        ))}
      </MapContainer>

      <LayerSwitcher activeLayer={activeLayer} onLayerChange={setActiveLayer} />
    </div>
  )
}
