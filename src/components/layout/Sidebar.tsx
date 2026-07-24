import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/constants'
import { Logo } from '@/components/shared/Logo'

/**
 * Sidebar navigation component.
 * Displays the app logo and navigation links.
 * Uses NavLink for active state styling.
 */
export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Logo />
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`
            }
          >
            {/* Icon placeholder — will be replaced with lucide-react icons */}
            <span className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
