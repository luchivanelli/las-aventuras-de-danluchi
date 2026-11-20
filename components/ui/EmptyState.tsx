import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  emoji,
  title,
  children,
  action,
  className,
}: {
  emoji: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div data-reveal className={cn("flex flex-col items-center rounded-4xl border border-dashed border-line-strong bg-paper/60 px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-rose-50 text-3xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      {children && <p className="mt-1.5 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
