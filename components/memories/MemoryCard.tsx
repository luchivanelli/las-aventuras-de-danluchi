import Link from "next/link";
import { Camera, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { fmtDay } from "@/lib/dates";
import type { PlanDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CldPhoto } from "@/components/ui/CldPhoto";

export function MemoryCard({ plan, priority, className }: { plan: PlanDTO; priority?: boolean; className?: string }) {
  const m = plan.memory;
  const cover = m?.photos[0];
  const cat = CATEGORIES[plan.category];

  return (
    <Link
      data-reveal
      href={`/recuerdos/${plan.id}`}
      className={cn(
        "group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl shadow-soft outline-offset-4 transition duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
      style={cover ? undefined : { background: `linear-gradient(160deg, ${cat.soft} 0%, var(--color-paper) 120%)` }}
    >
      {cover ? (
        <>
          <CldPhoto src={cover.url} alt="" sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw" priority={priority} className="transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/15 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-x-0 top-0 p-4">
          <span className="text-4xl" aria-hidden>
            {cat.emoji}
          </span>
          {m?.note && <p className="mt-3 line-clamp-5 font-display text-[15px] italic leading-snug text-ink/80">“{m.note}”</p>}
        </div>
      )}

      <div className={cn("relative p-4", cover ? "text-white" : "text-ink")}>
        <p className={cn("mb-1 text-[11px] font-semibold uppercase tracking-wider", cover ? "text-white/80" : "text-muted")}>
          {m ? fmtDay(m.date, "d MMM yyyy") : ""}
        </p>
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-tight">{plan.title}</h3>
        <div className={cn("mt-1.5 flex items-center gap-3 text-xs font-medium", cover ? "text-white/85" : "text-muted")}>
          <span>
            {cat.emoji} {cat.label}
          </span>
          {plan.location && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{plan.location}</span>
            </span>
          )}
        </div>
      </div>

      {m && m.photos.length > 1 && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-night/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <Camera className="size-3" />
          {m.photos.length}
        </span>
      )}
    </Link>
  );
}
