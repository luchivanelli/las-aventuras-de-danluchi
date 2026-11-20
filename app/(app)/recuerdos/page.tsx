import type { Metadata } from "next";
import Link from "next/link";
import { getMemories } from "@/lib/data";
import { isCategory } from "@/lib/constants";
import { fmtMonth } from "@/lib/dates";
import { plural } from "@/lib/utils";
import type { PlanDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClass } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { FilterBar } from "@/components/plans/FilterBar";
import { MemoryCard } from "@/components/memories/MemoryCard";

export const metadata: Metadata = { title: "Recuerdos" };

function byMonth(plans: PlanDTO[]) {
  const map = new Map<string, PlanDTO[]>();
  for (const p of plans) {
    const key = p.memory!.date.slice(0, 7);
    map.set(key, [...(map.get(key) ?? []), p]);
  }
  return [...map.entries()];
}

export default async function RecuerdosPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const category = isCategory(cat) ? cat : undefined;
  const filtering = !!(q?.trim() || category);
  const [memories, all] = await Promise.all([getMemories({ q, category }), filtering ? getMemories() : null]);
  const total = all?.length ?? memories.length;
  const photos = (all ?? memories).reduce((n, p) => n + (p.memory?.photos.length ?? 0), 0);
  const months = byMonth(memories.filter((p) => p.memory));

  return (
    <>
      <Reveal>
        <PageHeader
          eyebrow="Lo que vivimos"
          title="Recuerdos"
          subtitle={total ? `${plural(total, "aventura vivida", "aventuras vividas")} · ${plural(photos, "foto", "fotos")}` : undefined}
        />
        {total > 0 && <FilterBar placeholder="Buscar en recuerdos y notas…" />}
      </Reveal>

      {total === 0 ? (
        <Reveal>
          <EmptyState emoji="💭" title="Todavía no hay recuerdos" action={<Link href="/planes" className={buttonClass()}>Ver planes pendientes</Link>}>
            Cuando completen un plan, guarden fotos y lo que sintieron. Van a aparecer acá.
          </EmptyState>
        </Reveal>
      ) : months.length === 0 ? (
        <Reveal>
          <EmptyState emoji="🔍" title="Nada por acá">
            No hay recuerdos que coincidan. Probá con otra palabra o categoría.
          </EmptyState>
        </Reveal>
      ) : (
        <Reveal className="space-y-10">
          {months.map(([month, plans], gi) => (
            <section key={month} aria-label={fmtMonth(month)}>
              <h2 data-reveal className="mb-4 flex items-center gap-3 font-display text-xl font-semibold capitalize text-ink">
                {fmtMonth(month)}
                <span className="h-px flex-1 bg-line" aria-hidden />
                <span className="font-sans text-[13px] font-medium normal-case text-muted">{plans.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {plans.map((p, i) => (
                  <MemoryCard key={p.id} plan={p} priority={gi === 0 && i < 4} />
                ))}
              </div>
            </section>
          ))}
        </Reveal>
      )}
    </>
  );
}
