"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { savePlan } from "@/app/actions/plans";
import { CATEGORIES, CATEGORY_KEYS, PRIORITIES, PRIORITY_KEYS, type Category, type Priority } from "@/lib/constants";
import { fmtDay, shiftDay } from "@/lib/dates";
import { parseISO } from "date-fns";
import type { PlanDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export const PLAN_FORM_ID = "plan-form";

function nextSaturday(today: string) {
  const dow = parseISO(today).getDay(); // 0 dom … 6 sáb
  return shiftDay(today, dow === 6 ? 0 : dow === 0 ? 6 : 6 - dow);
}

export function PlanForm({
  plan,
  defaults,
  today,
  onSaved,
  onPendingChange,
}: {
  plan?: PlanDTO | null;
  defaults?: { date?: string; category?: Category };
  today: string;
  onSaved: () => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [state, action, pending] = useActionState(savePlan, null);
  const [title, setTitle] = useState(plan?.title ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [date, setDate] = useState(plan?.date ?? defaults?.date ?? "");
  const [location, setLocation] = useState(plan?.location ?? "");
  const [category, setCategory] = useState<Category>(plan?.category ?? defaults?.category ?? "citas");
  const [priority, setPriority] = useState<Priority>(plan?.priority ?? "media");
  const ids = { title: useId(), desc: useId(), date: useId(), loc: useId() };

  useEffect(() => onPendingChange?.(pending), [pending, onPendingChange]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onSaved();
    } else {
      toast.error(state.message);
    }
  }, [state, onSaved]);

  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};
  const quickDates = [
    { label: "Hoy", value: today },
    { label: "Mañana", value: shiftDay(today, 1) },
    { label: "Este finde", value: nextSaturday(today) },
    { label: "Sin fecha", value: "" },
  ];

  return (
    <form id={PLAN_FORM_ID} action={action} className="flex flex-col gap-6" noValidate>
      {plan && <input type="hidden" name="id" value={plan.id} />}

      <div>
        <label htmlFor={ids.title} className="label">
          ¿Qué quieren hacer?
        </label>
        <input
          id={ids.title}
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Cenar en ese lugar nuevo de Palermo"
          className={cn("field text-base", errors.title && "border-danger focus:ring-red-100")}
          maxLength={120}
          autoComplete="off"
          aria-invalid={!!errors.title}
          data-autofocus={plan ? undefined : true}
        />
        {errors.title && <p className="mt-1.5 text-[13px] font-medium text-danger">{errors.title[0]}</p>}
      </div>

      <fieldset>
        <legend className="label">Categoría</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {CATEGORY_KEYS.map((key) => {
            const c = CATEGORIES[key];
            const active = category === key;
            return (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-[12px] font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rose-400",
                  active ? "border-transparent shadow-soft" : "border-line text-muted hover:border-line-strong hover:bg-cream",
                )}
                style={active ? { background: c.soft, color: c.ink, boxShadow: `inset 0 0 0 2px ${c.hex}` } : undefined}
              >
                <input type="radio" name="category" value={key} checked={active} onChange={() => setCategory(key)} className="sr-only" />
                <span className="text-xl leading-none" aria-hidden>
                  {c.emoji}
                </span>
                {c.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor={ids.date} className="label">
          ¿Cuándo?
        </label>
        <div className="mb-2.5 flex flex-wrap gap-2">
          {quickDates.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => setDate(q.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition",
                date === q.value ? "border-rose-500 bg-rose-50 text-rose-700" : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
        <input id={ids.date} type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
        {date && <p className="mt-1.5 text-[13px] capitalize text-muted">{fmtDay(date, "EEEE d 'de' MMMM 'de' yyyy")}</p>}
        {errors.date && <p className="mt-1.5 text-[13px] font-medium text-danger">{errors.date[0]}</p>}
      </div>

      <div>
        <label htmlFor={ids.loc} className="label">
          ¿Dónde? <span className="font-normal text-muted">(opcional)</span>
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id={ids.loc}
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Barrio, lugar o ciudad"
            className="field pl-10"
            maxLength={120}
          />
        </div>
      </div>

      <fieldset>
        <legend className="label">Importancia</legend>
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-cream p-1">
          {PRIORITY_KEYS.slice()
            .reverse()
            .map((key) => {
              const p = PRIORITIES[key];
              const active = priority === key;
              return (
                <label
                  key={key}
                  title={p.hint}
                  className={cn(
                    "cursor-pointer rounded-xl py-2.5 text-center text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rose-400",
                    active ? "bg-paper text-rose-700 shadow-soft" : "text-muted hover:text-ink",
                  )}
                >
                  <input type="radio" name="priority" value={key} checked={active} onChange={() => setPriority(key)} className="sr-only" />
                  {key === "alta" && "⭐ "}
                  {p.label}
                </label>
              );
            })}
        </div>
        <p className="mt-1.5 text-[13px] text-muted">{PRIORITIES[priority].hint}</p>
      </fieldset>

      <div>
        <label htmlFor={ids.desc} className="label">
          Detalles <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id={ids.desc}
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ideas, links, qué llevar…"
          className="field resize-none"
          maxLength={1000}
        />
      </div>

      {/* Envío con Enter desde el teclado aunque el botón esté en el footer */}
      <button type="submit" hidden disabled={pending} />
    </form>
  );
}

export function PlanFormFooter({ editing, pending, onCancel }: { editing: boolean; pending: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-3">
      <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={pending}>
        Cancelar
      </Button>
      <Button type="submit" form={PLAN_FORM_ID} className="flex-[1.4]" loading={pending}>
        {pending ? "Guardando…" : editing ? "Guardar cambios" : "Agregar plan"}
      </Button>
    </div>
  );
}
