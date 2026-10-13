import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

// Layout
import { DashboardLayout } from '@/components/layout/DashboardLayout'

// Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { SensorMapPage } from '@/pages/sensor-map/SensorMapPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { NodeMonitoringPage } from '@/pages/node-monitoring/NodeMonitoringPage'
import { NodeDetailPage } from '@/pages/node-monitoring/NodeDetailPage'
import { AlertsPage } from '@/pages/alerts/AlertsPage'
import { ESGReportsPage } from '@/pages/esg-reports/ESGReportsPage'
import { SystemPage } from '@/pages/system/SystemPage'
import { AeroBotPage } from '@/pages/aerobot/AeroBotPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

/**
 * Application route configuration.
 * Auth pages use a clean layout (no sidebar).
 * Dashboard pages are wrapped in DashboardLayout.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected routes — wrapped in dashboard layout */}
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.SENSOR_MAP} element={<SensorMapPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.NODE_MONITORING} element={<NodeMonitoringPage />} />
          <Route path={ROUTES.NODE_DETAIL} element={<NodeDetailPage />} />
          <Route path={ROUTES.ALERTS} element={<AlertsPage />} />
          <Route path={ROUTES.ESG_REPORTS} element={<ESGReportsPage />} />
          <Route path={ROUTES.AEROBOT} element={<AeroBotPage />} />
          <Route path={ROUTES.SYSTEM} element={<SystemPage />} />
        </Route>

        {/* Redirects & fallback */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
