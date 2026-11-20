"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlanner } from "@/components/plans/PlannerProvider";

/** Atajos de teclado: N = nuevo plan, G+I/P/R/C = ir a sección. */
export function Shortcuts() {
  const { create } = usePlanner();
  const router = useRouter();

  useEffect(() => {
    let g = false;
    let timer: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      const k = e.key.toLowerCase();
      if (g) {
        g = false;
        const to = { i: "/", p: "/planes", r: "/recuerdos", c: "/calendario" }[k];
        if (to) router.push(to);
        return;
      }
      if (k === "n") {
        e.preventDefault();
        create();
      } else if (k === "g") {
        g = true;
        clearTimeout(timer);
        timer = setTimeout(() => (g = false), 800);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [create, router]);

  return null;
}
