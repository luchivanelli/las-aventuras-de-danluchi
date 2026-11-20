"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Sheet } from "./Sheet";
import { Button } from "./Button";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
};

const Ctx = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);

/** `const confirm = useConfirm(); if (await confirm({...})) ...` */
export function useConfirm() {
  return useContext(Ctx);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  }, []);

  const onClose = useCallback(() => close(false), [close]);

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <Sheet
        open={open}
        onClose={onClose}
        size="sm"
        title={opts?.title ?? ""}
        description={opts?.description}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => close(false)}>
              {opts?.cancelLabel ?? "Cancelar"}
            </Button>
            <Button variant={opts?.tone === "primary" ? "primary" : "danger"} className="flex-1" onClick={() => close(true)} data-autofocus>
              {opts?.confirmLabel ?? "Confirmar"}
            </Button>
          </div>
        }
      >
        <span className="sr-only">Confirmación</span>
      </Sheet>
    </Ctx.Provider>
  );
}
