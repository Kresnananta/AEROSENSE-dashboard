import { APP_CONFIG } from '@/lib/constants'

/**
 * AEROSENSE logo component.
 * Displays the app name with brand styling.
 */
export function Logo() {
  return (
    <span className="text-xl font-bold tracking-tight text-foreground">
      {APP_CONFIG.name}
    </span>
  )
}
