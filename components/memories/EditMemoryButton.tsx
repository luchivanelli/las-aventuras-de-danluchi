"use client";

import type { ReactNode } from "react";
import type { PlanDTO } from "@/lib/types";
import { usePlanner } from "@/components/plans/PlannerProvider";

export function EditMemoryButton({ plan, className, children }: { plan: PlanDTO; className?: string; children: ReactNode }) {
  const { editMemory } = usePlanner();
  return (
    <button type="button" className={className} onClick={() => editMemory(plan)}>
      {children}
    </button>
  );
}
