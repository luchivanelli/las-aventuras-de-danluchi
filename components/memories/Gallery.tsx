"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PhotoDTO } from "@/lib/types";
import { cldUrl } from "@/lib/cld";
import { cn } from "@/lib/utils";
import { CldPhoto } from "@/components/ui/CldPhoto";

/** Mosaico de fotos + visor a pantalla completa (teclado, flechas y deslizar). */
export function Gallery({ photos, title }: { photos: PhotoDTO[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  if (!photos.length) return null;

  const layout =
    photos.length === 1
      ? "grid-cols-1"
      : photos.length === 2
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-4 sm:grid-rows-2";

  return (
    <>
      <div className={cn("grid gap-2 overflow-hidden rounded-4xl sm:gap-3", layout)}>
        {photos.slice(0, 5).map((p, i) => {
          const hero = photos.length >= 3 && i === 0;
          const extra = i === 4 && photos.length > 5 ? photos.length - 5 : 0;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1} de ${photos.length}`}
              className={cn(
                "group relative overflow-hidden bg-rose-50",
                photos.length === 1 ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-square",
                hero && "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto",
                photos.length === 3 && i > 0 && "sm:col-span-2 sm:aspect-[2/1]",
                photos.length === 4 && i === 3 && "col-span-2 aspect-[2/1]",
              )}
            >
              <CldPhoto src={p.url} alt={`${title} — foto ${i + 1}`} sizes={hero || photos.length === 1 ? "(min-width: 768px) 600px, 100vw" : "(min-width: 768px) 300px, 50vw"} priority={i === 0} className="transition duration-500 group-hover:scale-105" />
              {extra > 0 && <span className="absolute inset-0 grid place-items-center bg-night/50 font-display text-3xl font-semibold text-white">+{extra}</span>}
            </button>
          );
        })}
      </div>
      {index !== null && <Lightbox photos={photos} start={index} title={title} onClose={() => setIndex(null)} />}
    </>
  );
}

function Lightbox({ photos, start, title, onClose }: { photos: PhotoDTO[]; start: number; title: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const touch = useRef<number | null>(null);
  const dir = useRef(0);

  const go = useCallback(
    (delta: number) => {
      dir.current = delta;
      setI((x) => (x + delta + photos.length) % photos.length);
    },
    [photos.length],
  );

  const close = useCallback(() => {
    gsap.to(root.current, { autoAlpha: 0, duration: 0.2, onComplete: onClose });
  }, [onClose]);

  useEffect(() => {
    gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    root.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [go, close]);

  useEffect(() => {
    if (!img.current) return;
    gsap.fromTo(img.current, { autoAlpha: 0, x: dir.current * 40, scale: 0.98 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.35, ease: "power3.out" });
  }, [i]);

  const p = photos[i];

  return createPortal(
    <div
      ref={root}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — foto ${i + 1} de ${photos.length}`}
      className="invisible fixed inset-0 z-[60] flex flex-col bg-[#120c0f]/95 outline-none backdrop-blur"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between p-4 text-white/80">
        <span className="text-sm font-semibold tabular-nums">
          {i + 1} / {photos.length}
        </span>
        <button type="button" onClick={close} aria-label="Cerrar" className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-16" onClick={(e) => e.target === e.currentTarget && close()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={img} key={p.id} src={cldUrl(p.url, { width: 2000 })} alt={`${title} — foto ${i + 1}`} className="max-h-full max-w-full select-none rounded-2xl object-contain" draggable={false} />
        {photos.length > 1 && (
          <>
            <NavBtn side="left" onClick={() => go(-1)} />
            <NavBtn side="right" onClick={() => go(1)} />
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 pb-6">
          {photos.map((ph, j) => (
            <button
              key={ph.id}
              type="button"
              onClick={() => {
                dir.current = j > i ? 1 : -1;
                setI(j);
              }}
              aria-label={`Ir a la foto ${j + 1}`}
              aria-current={j === i}
              className={cn("relative size-14 shrink-0 overflow-hidden rounded-xl transition", j === i ? "ring-2 ring-white" : "opacity-50 hover:opacity-90")}
            >
              <CldPhoto src={ph.url} alt="" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

function NavBtn({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Foto anterior" : "Foto siguiente"}
      className={cn(
        "absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:grid",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-6" />
    </button>
  );
}
