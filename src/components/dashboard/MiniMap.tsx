import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet icon issue in React
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const NODES = [
  { id: 1, lat: -7.2504, lng: 112.7688, status: 'good', name: 'Node 01' },
  { id: 2, lat: -7.2520, lng: 112.7710, status: 'warning', name: 'Node 02' },
  { id: 3, lat: -7.2490, lng: 112.7700, status: 'good', name: 'Node 03' },
  { id: 4, lat: -7.2515, lng: 112.7675, status: 'hazardous', name: 'Node 04' },
]

export function MiniMap() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-full min-h-[300px] bg-secondary/20 rounded-xl" />

  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-foreground">
          Peta Ringkas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0 px-4 pb-4">
        <div className="flex-1 rounded-xl overflow-hidden min-h-[240px] relative z-0">
          <MapContainer 
            center={[-7.2504, 112.7688]} 
            zoom={15} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {NODES.map((node) => {
              let color = '#22c55e' // green-500
              if (node.status === 'warning') color = '#eab308' // yellow-500
              if (node.status === 'hazardous') color = '#ef4444' // red-500

              return (
                <CircleMarker
                  key={node.id}
                  center={[node.lat, node.lng]}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
                  radius={8}
                >
                  <Popup>
                    <span className="font-bold">{node.name}</span>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
        <div className="text-xs text-muted-foreground mt-3 px-1">
          4 titik aktif di sekitar Sidomoro
        </div>
      </CardContent>
    </Card>
  )
}
