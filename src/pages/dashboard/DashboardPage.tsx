/**
 * Dashboard Page
 *
 * Main overview page showing key metrics, recent readings,
 * and sensor status summary.
 */
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your air quality monitoring system
        </p>
      </div>

      {/* TODO: KPI cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric cards will go here */}
      </div>

      {/* TODO: Charts section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Chart components will go here */}
      </div>

      {/* TODO: Recent activity / readings table */}
    </div>
  )
}
