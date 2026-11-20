"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center rounded-4xl border border-line bg-paper px-6 py-16 text-center shadow-soft">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-rose-50 text-3xl" aria-hidden>
        🥀
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Algo salió mal</h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted">No pudimos cargar esta sección. Puede ser la conexión; probá de nuevo en un momento.</p>
      <Button className="mt-6" onClick={() => retry()}>
        <RotateCcw className="size-4" />
        Reintentar
      </Button>
    </div>
  );
}
