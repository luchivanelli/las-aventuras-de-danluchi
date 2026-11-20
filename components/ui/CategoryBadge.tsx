import { CATEGORIES, type Category } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  const c = CATEGORIES[category];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", className)}
      style={{ background: c.soft, color: c.ink }}
    >
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  );
}

export function CategoryTile({ category, className }: { category: Category; className?: string }) {
  const c = CATEGORIES[category];
  return (
    <span
      aria-hidden
      className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-[22px]", className)}
      style={{ background: c.soft }}
    >
      {c.emoji}
    </span>
  );
}
