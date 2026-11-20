import { Heart } from "lucide-react";

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-deep shadow-rose">
        <Heart className="size-[18px] text-white" fill="currentColor" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold text-ink">Aventuras</span>
        {!compact && <span className="block text-xs font-medium text-muted">de a dos</span>}
      </span>
    </span>
  );
}
