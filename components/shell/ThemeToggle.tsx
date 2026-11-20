"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { applyTheme, DEFAULT_PREF, getPref, setPref, subscribe, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePref; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
];

/**
 * Mantiene el tema aplicado: lo re-aplica después de que React resetea <html> en desarrollo
 * (Strict Mode) y sigue los cambios del sistema operativo cuando la preferencia es "Auto".
 * Va una sola vez, en el layout raíz.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyTheme();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getPref() === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return null;
}

/** Selector Claro / Oscuro / Auto. `compact` muestra solo íconos (barra superior en mobile). */
export function ThemeToggle({ compact, className }: { compact?: boolean; className?: string }) {
  const pref = useSyncExternalStore(subscribe, getPref, () => DEFAULT_PREF);

  return (
    <div role="radiogroup" aria-label="Tema de la app" className={cn("flex gap-0.5 rounded-full bg-cream p-1 ring-1 ring-line", className)}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = pref === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={compact ? `Tema: ${label}` : undefined}
            title={label}
            onClick={() => setPref(value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition",
              compact ? "size-8" : "h-8 flex-1",
              active ? "bg-paper text-rose-600 shadow-soft" : "text-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" strokeWidth={active ? 2.4 : 2} />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}
