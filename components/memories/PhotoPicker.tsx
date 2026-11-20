"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_PHOTOS } from "@/lib/constants";
import type { PhotoDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CldPhoto } from "@/components/ui/CldPhoto";

export type NewFile = { key: string; file: File; preview: string };

/**
 * Selector de fotos: muestra las existentes (se pueden quitar) y las nuevas (vista previa local).
 * Admite arrastrar y soltar. Las fotos se suben recién al guardar.
 */
export function PhotoPicker({
  existing,
  keepIds,
  onKeepIdsChange,
  files,
  onFilesChange,
  disabled,
}: {
  existing: PhotoDTO[];
  keepIds: string[];
  onKeepIdsChange: (ids: string[]) => void;
  files: NewFile[];
  onFilesChange: (files: NewFile[]) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const kept = existing.filter((p) => keepIds.includes(p.id));
  const total = kept.length + files.length;
  const left = MAX_PHOTOS - total;

  // Liberar las URLs de vista previa al desmontar
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  function add(list: FileList | File[]) {
    const images = Array.from(list).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!images.length) return;
    if (images.length > left) toast.warning(`Podés tener hasta ${MAX_PHOTOS} fotos por recuerdo`);
    const accepted = images.slice(0, Math.max(left, 0)).map((file) => ({
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    onFilesChange([...files, ...accepted]);
  }

  function removeNew(key: string) {
    const f = files.find((x) => x.key === key);
    if (f) URL.revokeObjectURL(f.preview);
    onFilesChange(files.filter((x) => x.key !== key));
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="label mb-0">Fotos</span>
        <span className="text-xs text-muted">
          {total}/{MAX_PHOTOS}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) add(e.dataTransfer.files);
        }}
        className={cn("grid grid-cols-3 gap-2 rounded-3xl transition sm:grid-cols-4", dragging && "bg-rose-50 ring-2 ring-rose-300 ring-offset-4")}
      >
        {kept.map((p) => (
          <Thumb key={p.id} label="Quitar foto" onRemove={() => onKeepIdsChange(keepIds.filter((id) => id !== p.id))} disabled={disabled}>
            <CldPhoto src={p.url} alt="" sizes="120px" />
          </Thumb>
        ))}
        {files.map((f) => (
          <Thumb key={f.key} label="Quitar foto" onRemove={() => removeNew(f.key)} disabled={disabled} isNew>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.preview} alt="" className="absolute inset-0 size-full object-cover" />
          </Thumb>
        ))}
        {left > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => input.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line-strong text-muted transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            <ImagePlus className="size-6" />
            <span className="text-[12px] font-semibold">{total ? "Agregar" : "Agregar fotos"}</span>
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) add(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="mt-2 text-xs text-muted">Podés arrastrarlas acá. Se optimizan automáticamente antes de subir.</p>
    </div>
  );
}

function Thumb({ children, onRemove, label, disabled, isNew }: { children: React.ReactNode; onRemove: () => void; label: string; disabled?: boolean; isNew?: boolean }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl bg-cream">
      {children}
      {isNew && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-night/70 px-2 py-0.5 text-[10px] font-semibold text-white">Nueva</span>}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={label}
        className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-night/70 text-white backdrop-blur transition hover:bg-danger disabled:opacity-0"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
