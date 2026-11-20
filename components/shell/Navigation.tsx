"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, Images, ListChecks, LogOut, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { usePlanner } from "@/components/plans/PlannerProvider";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type Item = { href: string; label: string; short: string; icon: LucideIcon };

const NAV: Item[] = [
  { href: "/", label: "Inicio", short: "Inicio", icon: House },
  { href: "/planes", label: "Nuestros planes", short: "Planes", icon: ListChecks },
  { href: "/recuerdos", label: "Recuerdos", short: "Recuerdos", icon: Images },
  { href: "/calendario", label: "Calendario", short: "Agenda", icon: CalendarDays },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Puntito que aparece mientras se navega a esa sección (feedback inmediato al tocar). */
function PendingDot() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={cn("absolute right-3 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-rose-500 transition-opacity", pending ? "animate-pulse opacity-100" : "opacity-0")} />;
}

export function Sidebar({ pendingCount, daysTogether }: { pendingCount: number; daysTogether: number }) {
  const pathname = usePathname();
  const { create } = usePlanner();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-paper/80 px-4 py-7 backdrop-blur-xl md:flex">
      <Link href="/" className="mb-8 px-3">
        <Logo />
      </Link>

      <button
        type="button"
        onClick={() => create()}
        className="mb-6 flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-deep font-semibold text-white shadow-rose transition hover:brightness-105 active:scale-[0.98]"
      >
        <Plus className="size-5" />
        Nuevo plan
        <kbd className="ml-1 rounded-md bg-white/20 px-1.5 py-0.5 font-sans text-[11px] font-semibold">N</kbd>
      </button>

      <nav aria-label="Principal" className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-semibold transition",
                active ? "bg-rose-50 text-rose-700" : "text-muted hover:bg-cream hover:text-ink",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              {label}
              {href === "/planes" && pendingCount > 0 && (
                <span className={cn("ml-auto mr-3 rounded-full px-2 py-0.5 text-xs", active ? "bg-rose-100" : "bg-cream text-muted")}>{pendingCount}</span>
              )}
              <PendingDot />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <ThemeToggle />
        <div className="rounded-3xl bg-gradient-to-br from-rose-50 to-gold-soft p-4">
          <p className="text-xs font-semibold text-rose-700">Juntos hace</p>
          <p className="font-display text-2xl font-semibold text-ink">
            {daysTogether.toLocaleString("es-AR")} <span className="text-base font-medium text-muted">días</span>
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-muted transition hover:bg-cream hover:text-ink">
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { create } = usePlanner();
  const [a, b, c, d] = NAV;

  return (
    <nav aria-label="Principal" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5">
        {[a, b].map((item) => (
          <TabLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => create()}
            aria-label="Nuevo plan"
            className="-mt-6 grid size-14 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-rose-deep text-white shadow-rose ring-4 ring-cream transition active:scale-95"
          >
            <Plus className="size-7" strokeWidth={2.5} />
          </button>
        </div>
        {[c, d].map((item) => (
          <TabLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn("flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold transition", active ? "text-rose-600" : "text-muted")}
    >
      <span className={cn("grid h-8 w-14 place-items-center rounded-full transition", active && "bg-rose-50")}>
        <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
      </span>
      {item.short}
    </Link>
  );
}

export function MobileTopBar() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line/70 bg-cream/85 px-4 py-3 backdrop-blur-xl md:hidden">
      <Link href="/" aria-label="Inicio">
        <Logo compact />
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle compact />
        <form action={logout}>
          <button type="submit" aria-label="Cerrar sesión" className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-rose-50 hover:text-ink">
            <LogOut className="size-[18px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
