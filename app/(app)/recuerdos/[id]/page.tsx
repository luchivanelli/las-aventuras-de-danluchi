import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, ImagePlus, MapPin } from "lucide-react";
import { getMemory } from "@/lib/data";
import { fmtDay } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Reveal } from "@/components/motion/Reveal";
import { Gallery } from "@/components/memories/Gallery";
import { MemoryActions } from "@/components/memories/MemoryActions";
import { EditMemoryButton } from "@/components/memories/EditMemoryButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getMemory((await params).id);
  return { title: data?.plan.title ?? "Recuerdo" };
}

export default async function MemoryPage({ params }: Props) {
  const data = await getMemory((await params).id);
  if (!data) notFound();
  const { plan, newerId, olderId } = data;
  const m = plan.memory;

  return (
    <Reveal className="mx-auto max-w-3xl">
      <nav data-reveal className="mb-6 flex items-center justify-between gap-2">
        <Link href="/recuerdos" className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-muted transition hover:bg-rose-50 hover:text-ink">
          <ArrowLeft className="size-4" />
          Recuerdos
        </Link>
        <div className="flex items-center gap-1">
          <StepLink id={newerId} label="Recuerdo más reciente" icon="prev" />
          <StepLink id={olderId} label="Recuerdo anterior" icon="next" />
        </div>
      </nav>

      <header data-reveal className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={plan.category} />
          {m && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium capitalize text-muted">
              <CalendarDays className="size-4" />
              {fmtDay(m.date, "EEEE d 'de' MMMM 'de' yyyy")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-ink md:text-[2.75rem]">{plan.title}</h1>
          <MemoryActions plan={plan} />
        </div>
        {plan.location && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[15px] text-muted">
            <MapPin className="size-4" />
            {plan.location}
          </p>
        )}
      </header>

      {m && m.photos.length > 0 ? (
        <div data-reveal className="mb-8">
          <Gallery photos={m.photos} title={plan.title} />
        </div>
      ) : (
        <div data-reveal className="mb-8">
          <EditMemoryButton plan={plan} className="flex w-full flex-col items-center gap-2 rounded-4xl border-2 border-dashed border-line-strong px-6 py-10 text-muted transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600">
            <ImagePlus className="size-7" />
            <span className="text-sm font-semibold">Agregar fotos a este recuerdo</span>
          </EditMemoryButton>
        </div>
      )}

      <div className="space-y-6">
        {m?.reflection && (
          <p data-reveal className="font-display text-2xl font-medium italic leading-snug text-rose-700 md:text-[1.75rem]">
            “{m.reflection}”
          </p>
        )}

        {m?.note ? (
          <section data-reveal className="card p-6 md:p-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Cómo estuvo</h2>
            <p className="whitespace-pre-line text-[16px] leading-relaxed text-ink">{m.note}</p>
          </section>
        ) : (
          <section data-reveal className="card flex flex-wrap items-center justify-between gap-3 p-6">
            <p className="text-[15px] text-muted">Todavía no escribieron nada sobre este día.</p>
            <EditMemoryButton plan={plan} className="text-sm font-semibold text-rose-600 hover:underline">
              Escribir cómo estuvo
            </EditMemoryButton>
          </section>
        )}

        {plan.description && (
          <section data-reveal className="rounded-3xl bg-cream px-6 py-5 ring-1 ring-line">
            <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">El plan era</h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/80">{plan.description}</p>
          </section>
        )}
      </div>
    </Reveal>
  );
}

function StepLink({ id, label, icon }: { id: string | null; label: string; icon: "prev" | "next" }) {
  const Icon = icon === "prev" ? ChevronLeft : ChevronRight;
  const cls = "grid size-10 place-items-center rounded-full border border-line bg-paper transition";
  if (!id)
    return (
      <span className={cn(cls, "opacity-40")} aria-hidden>
        <Icon className="size-5 text-muted" />
      </span>
    );
  return (
    <Link href={`/recuerdos/${id}`} aria-label={label} title={label} className={cn(cls, "text-ink hover:border-rose-200 hover:bg-rose-50")}>
      <Icon className="size-5" />
    </Link>
  );
}
