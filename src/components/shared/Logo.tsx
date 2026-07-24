import { APP_CONFIG } from '@/lib/constants'

/**
 * AEROSENSE logo component.
 * Displays the app name with brand styling.
 */
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 shadow-sm">
        {/* Placeholder for actual logo vector if needed, or just a colored circle as per design */}
      </div>
      <span className="text-xl font-bold tracking-tight text-primary-700">
        {APP_CONFIG.name}
      </span>
    </div>
  )
}
