"use client";

import { Check, MapPin, Pencil, Star, Trash2, CalendarDays } from "lucide-react";
import { relativeDay } from "@/lib/dates";
import type { PlanDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { CategoryTile } from "@/components/ui/CategoryBadge";
import { Menu } from "@/components/ui/Menu";
import { usePlanner } from "./PlannerProvider";

export function PlanCard({ plan, onOptimisticDelete }: { plan: PlanDTO; onOptimisticDelete?: (id: string) => void }) {
  const { today, edit, complete, remove } = usePlanner();
  const overdue = !!plan.date && plan.date < today;
  const isToday = plan.date === today;
  const cat = CATEGORIES[plan.category];

  return (
    <article
      data-reveal
      className={cn(
        "group relative flex items-start gap-3.5 rounded-3xl border bg-paper p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5",
        isToday ? "border-rose-200 ring-1 ring-rose-200" : "border-line",
      )}
    >
      <CategoryTile category={plan.category} />

      <div className="min-w-0 flex-1">
        {/* Toda la tarjeta abre la edición; los botones internos detienen la propagación */}
        <button type="button" onClick={() => edit(plan)} className="block w-full text-left after:absolute after:inset-0 after:rounded-3xl" aria-label={`Editar ${plan.title}`}>
          <h3 className="pr-2 text-[16px] font-semibold leading-snug text-ink">
            {plan.priority === "alta" && <Star className="mr-1 inline size-4 -translate-y-px fill-gold text-gold" aria-label="Especial" />}
            {plan.title}
          </h3>
        </button>

        {plan.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{plan.description}</p>}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] font-medium">
          <span style={{ color: cat.ink }}>{cat.label}</span>
          {plan.date && (
            <span className={cn("inline-flex items-center gap-1", overdue ? "text-danger" : isToday ? "font-semibold text-rose-600" : "text-muted")}>
              <CalendarDays className="size-3.5" aria-hidden />
              <span className="inline-block first-letter:uppercase">{relativeDay(plan.date, today)}</span>
              {overdue && <span className="text-xs">· ¿lo hicieron?</span>}
            </span>
          )}
          {plan.location && (
            <span className="inline-flex min-w-0 items-center gap-1 text-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{plan.location}</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-1">
        <Menu
          items={[
            { label: "Editar", icon: <Pencil className="size-4" />, onSelect: () => edit(plan) },
            { label: "Eliminar", icon: <Trash2 className="size-4" />, tone: "danger", onSelect: () => remove(plan, { onOptimistic: () => onOptimisticDelete?.(plan.id) }) },
          ]}
        />
        <button
          type="button"
          onClick={() => complete(plan)}
          aria-label={`Marcar "${plan.title}" como hecho`}
          title="¡Lo hicimos!"
          className="grid size-11 place-items-center rounded-full border-2 border-line-strong text-transparent transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
        >
          <Check className="size-5" strokeWidth={3} />
        </button>
      </div>
    </article>
  );
}
