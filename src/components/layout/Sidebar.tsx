import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/constants'
import { Logo } from '@/components/shared/Logo'
import * as Icons from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

/**
 * Sidebar navigation component.
 * Displays the app logo and navigation links.
 */
export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-sidebar shadow-sm z-20">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-2 p-4 mt-4">
        {NAV_ITEMS.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as React.ElementType

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-sidebar-foreground hover:bg-primary-50 hover:text-primary-700'
                }`
              }
            >
              {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-primary-50 transition-colors cursor-pointer">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src="" alt="Ilan Pratama" />
            <AvatarFallback className="bg-primary-100 text-primary-700">KA</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Kresna Ananta</span>
            <span className="text-xs text-muted-foreground">Auditor ESG</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
