/**
 * Sensors Page
 *
 * Lists all sensors with status, filtering, and search.
 * Links to individual sensor detail pages.
 */
export function SensorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sensors
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor your sensor network
          </p>
        </div>

        {/* TODO: Add sensor button */}
      </div>

      {/* TODO: Filters & search bar */}

      {/* TODO: Sensors data table */}
      <div className="rounded-lg border border-border">
        <p className="p-8 text-center text-sm text-muted-foreground">
          Sensors data table will be implemented here
        </p>
      </div>
    </div>
  )
}
