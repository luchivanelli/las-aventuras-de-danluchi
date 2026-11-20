"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: "default" | "danger";
};

/** Menú de acciones (⋯) accesible por teclado. */
export function Menu({ items, label = "Más acciones", className }: { items: MenuItem[]; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    root.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onMenuKey(e: React.KeyboardEvent) {
    const els = Array.from(root.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      els[(i + 1) % els.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      els[(i - 1 + els.length) % els.length]?.focus();
    }
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-rose-50 hover:text-ink"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div
          role="menu"
          onKeyDown={onMenuKey}
          className="absolute right-0 top-10 z-30 min-w-44 overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-lift"
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition focus:bg-rose-50",
                item.tone === "danger" ? "text-danger hover:bg-red-50 focus:bg-red-50" : "text-ink hover:bg-rose-50",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
