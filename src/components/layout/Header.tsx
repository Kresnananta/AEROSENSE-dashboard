import { ThemeToggle } from '@/components/shared/ThemeToggle'

/**
 * Top header bar component.
 * Contains search, notifications, user profile, and theme toggle.
 */
export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Search area — placeholder */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {/* Page title will be dynamic based on route */}
        </h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* User avatar — placeholder */}
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>
    </header>
  )
}
