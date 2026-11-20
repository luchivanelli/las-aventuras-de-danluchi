import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header data-reveal className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[13px] font-semibold capitalize text-rose-600">{eyebrow}</p>}
        <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-ink md:text-[2.5rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
