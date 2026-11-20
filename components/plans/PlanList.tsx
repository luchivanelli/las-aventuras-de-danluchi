"use client";

import { useOptimistic } from "react";
import type { PlanDTO } from "@/lib/types";
import { weekRange } from "@/lib/dates";
import { plural } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { PlanCard } from "./PlanCard";

type Group = { id: string; title: string; hint?: string; plans: PlanDTO[] };

function groupPlans(plans: PlanDTO[], today: string): Group[] {
  const week = weekRange(today);
  const groups: Group[] = [
    { id: "overdue", title: "Con fecha pasada", hint: "¿Ya los hicieron? Marquen el ✓ o cámbienles la fecha", plans: [] },
    { id: "week", title: "Esta semana", plans: [] },
    { id: "later", title: "Más adelante", plans: [] },
    { id: "someday", title: "Algún día", hint: "Ideas sin fecha todavía", plans: [] },
  ];
  for (const p of plans) {
    if (!p.date) groups[3].plans.push(p);
    else if (p.date < today) groups[0].plans.push(p);
    else if (p.date <= week.end) groups[1].plans.push(p);
    else groups[2].plans.push(p);
  }
  return groups.filter((g) => g.plans.length);
}

export function PlanList({ plans, today }: { plans: PlanDTO[]; today: string }) {
  const [optimistic, removeOptimistic] = useOptimistic(plans, (state, id: string) => state.filter((p) => p.id !== id));
  const groups = groupPlans(optimistic, today);

  return (
    <Reveal className="space-y-9">
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`g-${g.id}`}>
          <div data-reveal className="mb-3 flex items-baseline justify-between gap-3 px-1">
            <div>
              <h2 id={`g-${g.id}`} className="font-display text-xl font-semibold text-ink">
                {g.title}
              </h2>
              {g.hint && <p className="text-[13px] text-muted">{g.hint}</p>}
            </div>
            <span className="shrink-0 text-[13px] font-medium text-muted">{plural(g.plans.length, "plan", "planes")}</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {g.plans.map((p) => (
              // removeOptimistic se llama dentro de la transición del borrado (PlannerProvider.remove),
              // así la tarjeta desaparece al instante y vuelve sola si el servidor falla.
              <PlanCard key={p.id} plan={p} onOptimisticDelete={removeOptimistic} />
            ))}
          </div>
        </section>
      ))}
    </Reveal>
  );
}
