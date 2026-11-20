"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { CATEGORIES, CATEGORY_KEYS, type Category } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Búsqueda + filtro por categoría, guardados en la URL (se pueden compartir y el "atrás" funciona). */
export function FilterBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const cat = params.get("cat") as Category | null;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function update(next: { q?: string; cat?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q.trim()) sp.set("q", next.q.trim());
      else sp.delete("q");
    }
    if (next.cat !== undefined) {
      if (next.cat) sp.set("cat", next.cat);
      else sp.delete("cat");
    }
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function onSearch(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ q: value }), 300);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div data-reveal className="mb-6 space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && q && onSearch("")}
          placeholder={placeholder}
          aria-label={placeholder}
          className="field h-12 pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {pending ? (
            <Loader2 className="size-[18px] animate-spin text-rose-500" aria-label="Buscando" />
          ) : q ? (
            <button type="button" onClick={() => onSearch("")} aria-label="Limpiar búsqueda" className="grid size-7 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-ink">
              <X className="size-4" />
            </button>
          ) : null}
        </span>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por categoría">
        <Chip active={!cat} onClick={() => update({ cat: null })}>
          Todas
        </Chip>
        {CATEGORY_KEYS.map((key) => {
          const c = CATEGORIES[key];
          const active = cat === key;
          return (
            <Chip key={key} active={active} onClick={() => update({ cat: active ? null : key })} style={active ? { background: c.soft, color: c.ink, borderColor: c.hex } : undefined}>
              <span aria-hidden>{c.emoji}</span> {c.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ active, children, onClick, style }: { active: boolean; children: React.ReactNode; onClick: () => void; style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={style}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition",
        active ? "border-rose-500 bg-rose-50 text-rose-700" : "border-line bg-paper text-muted hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
