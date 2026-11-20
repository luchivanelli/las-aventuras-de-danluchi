"use client";

import gsap from "gsap";

const SHAPES = ["❤️", "💖", "✨", "💕", "🎉", "💗"];

/** Explosión de corazones al completar una aventura. */
export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "100", overflow: "hidden" });
  document.body.appendChild(layer);

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.55;
  const count = window.innerWidth < 640 ? 26 : 40;

  const tl = gsap.timeline({ onComplete: () => layer.remove() });
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.textContent = SHAPES[i % SHAPES.length];
    Object.assign(el.style, { position: "absolute", left: `${cx}px`, top: `${cy}px`, fontSize: `${gsap.utils.random(16, 30)}px`, willChange: "transform" });
    layer.appendChild(el);

    const angle = gsap.utils.random(-Math.PI, 0);
    const dist = gsap.utils.random(140, Math.min(window.innerWidth, 720) * 0.6);
    const piece = gsap
      .timeline()
      .fromTo(
        el,
        { x: 0, y: 0, scale: 0.2, autoAlpha: 1, rotate: 0 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          scale: 1,
          rotate: gsap.utils.random(-60, 60),
          duration: gsap.utils.random(0.7, 1.1),
          ease: "expo.out",
        },
      )
      .to(el, { y: `+=${gsap.utils.random(120, 260)}`, autoAlpha: 0, duration: 1.1, ease: "power1.in" }, ">-0.15");
    tl.add(piece, gsap.utils.random(0, 0.12));
  }
}
