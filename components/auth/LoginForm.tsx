"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Heart, Lock } from "lucide-react";
import { login, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const FIELDS = [
  { name: "day", placeholder: "DD", max: 2, label: "Día" },
  { name: "month", placeholder: "MM", max: 2, label: "Mes" },
  { name: "year", placeholder: "AAAA", max: 4, label: "Año" },
] as const;

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { attempt: 0 });
  const [parts, setParts] = useState(["", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const card = useRef<HTMLDivElement>(null);
  const heart = useRef<HTMLDivElement>(null);
  const complete = parts[0].length > 0 && parts[1].length > 0 && parts[2].length === 4;

  // Entrada
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .from(heart.current, { scale: 0, rotate: -30, duration: 0.8, ease: "back.out(2.2)" })
          .from("[data-intro]", { autoAlpha: 0, y: 18, stagger: 0.08, duration: 0.6, ease: "power3.out" }, "-=0.45");
        gsap.to(heart.current, { scale: 1.08, duration: 0.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
      });
      refs.current[0]?.focus();
    },
    { scope: card },
  );

  // Error: sacudida + limpiar
  useEffect(() => {
    if (!state.error) return;
    gsap.to(card.current, { keyframes: { x: [-12, 10, -8, 6, -3, 0] }, duration: 0.5, ease: "power2.out" });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reiniciar los campos tras un intento fallido
    setParts(["", "", ""]);
    refs.current[0]?.focus();
  }, [state]);

  function change(i: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    // Pegar una fecha completa (25/05/2026 o 25052026) completa los tres campos
    if (i === 0 && digits.length >= 8) {
      setParts([digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]);
      refs.current[2]?.focus();
      return;
    }
    const v = digits.slice(0, FIELDS[i].max);
    const next = [...parts];
    next[i] = v;
    setParts(next);
    if (v.length === FIELDS[i].max && i < 2) refs.current[i + 1]?.focus();
  }

  function keyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace" && parts[i] === "" && i > 0) refs.current[i - 1]?.focus();
    if ((e.key === "/" || e.key === "-") && i < 2) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  }

  return (
    <div ref={card} className="relative w-full max-w-sm">
      <div className="mb-8 text-center">
        <div ref={heart} className="mx-auto mb-5 grid size-20 place-items-center rounded-[1.75rem] bg-gradient-to-br from-rose-400 to-rose-deep shadow-rose">
          <Heart className="size-9 text-white" fill="currentColor" />
        </div>
        <h1 data-intro className="font-display text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-ink">
          Nuestra lista de
          <br />
          <em className="font-medium text-rose-600">aventuras</em>
        </h1>
        <p data-intro className="mt-2 text-[15px] text-muted">
          Este espacio es solo nuestro
        </p>
      </div>

      <form data-intro action={action} className="card p-6 shadow-lift sm:p-7">
        <input type="hidden" name="from" value={from} />
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink/80">
          <Lock className="size-4 text-rose-500" />
          ¿Cuándo nos pusimos de novios?
        </p>

        <div className="flex items-center gap-2">
          {FIELDS.map((f, i) => (
            <div key={f.name} className={cn("contents")}>
              <input
                ref={(el) => {
                  refs.current[i] = el;
                }}
                name={f.name}
                inputMode="numeric"
                autoComplete="off"
                aria-label={f.label}
                placeholder={f.placeholder}
                value={parts[i]}
                onChange={(e) => change(i, e.target.value)}
                onKeyDown={(e) => keyDown(e, i)}
                onFocus={(e) => e.target.select()}
                disabled={pending}
                className={cn(
                  "field h-14 min-w-0 px-2 text-center text-xl font-semibold tracking-wider",
                  i === 2 ? "flex-[1.6]" : "flex-1",
                  state.error && !parts[i] && "border-rose-300 bg-rose-50",
                )}
              />
              {i < 2 && (
                <span className="text-xl font-light text-line-strong" aria-hidden>
                  /
                </span>
              )}
            </div>
          ))}
        </div>

        <p role="alert" aria-live="polite" className={cn("mt-3 min-h-5 text-center text-sm font-medium text-rose-600 transition-opacity", state.error ? "opacity-100" : "opacity-0")}>
          {state.error ?? " "}
        </p>

        <Button type="submit" size="lg" className="mt-3 w-full" disabled={!complete} loading={pending}>
          {pending ? "Verificando…" : "Entrar"}
          {!pending && <Heart className="size-4" fill="currentColor" />}
        </Button>
      </form>
    </div>
  );
}
