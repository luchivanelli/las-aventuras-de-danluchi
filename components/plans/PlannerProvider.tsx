"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { deletePlan, reopenPlan } from "@/app/actions/plans";
import type { Category } from "@/lib/constants";
import type { PlanDTO } from "@/lib/types";
import { Sheet } from "@/components/ui/Sheet";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { PlanForm, PlanFormFooter } from "./PlanForm";
import { MemoryForm, MemoryFormFooter } from "@/components/memories/MemoryForm";

type Panel =
  | { kind: "create"; defaults?: { date?: string; category?: Category }; key: number }
  | { kind: "edit"; plan: PlanDTO; key: number }
  | { kind: "memory"; plan: PlanDTO; key: number };

type Planner = {
  today: string;
  create: (defaults?: { date?: string; category?: Category }) => void;
  edit: (plan: PlanDTO) => void;
  complete: (plan: PlanDTO) => void;
  editMemory: (plan: PlanDTO) => void;
  remove: (plan: PlanDTO, opts?: { onDeleted?: () => void; onOptimistic?: () => void }) => Promise<void>;
  reopen: (plan: PlanDTO, opts?: { onDone?: () => void }) => void;
  isMutating: boolean;
};

type PanelInput = Panel extends infer P ? (P extends Panel ? Omit<P, "key"> : never) : never;

const Ctx = createContext<Planner | null>(null);

export function usePlanner() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlanner debe usarse dentro de <PlannerProvider>");
  return ctx;
}

export function PlannerProvider({ today, children }: { today: string; children: ReactNode }) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [open, setOpen] = useState(false);
  const [planPending, setPlanPending] = useState(false);
  const [memState, setMemState] = useState<{ busy: boolean; phase: "idle" | "uploading" | "saving"; progress: number }>({ busy: false, phase: "idle", progress: 0 });
  const [isMutating, startTransition] = useTransition();
  const confirm = useConfirm();

  const show = useCallback((p: PanelInput) => {
    setPanel({ ...p, key: Date.now() } as Panel);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const onMemBusy = useCallback((busy: boolean, phase: "idle" | "uploading" | "saving", progress: number) => setMemState({ busy, phase, progress }), []);

  const remove = useCallback<Planner["remove"]>(
    async (plan, opts) => {
      const ok = await confirm({
        title: "¿Eliminar este plan?",
        description:
          plan.status === "completado"
            ? `Se borra "${plan.title}" junto con su recuerdo y sus fotos. No se puede deshacer.`
            : `Se borra "${plan.title}". No se puede deshacer.`,
        confirmLabel: "Eliminar",
      });
      if (!ok) return;
      startTransition(async () => {
        opts?.onOptimistic?.();
        const res = await deletePlan(plan.id);
        if (res.ok) {
          toast.success(res.message);
          opts?.onDeleted?.();
        } else toast.error(res.message);
      });
    },
    [confirm],
  );

  const reopen = useCallback<Planner["reopen"]>((plan, opts) => {
    startTransition(async () => {
      const res = await reopenPlan(plan.id);
      if (res.ok) {
        toast.success(res.message);
        opts?.onDone?.();
      } else toast.error(res.message);
    });
  }, []);

  const value = useMemo<Planner>(
    () => ({
      today,
      create: (defaults) => show({ kind: "create", defaults }),
      edit: (plan) => show({ kind: "edit", plan }),
      complete: (plan) => show({ kind: "memory", plan }),
      editMemory: (plan) => show({ kind: "memory", plan }),
      remove,
      reopen,
      isMutating,
    }),
    [today, show, remove, reopen, isMutating],
  );

  const busy = panel?.kind === "memory" ? memState.busy : planPending;
  let title = "";
  let description: ReactNode = null;
  let body: ReactNode = null;
  let footer: ReactNode = null;

  if (panel?.kind === "create" || panel?.kind === "edit") {
    const plan = panel.kind === "edit" ? panel.plan : null;
    title = plan ? "Editar plan" : "Nueva aventura";
    description = plan ? "Actualizá los detalles" : "¿Qué tienen ganas de hacer juntos?";
    body = (
      <PlanForm
        key={panel.key}
        plan={plan}
        defaults={panel.kind === "create" ? panel.defaults : undefined}
        today={today}
        onSaved={close}
        onPendingChange={setPlanPending}
      />
    );
    footer = <PlanFormFooter editing={!!plan} pending={planPending} onCancel={close} />;
  } else if (panel?.kind === "memory") {
    const editing = panel.plan.status === "completado";
    title = editing ? "Editar recuerdo" : "¡Lo hicieron! 🎉";
    description = editing ? panel.plan.title : <>Guarden un recuerdo de <strong className="text-ink">{panel.plan.title}</strong></>;
    body = <MemoryForm key={panel.key} plan={panel.plan} today={today} onSaved={close} onBusyChange={onMemBusy} />;
    footer = <MemoryFormFooter editing={editing} phase={memState.phase} progress={memState.progress} onCancel={close} />;
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet open={open} onClose={close} title={title} description={description} footer={footer} dismissible={!busy} size="lg">
        {body}
      </Sheet>
    </Ctx.Provider>
  );
}
