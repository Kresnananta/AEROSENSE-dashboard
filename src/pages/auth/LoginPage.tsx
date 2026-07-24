/**
 * Login Page
 *
 * Handles user authentication with email/password.
 * Redirects to dashboard on successful login.
 */
export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your AEROSENSE account
          </p>
        </div>

        {/* TODO: Implement login form with shadcn Input, Button */}
        <div className="rounded-lg border border-border p-6">
          <p className="text-center text-sm text-muted-foreground">
            Login form will be implemented here
          </p>
        </div>
      </div>
    </div>
  )
}
