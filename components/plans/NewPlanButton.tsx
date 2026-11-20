"use client";

import { Plus } from "lucide-react";
import type { Category } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { usePlanner } from "./PlannerProvider";

export function NewPlanButton({
  label = "Nuevo plan",
  defaults,
  className,
  variant = "primary",
  size = "md",
}: {
  label?: string;
  defaults?: { date?: string; category?: Category };
  className?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}) {
  const { create } = usePlanner();
  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={() => create(defaults)}>
      <Plus className="size-[18px]" strokeWidth={2.5} />
      {label}
    </Button>
  );
}
