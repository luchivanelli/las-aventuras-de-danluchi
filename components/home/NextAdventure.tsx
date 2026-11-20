"use client";

import { CalendarDays, Check, MapPin, Pencil } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { diffDays, fmtDay } from "@/lib/dates";
import type { PlanDTO } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { usePlanner } from "@/components/plans/PlannerProvider";

export function NextAdventure({ plan }: { plan: PlanDTO }) {
  const { today, edit, complete } = usePlanner();
  const c = CATEGORIES[plan.category];
  const days = plan.date ? diffDays(today, plan.date) : null;

  return (
    <section data-reveal className="card relative overflow-hidden p-6 md:p-7">
      <div className="pointer-events-none absolute -right-6 -top-8 select-none text-[9rem] leading-none opacity-[0.12]" aria-hidden>
        {c.emoji}
      </div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-rose-600">Próxima aventura</p>

      <div className="relative flex items-end gap-5">
        {days !== null && (
          <div className="shrink-0 text-center">
            <p className="font-display text-5xl font-semibold leading-none text-ink">{days === 0 ? "¡Hoy!" : days}</p>
            {days > 0 && <p className="mt-1 text-xs font-semibold text-muted">{days === 1 ? "día" : "días"}</p>}
          </div>
        )}
        <div className="min-w-0 border-l border-line pl-5">
          <h2 className="font-display text-2xl font-semibold leading-tight text-ink">{plan.title}</h2>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-medium text-muted">
            {plan.date && (
              <span className="inline-flex items-center gap-1 capitalize">
                <CalendarDays className="size-3.5" />
                {fmtDay(plan.date, "EEEE d 'de' MMMM")}
              </span>
            )}
            {plan.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {plan.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex gap-2">
        {days === 0 ? (
          <Button size="sm" onClick={() => complete(plan)}>
            <Check className="size-4" strokeWidth={3} />
            ¡Lo hicimos!
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={() => edit(plan)}>
          <Pencil className="size-4" />
          Ver detalles
        </Button>
      </div>
    </section>
  );
}
