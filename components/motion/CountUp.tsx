"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const fmt = new Intl.NumberFormat("es-AR");

/** Número que cuenta desde 0 hasta `value` al aparecer. */
export function CountUp({ value, duration = 1.4, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || value === 0) {
        el.textContent = fmt.format(value);
        return;
      }
      const obj = { n: 0 };
      gsap.to(obj, {
        n: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = fmt.format(Math.round(obj.n));
        },
      });
    },
    { dependencies: [value] },
  );

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmt.format(value)}
    </span>
  );
}
