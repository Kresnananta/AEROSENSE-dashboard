import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {

  title: string;

  description?: string;

  icon?: ReactNode;

  action?: ReactNode;

  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center",
        className,
      )}
    >
      {icon && (
        <div className="text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
