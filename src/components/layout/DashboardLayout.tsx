import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

/**
 * Main dashboard shell layout.
 * Wraps protected routes with sidebar navigation.
 * Uses React Router's <Outlet /> to render child routes.
 */
export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background bg-gradient-to-br from-primary-50/50 via-background to-background">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-8 pt-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
