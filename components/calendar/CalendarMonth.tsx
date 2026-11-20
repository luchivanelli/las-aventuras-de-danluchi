"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  addMonths,
  differenceInCalendarMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { Check, ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/constants";
import { fmtDay, relativeDay, toDay } from "@/lib/dates";
import type { PlanDTO } from "@/lib/types";
import { cn, plural } from "@/lib/utils";
import { usePlanner } from "@/components/plans/PlannerProvider";
import { CldPhoto } from "@/components/ui/CldPhoto";

gsap.registerPlugin(useGSAP);

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function shiftMonth(month: string, n: number) {
  return format(addMonths(parseISO(`${month}-01`), n), "yyyy-MM");
}

/** Si `day` es un mesiversario desde `since`, devuelve cuántos meses se cumplen. */
function monthsTogether(day: string, since: string | undefined): number | null {
  if (!since || day.slice(8) !== since.slice(8)) return null;
  const n = differenceInCalendarMonths(parseISO(day), parseISO(since));
  return n > 0 ? n : null;
}

function anniversaryText(months: number) {
  if (months % 12 === 0) return `¡${plural(months / 12, "año", "años")} juntos!`;
  return months === 1 ? "Se cumple 1 mes juntos" : `Se cumplen ${months} meses juntos`;
}

/** Primera foto de un recuerdo de ese día (para usarla de portada en la celda). */
function coverOf(items: PlanDTO[]) {
  for (const p of items) {
    const photo = p.status === "completado" ? p.memory?.photos[0] : undefined;
    if (photo) return photo.url;
  }
  return null;
}

export function CalendarMonth({ month, plans, since }: { month: string; plans: PlanDTO[]; since?: string }) {
  const { today, create, edit, complete } = usePlanner();
  const grid = useRef<HTMLDivElement>(null);
  const currentMonth = today.slice(0, 7);

  const byDay = useMemo(() => {
    const map = new Map<string, PlanDTO[]>();
    for (const p of plans) if (p.date) map.set(p.date, [...(map.get(p.date) ?? []), p]);
    return map;
  }, [plans]);

  const days = useMemo(() => {
    const first = parseISO(`${month}-01`);
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(first), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(first), { weekStartsOn: 1 }),
    }).map(toDay);
  }, [month]);

  const legend = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of plans) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return CATEGORY_KEYS.filter((k) => counts.has(k)).map((k) => ({ key: k, n: counts.get(k)!, ...CATEGORIES[k] }));
  }, [plans]);

  const pending = plans.filter((p) => p.status === "pendiente").length;
  const done = plans.length - pending;

  const initial = today.startsWith(month) ? today : (plans.find((p) => p.date)?.date ?? `${month}-01`);
  const [selected, setSelected] = useState(initial);
  // Si cambia el mes (navegación), reiniciamos la selección.
  const [prevMonth, setPrevMonth] = useState(month);
  if (prevMonth !== month) {
    setPrevMonth(month);
    setSelected(initial);
  }

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-cell] > *", {
        autoAlpha: 0,
        y: 4,
        duration: 0.3,
        stagger: { each: 0.004, from: "start" },
        ease: "power2.out",
        clearProps: "opacity,visibility,transform",
      });
    },
    // revertOnUpdate: deshace la animación anterior antes de animar el mes nuevo,
    // así ningún día queda congelado a mitad de animación (invisible).
    { scope: grid, dependencies: [month], revertOnUpdate: true },
  );

  const selectedPlans = byDay.get(selected) ?? [];
  const selectedMonths = monthsTogether(selected, since);
  const first = parseISO(`${month}-01`);
  const nav =
    "grid size-10 place-items-center rounded-full bg-white/10 text-on-dark ring-1 ring-white/15 transition hover:bg-white/20 focus-visible:outline-on-dark";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
      <section data-reveal className="card overflow-hidden">
        {/* Tapa de la agenda */}
        <header className="relative overflow-hidden bg-linear-to-br from-wine-900 via-wine-800 to-rose-deep px-5 pb-6 pt-5 text-on-dark sm:px-7 sm:pt-6">
          <Heart aria-hidden className="pointer-events-none absolute -bottom-10 -right-6 size-44 rotate-12 fill-white/5 text-white/10" strokeWidth={1} />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-on-dark/70">{format(first, "yyyy")}</p>
              <h1 className="font-display text-[2.5rem] font-semibold italic capitalize leading-none tracking-tight sm:text-5xl">
                {format(first, "MMMM", { locale: es })}
              </h1>
              <p className="mt-2.5 text-sm text-on-dark/75">
                {plans.length ? `${plural(pending, "plan", "planes")} por hacer · ${plural(done, "hecho", "hechos")}` : "Mes libre, ¡a planear!"}
              </p>
            </div>
            <nav className="flex shrink-0 items-center gap-1.5" aria-label="Cambiar de mes">
              {month !== currentMonth && (
                <Link href="/calendario" scroll={false} className="mr-1 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/20">
                  Hoy
                </Link>
              )}
              <Link href={`/calendario?m=${shiftMonth(month, -1)}`} className={nav} aria-label="Mes anterior" scroll={false}>
                <ChevronLeft className="size-5" />
              </Link>
              <Link href={`/calendario?m=${shiftMonth(month, 1)}`} className={nav} aria-label="Mes siguiente" scroll={false}>
                <ChevronRight className="size-5" />
              </Link>
            </nav>
          </div>
        </header>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-line text-center text-[11px] font-bold uppercase tracking-widest">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={cn("py-2.5", i >= 5 ? "text-rose-500" : "text-muted")}>
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        {/* Grilla */}
        <div ref={grid} className="grid grid-cols-7 gap-px bg-line">
          {days.map((day, i) => {
            const items = byDay.get(day) ?? [];
            const inMonth = day.startsWith(month);
            const weekend = i % 7 >= 5;
            const isToday = day === today;
            const isSel = day === selected;
            const months = inMonth ? monthsTogether(day, since) : null;
            const cover = inMonth ? coverOf(items) : null;
            return (
              <button
                key={day}
                data-cell
                type="button"
                onClick={() => setSelected(day)}
                onDoubleClick={() => create({ date: day })}
                aria-pressed={isSel}
                aria-label={[
                  fmtDay(day, "EEEE d 'de' MMMM"),
                  items.length ? plural(items.length, "plan", "planes") : "",
                  months ? anniversaryText(months) : "",
                ]
                  .filter(Boolean)
                  .join(", ")}
                className={cn(
                  "group relative flex min-h-16 flex-col p-1.5 text-left transition-colors focus-visible:z-20 focus-visible:-outline-offset-2 sm:min-h-28 sm:p-2",
                  !inMonth ? "cal-out" : weekend ? "bg-tint hover:bg-rose-50" : "bg-paper hover:bg-rose-50/70",
                  isSel && "z-10 bg-rose-50 shadow-[inset_0_0_0_2px_var(--color-rose-500)]",
                )}
              >
                {cover && (
                  <>
                    <CldPhoto src={cover} alt="" sizes="(min-width: 640px) 120px, 56px" className="transition duration-300 group-hover:scale-105" />
                    <span aria-hidden className="absolute inset-0 bg-linear-to-b from-wine-900/55 via-wine-900/10 to-wine-900/45" />
                  </>
                )}

                <span className="relative flex items-center justify-between">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full font-display text-[15px] font-semibold tabular-nums sm:size-8 sm:text-base",
                      isToday
                        ? "bg-rose-500 text-white shadow-rose"
                        : cover
                          ? "text-white"
                          : !inMonth
                            ? "text-muted/45"
                            : isSel
                              ? "text-rose-700"
                              : "text-ink",
                    )}
                  >
                    {Number(day.slice(8))}
                  </span>
                  {months && (
                    <Heart
                      aria-hidden
                      className={cn(
                        "absolute right-0 top-0 size-2.5 sm:static sm:size-3.5",
                        cover ? "fill-white text-white" : "fill-rose-500 text-rose-500",
                      )}
                    />
                  )}
                </span>

                {/* Mobile: barritas */}
                {items.length > 0 && (
                  <span className="relative mt-auto flex flex-col gap-0.5 pb-0.5 sm:hidden">
                    {items.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className={cn("h-1 w-full rounded-full", p.status === "completado" && "opacity-45")}
                        style={{ background: cover ? "#fff" : CATEGORIES[p.category].hex }}
                      />
                    ))}
                  </span>
                )}

                {/* Desktop: etiquetas */}
                {items.length > 0 && (
                  <span className="relative mt-1.5 hidden flex-col gap-1 sm:flex">
                    {items.slice(0, 2).map((p) => {
                      const c = CATEGORIES[p.category];
                      const isDone = p.status === "completado";
                      return (
                        <span
                          key={p.id}
                          className={cn(
                            "flex min-w-0 items-center gap-1 rounded-md border-l-[3px] px-1.5 py-0.5 text-[11px] font-semibold leading-tight",
                            isDone && !cover && "opacity-60",
                          )}
                          style={{ borderColor: c.hex, background: c.soft, color: c.ink }}
                        >
                          {isDone && <Check className="size-3 shrink-0" strokeWidth={3} />}
                          <span className="truncate">{p.title}</span>
                        </span>
                      );
                    })}
                    {items.length > 2 && (
                      <span className={cn("px-1 text-[11px] font-semibold", cover ? "text-white" : "text-muted")}>+{items.length - 2} más</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <footer className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
          {legend.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink/80">
              <span className="size-2 rounded-full" style={{ background: c.hex }} />
              {c.label}
              <span className="text-muted">{c.n}</span>
            </span>
          ))}
          {since && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
              <Heart className="size-3 fill-rose-500 text-rose-500" />
              Mesiversario
            </span>
          )}
          <span className="ml-auto hidden text-xs text-muted sm:inline">Doble clic en un día para planear algo</span>
        </footer>
      </section>

      {/* Hoja del día */}
      <aside data-reveal className="card overflow-hidden lg:sticky lg:top-8" aria-live="polite">
        <div className="flex items-center gap-4 border-b border-line bg-cream/60 p-5">
          <div className="grid w-16 shrink-0 justify-items-center rounded-2xl bg-wine-800 pb-2 pt-1.5 text-on-dark shadow-lift">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-dark/70">{fmtDay(selected, "EEE")}</span>
            <span className="font-display text-3xl font-semibold leading-none">{Number(selected.slice(8))}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-rose-600">{relativeDay(selected, today)}</p>
            <h2 className="font-display text-xl font-semibold capitalize leading-tight text-ink">{fmtDay(selected, "EEEE d 'de' MMMM")}</h2>
          </div>
        </div>

        <div className="p-5">
          {selectedMonths && (
            <p className="mb-4 flex items-center gap-2.5 rounded-2xl bg-gold-soft px-4 py-3 text-sm font-semibold text-gold-ink">
              <Heart className="size-4 shrink-0 fill-rose-500 text-rose-500" />
              {anniversaryText(selectedMonths)}
            </p>
          )}

          {selectedPlans.length === 0 ? (
            <p className="mb-4 text-sm text-muted">No hay nada planeado para este día.</p>
          ) : (
            <ul className="mb-4 space-y-1.5">
              {selectedPlans.map((p) => {
                const c = CATEGORIES[p.category];
                const isDone = p.status === "completado";
                const body = (
                  <>
                    <span className="w-1 self-stretch rounded-full" style={{ background: c.hex }} aria-hidden />
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl text-lg" style={{ background: c.soft }} aria-hidden>
                      {c.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[15px] font-semibold text-ink", isDone && "text-muted line-through")}>{p.title}</span>
                      <span className="block truncate text-xs font-medium" style={{ color: c.ink }}>
                        {isDone ? "Hecho · ver recuerdo" : c.label}
                        {p.location && !isDone ? ` · ${p.location}` : ""}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={p.id} className="flex items-center gap-2">
                    {isDone ? (
                      <Link href={`/recuerdos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-2 transition hover:bg-cream">
                        {body}
                        <ChevronRight className="size-4 text-muted" />
                      </Link>
                    ) : (
                      <>
                        <button type="button" onClick={() => edit(p)} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-cream">
                          {body}
                        </button>
                        <button
                          type="button"
                          onClick={() => complete(p)}
                          aria-label={`Marcar "${p.title}" como hecho`}
                          className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-line-strong text-transparent transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Check className="size-4" strokeWidth={3} />
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={() => create({ date: selected })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-wine-800 py-3 text-sm font-semibold text-on-dark shadow-lift transition hover:bg-wine-700"
          >
            <Plus className="size-4" />
            Planear algo para este día
          </button>
        </div>
      </aside>
    </div>
  );
}
