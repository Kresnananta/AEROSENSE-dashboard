/**
 * Register Page
 *
 * Handles new user registration.
 * Redirects to login on successful registration.
 */
export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Get started with AEROSENSE
          </p>
        </div>

        {/* TODO: Implement registration form */}
        <div className="rounded-lg border border-border p-6">
          <p className="text-center text-sm text-muted-foreground">
            Registration form will be implemented here
          </p>
        </div>
      </div>
    </div>
  )
}
