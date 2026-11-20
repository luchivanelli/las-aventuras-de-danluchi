import type { Metadata } from "next";
import { getPendingPlans, getToday } from "@/lib/data";
import { isCategory } from "@/lib/constants";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { FilterBar } from "@/components/plans/FilterBar";
import { PlanList } from "@/components/plans/PlanList";
import { NewPlanButton } from "@/components/plans/NewPlanButton";

export const metadata: Metadata = { title: "Planes" };

type Search = { q?: string; cat?: string };

export default async function PlanesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q, cat } = await searchParams;
  const category = isCategory(cat) ? cat : undefined;
  const filtering = !!(q?.trim() || category);
  const [plans, allPending, today] = await Promise.all([
    getPendingPlans({ q, category }),
    filtering ? getPendingPlans() : null,
    getToday(),
  ]);
  const total = allPending?.length ?? plans.length;

  return (
    <>
      <Reveal>
        <PageHeader
          eyebrow="Por vivir"
          title="Nuestros planes"
          subtitle={total ? `${plural(total, "aventura pendiente", "aventuras pendientes")}` : "Todavía no hay planes"}
          actions={<NewPlanButton className="hidden md:inline-flex" />}
        />
        {total > 0 && <FilterBar placeholder="Buscar por nombre, lugar o detalle…" />}
      </Reveal>

      {plans.length > 0 ? (
        <PlanList plans={plans} today={today} />
      ) : (
        <Reveal>
          {total === 0 ? (
            <EmptyState emoji="✨" title="¡Empiecen a planear!" action={<NewPlanButton label="Agregar la primera aventura" size="lg" />}>
              Anoten todo lo que quieren hacer juntos: una cena, un viaje, una sorpresa…
            </EmptyState>
          ) : (
            <EmptyState emoji="🔍" title="Nada por acá">
              No hay planes que coincidan con la búsqueda. Probá con otra palabra o categoría.
            </EmptyState>
          )}
        </Reveal>
      )}
    </>
  );
}
