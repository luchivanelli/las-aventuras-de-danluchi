"use client";

import { useRouter } from "next/navigation";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { PlanDTO } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Menu } from "@/components/ui/Menu";
import { usePlanner } from "@/components/plans/PlannerProvider";

export function MemoryActions({ plan }: { plan: PlanDTO }) {
  const { editMemory, remove, reopen } = usePlanner();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      <Button variant="secondary" size="sm" onClick={() => editMemory(plan)}>
        <Pencil className="size-4" />
        Editar
      </Button>
      <Menu
        items={[
          {
            label: "Volver a pendiente",
            icon: <RotateCcw className="size-4" />,
            onSelect: () => reopen(plan, { onDone: () => router.push("/planes") }),
          },
          {
            label: "Eliminar",
            icon: <Trash2 className="size-4" />,
            tone: "danger",
            onSelect: () => remove(plan, { onDeleted: () => router.replace("/recuerdos") }),
          },
        ]}
      />
    </div>
  );
}
