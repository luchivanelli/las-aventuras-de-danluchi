import Link from "next/link";
import { ArrowRight, CalendarHeart, Camera, Sparkles, TriangleAlert } from "lucide-react";
import { getHomeData } from "@/lib/data";
import { env } from "@/lib/env";
import { CATEGORIES } from "@/lib/constants";
import { diffDays, fmtDay } from "@/lib/dates";
import { plural } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { FloatingHearts } from "@/components/motion/FloatingHearts";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlanCard } from "@/components/plans/PlanCard";
import { NewPlanButton } from "@/components/plans/NewPlanButton";
import { NextAdventure } from "@/components/home/NextAdventure";
import { MemoryCard } from "@/components/memories/MemoryCard";

function greeting(timeZone: string) {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone }).format(new Date()));
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buen día";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default async function HomePage() {
  const { today, counts, upcoming, recent, onThisDay, categories } = await getHomeData();
  const since = env.secretDate;
  const days = Math.max(diffDays(since, today), 0);
  const months = Math.floor(days / 30.44);
  const percent = counts.total ? Math.round((counts.completed / counts.total) * 100) : 0;
  const [next, ...rest] = upcoming;
  const maxCat = Math.max(1, ...categories.map((c) => c.total));

  return (
    <Reveal className="space-y-6 md:space-y-8">
      <header data-reveal>
        <p className="text-[13px] font-semibold capitalize text-rose-600">{fmtDay(today, "EEEE d 'de' MMMM")}</p>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-ink md:text-[2.5rem]">{greeting(env.timeZone)} 💕</h1>
      </header>

      {/* Hero: días juntos */}
      <section data-reveal className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-rose-500 via-rose-400 to-[#e9a8a0] p-7 text-white shadow-rose md:p-9">
        <FloatingHearts className="text-white/25" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-white/85">Llevamos juntos</p>
            <p className="font-display text-6xl font-semibold leading-none tracking-tight md:text-7xl">
              <CountUp value={days} />
            </p>
            <p className="mt-2 text-lg text-white/90">días de aventuras {months > 0 && <span className="text-white/75">· {plural(months, "mes", "meses")}</span>}</p>
          </div>
          <p className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            <CalendarHeart className="size-4" />
            Desde el {fmtDay(since, "d 'de' MMMM 'de' yyyy")}
          </p>
        </div>
      </section>

      {counts.total === 0 ? (
        <EmptyState emoji="🗺️" title="Su lista está vacía" action={<NewPlanButton label="Agregar la primera aventura" size="lg" />}>
          Empiecen anotando algo que quieran hacer juntos. Después lo marcan como hecho y guardan fotos del recuerdo.
        </EmptyState>
      ) : (
        <>
          {counts.overdue > 0 && (
            <Link
              data-reveal
              href="/planes"
              className="flex items-center gap-3 rounded-3xl border border-gold/30 bg-gold-soft px-5 py-4 text-sm font-medium text-gold-ink transition hover:brightness-[0.98]"
            >
              <TriangleAlert className="size-5 shrink-0 text-gold" />
              <span className="flex-1">
                {counts.overdue === 1 ? "Hay 1 plan con fecha pasada." : `Hay ${counts.overdue} planes con fecha pasada.`} ¿Ya lo hicieron?
              </span>
              <ArrowRight className="size-4" />
            </Link>
          )}

          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:gap-6">
            {next ? (
              <NextAdventure plan={next} />
            ) : (
              <section data-reveal className="card flex flex-col items-start justify-center gap-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Próxima aventura</p>
                <p className="font-display text-xl font-semibold text-ink">No hay nada agendado</p>
                <p className="text-sm text-muted">Pónganle fecha a alguno de sus planes o creen uno nuevo.</p>
                <NewPlanButton size="sm" variant="secondary" label="Planear algo" />
              </section>
            )}

            {/* Progreso */}
            <section data-reveal className="card flex items-center gap-5 p-6">
              <div className="relative shrink-0">
                <ProgressRing percent={percent} size={112} />
                <span className="absolute inset-0 grid place-items-center font-display text-2xl font-semibold text-ink">{percent}%</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Aventuras vividas</p>
                <p className="mt-1 font-display text-3xl font-semibold text-ink">
                  <CountUp value={counts.completed} />
                  <span className="text-lg font-medium text-muted"> / {counts.total}</span>
                </p>
                <p className="mt-1 text-sm text-muted">{counts.pending ? `Quedan ${counts.pending} por vivir` : "¡Las hicieron todas! 🎉"}</p>
              </div>
            </section>
          </div>

          {/* Números */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Stat label="Por vivir" value={counts.pending} href="/planes" />
            <Stat label="Esta semana" value={counts.thisWeek} href="/calendario" />
            <Stat label="Fotos" value={counts.photos} href="/recuerdos" icon={<Camera className="size-4" />} />
          </div>

          {rest.length > 0 && (
            <section>
              <SectionTitle title="Lo que se viene" href="/planes" cta="Ver todos" />
              <div className="grid gap-3 lg:grid-cols-2">
                {rest.map((p) => (
                  <PlanCard key={p.id} plan={p} />
                ))}
              </div>
            </section>
          )}

          {onThisDay?.memory && (
            <section data-reveal className="card overflow-hidden p-0">
              <div className="grid sm:grid-cols-[200px_1fr]">
                <MemoryCard plan={onThisDay} className="aspect-[4/3] rounded-none shadow-none hover:translate-y-0 sm:aspect-auto sm:min-h-48" />
                <div className="flex flex-col justify-center p-6">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600">
                    <Sparkles className="size-3.5" />
                    Un día como hoy
                  </p>
                  <p className="font-display text-xl font-semibold text-ink">{onThisDay.title}</p>
                  <p className="text-sm text-muted">{fmtDay(onThisDay.memory.date, "d 'de' MMMM 'de' yyyy")}</p>
                  {onThisDay.memory.note && <p className="mt-3 line-clamp-3 text-[15px] italic text-ink/80">“{onThisDay.memory.note}”</p>}
                </div>
              </div>
            </section>
          )}

          {recent.length > 0 && (
            <section>
              <SectionTitle title="Últimos recuerdos" href="/recuerdos" cta="Ver álbum" />
              <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
                {recent.map((p) => (
                  <MemoryCard key={p.id} plan={p} className="w-40 shrink-0 snap-start sm:w-auto" />
                ))}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <section data-reveal className="card p-6">
              <h2 className="mb-5 font-display text-xl font-semibold text-ink">Lo que más hacemos</h2>
              <ul className="space-y-3.5">
                {categories.map(({ category, total, done }) => {
                  const c = CATEGORIES[category];
                  return (
                    <li key={category} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
                      <Link href={`/recuerdos?cat=${category}`} className="truncate font-semibold text-ink hover:text-rose-600">
                        {c.emoji} {c.label}
                      </Link>
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-cream" title={`${done} hechos de ${total}`}>
                        <div className="absolute inset-y-0 left-0 rounded-full opacity-35" style={{ width: `${(total / maxCat) * 100}%`, background: c.hex }} />
                        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(done / maxCat) * 100}%`, background: c.hex }} />
                      </div>
                      <span className="w-14 text-right text-xs font-medium tabular-nums text-muted">
                        {done}/{total}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs text-muted">Barra llena: hechos · Barra clara: total planeado</p>
            </section>
          )}
        </>
      )}
    </Reveal>
  );
}

function Stat({ label, value, href, icon }: { label: string; value: number; href: string; icon?: React.ReactNode }) {
  return (
    <Link data-reveal href={href} className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-lift md:p-5">
      <p className="font-display text-3xl font-semibold text-ink md:text-4xl">
        <CountUp value={value} />
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted md:text-sm">
        {icon}
        {label}
      </p>
    </Link>
  );
}

function SectionTitle({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div data-reveal className="mb-3 flex items-baseline justify-between px-1">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:underline">
        {cta}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
