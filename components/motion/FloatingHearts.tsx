"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const HEARTS = [
  { left: "8%", top: "18%", size: 22 },
  { left: "86%", top: "12%", size: 30 },
  { left: "72%", top: "64%", size: 18 },
  { left: "18%", top: "72%", size: 26 },
  { left: "46%", top: "8%", size: 14 },
  { left: "92%", top: "84%", size: 20 },
  { left: "4%", top: "46%", size: 16 },
];

/** Corazones decorativos que flotan suavemente. */
export function FloatingHearts({ className, color = "currentColor" }: { className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-heart]").forEach((el, i) => {
          gsap.fromTo(el, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 1, delay: 0.2 + i * 0.12, ease: "back.out(2)" });
          gsap.to(el, {
            y: gsap.utils.random(-22, -10),
            x: gsap.utils.random(-8, 8),
            rotate: gsap.utils.random(-14, 14),
            duration: gsap.utils.random(2.6, 4.2),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.3,
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {HEARTS.map((h, i) => (
        <svg
          key={i}
          data-heart
          viewBox="0 0 24 24"
          width={h.size}
          height={h.size}
          className="absolute"
          style={{ left: h.left, top: h.top, color }}
        >
          <path
            fill="currentColor"
            d="M12 21s-7.5-4.6-10-9.3C.4 8.3 2.3 4.5 6 4.5c2.2 0 3.6 1.2 4.4 2.4h3.2c.8-1.2 2.2-2.4 4.4-2.4 3.7 0 5.6 3.8 4 7.2C19.5 16.4 12 21 12 21z"
          />
        </svg>
      ))}
    </div>
  );
}
