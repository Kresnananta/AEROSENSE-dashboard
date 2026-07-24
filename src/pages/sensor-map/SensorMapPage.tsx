import { SensorMapContainer } from '@/components/map/MapContainer'

export function SensorMapPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Peta Sensor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Distribusi dan status real-time dari semua node pemantau kualitas udara
        </p>
      </div>

      <SensorMapContainer />
    </div>
  )
}
