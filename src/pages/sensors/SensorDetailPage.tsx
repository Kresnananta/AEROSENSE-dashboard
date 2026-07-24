import { useParams } from 'react-router-dom'

/**
 * Sensor Detail Page
 *
 * Displays detailed information and real-time data
 * for a specific sensor device.
 */
export function SensorDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sensor Detail
        </h1>
        <p className="text-sm text-muted-foreground">
          Viewing sensor: {id}
        </p>
      </div>

      {/* TODO: Sensor info card */}

      {/* TODO: Real-time readings chart */}

      {/* TODO: Historical data table */}
    </div>
  )
}
