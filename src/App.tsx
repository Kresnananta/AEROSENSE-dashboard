import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { AppRouter } from '@/config/routes'

/**
 * Root application component.
 * Wraps the router with error boundary and global providers.
 */
function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  )
}

export default App
