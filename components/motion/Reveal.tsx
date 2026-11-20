"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Anima la entrada de cada hijo marcado con `data-reveal` (stagger).
 * Los elementos que aparecen después (filtros, nuevos planes) también se animan.
 */
export function Reveal({
  children,
  className,
  stagger = 0.05,
  y = 16,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    if (!targets.length) return;
    targets.forEach((el) => el.setAttribute("data-revealed", ""));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      targets,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: first.current ? stagger : Math.min(stagger, 0.03),
        delay: first.current ? delay : 0,
        clearProps: "transform",
      },
    );
    first.current = false;
  });

  return (
    <div ref={ref} className={cn("reveal-scope", className)}>
      {children}
    </div>
  );
}
