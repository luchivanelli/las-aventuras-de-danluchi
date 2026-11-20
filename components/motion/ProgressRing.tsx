"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function ProgressRing({ percent, size = 120, stroke = 10 }: { percent: number; size?: number; stroke?: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.min(Math.max(percent, 0), 100) / 100);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(ref.current, { strokeDashoffset: c }, { strokeDashoffset: target, duration: 1.6, ease: "power3.out", delay: 0.2 });
    },
    { dependencies: [target] },
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d57a90" />
          <stop offset="100%" stopColor="#a9435b" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: "var(--color-rose-100)" }} strokeWidth={stroke} />
      <circle
        ref={ref}
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={target}
      />
    </svg>
  );
}
