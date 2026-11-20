"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Contenido fijo abajo (botones). */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Evita cerrar mientras se guarda algo. */
  dismissible?: boolean;
};

/**
 * Hoja inferior en mobile / diálogo centrado en desktop, animada con GSAP.
 * Cierra con Esc, tocando afuera o con el botón ×. Bloquea el scroll de fondo y devuelve el foco.
 */
export function Sheet({ open, onClose, title, description, children, footer, size = "md", dismissible = true }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  if (open && !mounted) setMounted(true);

  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Entrada
  useGSAP(
    () => {
      if (!open || !mounted || !panelRef.current || !overlayRef.current) return;
      lastFocus.current = document.activeElement as HTMLElement | null;
      const d = reduced() ? 0 : 1;
      gsap.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 * d });
      gsap.fromTo(
        panelRef.current,
        isDesktop() ? { autoAlpha: 0, y: 24, scale: 0.97 } : { yPercent: 100 },
        isDesktop()
          ? { autoAlpha: 1, y: 0, scale: 1, duration: 0.4 * d, ease: "power3.out" }
          : { yPercent: 0, duration: 0.45 * d, ease: "expo.out" },
      );
      const focusable = panelRef.current.querySelector<HTMLElement>("[data-autofocus], input:not([type=hidden]), textarea, button:not([data-close])");
      // En mobile no abrimos el teclado de golpe salvo que se pida explícitamente.
      (isDesktop() || focusable?.hasAttribute("data-autofocus") ? focusable : panelRef.current)?.focus({ preventScroll: true });
    },
    { dependencies: [open, mounted] },
  );

  // Salida
  useEffect(() => {
    if (open || !mounted) return;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay || reduced()) {
      setMounted(false);
      lastFocus.current?.focus?.();
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        setMounted(false);
        lastFocus.current?.focus?.();
      },
    });
    tl.to(panel, isDesktop() ? { autoAlpha: 0, y: 16, scale: 0.98, duration: 0.2, ease: "power2.in" } : { yPercent: 100, duration: 0.28, ease: "power2.in" }, 0);
    tl.to(overlay, { autoAlpha: 0, duration: 0.22 }, 0);
    return () => {
      tl.kill();
    };
  }, [open, mounted]);

  // Esc + bloqueo de scroll
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
      if (e.key === "Tab" && panelRef.current) trapFocus(e, panelRef.current);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mounted, dismissible, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div
        ref={overlayRef}
        className="invisible absolute inset-0 bg-night/40 backdrop-blur-[3px]"
        onClick={() => dismissible && onClose()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-paper shadow-2xl outline-none md:max-h-[88dvh] md:rounded-4xl",
          size === "sm" && "md:max-w-sm",
          size === "md" && "md:max-w-lg",
          size === "lg" && "md:max-w-2xl",
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden />
        <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-3 pt-4 md:pt-6">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-[1.4rem] font-semibold leading-tight text-ink">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              data-close
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-rose-50 hover:text-ink"
            >
              <X className="size-5" />
            </button>
          )}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">{children}</div>
        {footer && <footer className="pb-safe shrink-0 border-t border-line bg-paper px-6 pt-3 md:pb-5">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

function trapFocus(e: KeyboardEvent, root: HTMLElement) {
  const items = Array.from(
    root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input:not([type=hidden]):not([disabled]), select, [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
