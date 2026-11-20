"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { saveMemory } from "@/app/actions/memories";
import { discardUploads } from "@/app/actions/uploads";
import { uploadPhotos } from "@/lib/upload-client";
import { celebrate } from "@/lib/celebrate";
import { fmtDay } from "@/lib/dates";
import type { PlanDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { PhotoPicker, type NewFile } from "./PhotoPicker";

export const MEMORY_FORM_ID = "memory-form";

type Phase = "idle" | "uploading" | "saving";

export function MemoryForm({
  plan,
  today,
  onSaved,
  onBusyChange,
}: {
  plan: PlanDTO;
  today: string;
  onSaved: () => void;
  onBusyChange?: (busy: boolean, phase: Phase, progress: number) => void;
}) {
  const editing = plan.status === "completado" && !!plan.memory;
  const m = plan.memory;
  const defaultDate = m?.date ?? (plan.date && plan.date <= today ? plan.date : today);

  const [note, setNote] = useState(m?.note ?? "");
  const [reflection, setReflection] = useState(m?.reflection ?? "");
  const [date, setDate] = useState(defaultDate);
  const [keepIds, setKeepIds] = useState<string[]>(m?.photos.map((p) => p.id) ?? []);
  const [files, setFiles] = useState<NewFile[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [, startTransition] = useTransition();
  const ids = { note: useId(), refl: useId(), date: useId() };
  const busy = phase !== "idle";

  useEffect(() => onBusyChange?.(busy, phase, progress), [busy, phase, progress, onBusyChange]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErrors({});

    let uploaded: Awaited<ReturnType<typeof uploadPhotos>> = [];
    try {
      if (files.length) {
        setPhase("uploading");
        setProgress(0);
        uploaded = await uploadPhotos(
          files.map((f) => f.file),
          setProgress,
        );
      }
    } catch (err) {
      setPhase("idle");
      toast.error(err instanceof Error ? err.message : "No se pudieron subir las fotos");
      return;
    }

    setPhase("saving");
    startTransition(async () => {
      const res = await saveMemory({ planId: plan.id, note, reflection, date, keepPhotoIds: keepIds, newPhotos: uploaded });
      if (res.ok) {
        if (!editing) celebrate();
        toast.success(res.message);
        setFiles([]);
        setPhase("idle");
        onSaved();
      } else {
        if (uploaded.length) discardUploads(uploaded.map((p) => p.publicId)).catch(() => {});
        setErrors(res.fieldErrors ?? {});
        setPhase("idle");
        toast.error(res.message);
      }
    });
  }

  return (
    <form id={MEMORY_FORM_ID} onSubmit={submit} className="flex flex-col gap-6">
      <PhotoPicker existing={m?.photos ?? []} keepIds={keepIds} onKeepIdsChange={setKeepIds} files={files} onFilesChange={setFiles} disabled={busy} />

      <div>
        <label htmlFor={ids.note} className="label">
          ¿Cómo estuvo?
        </label>
        <textarea
          id={ids.note}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Lo que pasó, lo que se rieron, ese detalle que no quieren olvidar…"
          className="field resize-none leading-relaxed"
          maxLength={4000}
          disabled={busy}
        />
        {errors.note && <p className="mt-1.5 text-[13px] font-medium text-danger">{errors.note[0]}</p>}
      </div>

      <div>
        <label htmlFor={ids.refl} className="label">
          En una frase <span className="font-normal text-muted">(opcional)</span>
        </label>
        <input
          id={ids.refl}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Ej: El mejor atardecer del año"
          className="field"
          maxLength={280}
          disabled={busy}
        />
        {errors.reflection && <p className="mt-1.5 text-[13px] font-medium text-danger">{errors.reflection[0]}</p>}
      </div>

      <div>
        <label htmlFor={ids.date} className="label">
          ¿Cuándo fue?
        </label>
        <input id={ids.date} type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="field" disabled={busy} required />
        {date && <p className="mt-1.5 text-[13px] capitalize text-muted">{fmtDay(date, "EEEE d 'de' MMMM 'de' yyyy")}</p>}
        {errors.date && <p className="mt-1.5 text-[13px] font-medium text-danger">{errors.date[0]}</p>}
      </div>
    </form>
  );
}

export function MemoryFormFooter({
  editing,
  phase,
  progress,
  onCancel,
}: {
  editing: boolean;
  phase: Phase;
  progress: number;
  onCancel: () => void;
}) {
  const busy = phase !== "idle";
  const label =
    phase === "uploading" ? `Subiendo fotos… ${Math.round(progress * 100)}%` : phase === "saving" ? "Guardando…" : editing ? "Guardar cambios" : "¡Lo hicimos!";
  return (
    <div>
      {phase === "uploading" && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-rose-100" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-deep transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={busy}>
          {editing ? "Cancelar" : "Después"}
        </Button>
        <Button type="submit" form={MEMORY_FORM_ID} className={cn("flex-[1.4]")} loading={busy}>
          {!busy && !editing && <Heart className="size-4" fill="currentColor" />}
          {label}
        </Button>
      </div>
    </div>
  );
}
