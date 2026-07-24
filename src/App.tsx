import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { AppRouter } from '@/config/routes'
import { TooltipProvider } from '@/components/ui/tooltip'

/**
 * Root application component.
 * Wraps the router with error boundary and global providers.
 */
function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <AppRouter />
      </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App
