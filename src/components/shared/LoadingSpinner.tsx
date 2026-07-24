import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
} as const

/**
 * Animated loading spinner.
 * Use in loading states, suspense fallbacks, and async operations.
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizeMap[size],
        className,
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
