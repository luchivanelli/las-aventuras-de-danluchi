import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { env } from "./env";
import { assertSession } from "./auth";
import { isCategory, PRIORITIES, type Category, type Priority, type Status } from "./constants";
import { monthRange, timestampToDay, todayIn, weekRange } from "./dates";
import type { PlanDTO } from "./types";

const include = { memory: { include: { photos: { orderBy: { createdAt: "asc" } } } } } as const;
type RawPlan = Prisma.PlanGetPayload<{ include: typeof include }>;

function toDTO(p: RawPlan): PlanDTO {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    date: p.date || null,
    category: (isCategory(p.category) ? p.category : "citas") as Category,
    status: (p.status === "completado" ? "completado" : "pendiente") as Status,
    priority: (p.priority in PRIORITIES ? p.priority : "media") as Priority,
    location: p.location || null,
    createdAt: p.createdAt.toISOString(),
    memory: p.memory
      ? {
          id: p.memory.id,
          note: p.memory.note ?? "",
          reflection: p.memory.reflection ?? "",
          date: timestampToDay(p.memory.completedAt),
          photos: p.memory.photos.map((ph) => ({
            id: ph.id,
            url: ph.url,
            publicId: ph.publicId,
            width: ph.width,
            height: ph.height,
          })),
        }
      : null,
  };
}

export const getToday = cache(async () => todayIn(env.timeZone));

type Filters = { category?: string; q?: string };

function where(status: Status, { category, q }: Filters): Prisma.PlanWhereInput {
  const term = q?.trim();
  return {
    status,
    ...(isCategory(category) && { category }),
    ...(term && {
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        ...(status === "completado"
          ? [
              { memory: { note: { contains: term, mode: "insensitive" as const } } },
              { memory: { reflection: { contains: term, mode: "insensitive" as const } } },
            ]
          : []),
      ],
    }),
  };
}

/** Planes pendientes: primero los que tienen fecha (más cercana primero), después por importancia. */
export const getPendingPlans = cache(async (filters: Filters = {}) => {
  await assertSession();
  const rows = await prisma.plan.findMany({ where: where("pendiente", filters), include, orderBy: { createdAt: "desc" } });
  return rows.map(toDTO).sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date) || PRIORITIES[a.priority].order - PRIORITIES[b.priority].order;
    if (a.date) return -1;
    if (b.date) return 1;
    return PRIORITIES[a.priority].order - PRIORITIES[b.priority].order;
  });
});

export const getMemories = cache(async (filters: Filters = {}) => {
  await assertSession();
  const rows = await prisma.plan.findMany({ where: where("completado", filters), include });
  return rows.map(toDTO).sort((a, b) => (b.memory?.date ?? "").localeCompare(a.memory?.date ?? ""));
});

export const getMemory = cache(async (planId: string) => {
  await assertSession();
  const row = await prisma.plan.findFirst({ where: { id: planId, status: "completado" }, include });
  if (!row) return null;
  const plan = toDTO(row);

  // Recuerdo anterior / siguiente en la línea de tiempo, para navegar sin volver a la lista.
  const all = await prisma.memory.findMany({
    where: { plan: { status: "completado" } },
    select: { planId: true, completedAt: true },
    orderBy: [{ completedAt: "desc" }, { id: "asc" }],
  });
  const i = all.findIndex((m) => m.planId === planId);
  return {
    plan,
    newerId: i > 0 ? all[i - 1].planId : null,
    olderId: i >= 0 && i < all.length - 1 ? all[i + 1].planId : null,
  };
});

export const getMonthPlans = cache(async (month: string) => {
  await assertSession();
  const { start, end } = monthRange(month);
  const rows = await prisma.plan.findMany({
    where: { date: { gte: start, lte: end } },
    include,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toDTO);
});

export const getHomeData = cache(async () => {
  await assertSession();
  const today = await getToday();
  const week = weekRange(today);

  const [pending, completed, photoCount, upcomingRows, overdue, thisWeek, byCategory, recentRows] = await Promise.all([
    prisma.plan.count({ where: { status: "pendiente" } }),
    prisma.plan.count({ where: { status: "completado" } }),
    prisma.photo.count(),
    prisma.plan.findMany({
      where: { status: "pendiente", date: { gte: today } },
      include,
      orderBy: { date: "asc" },
      take: 4,
    }),
    prisma.plan.count({ where: { status: "pendiente", date: { lt: today } } }),
    prisma.plan.count({ where: { status: "pendiente", date: { gte: week.start, lte: week.end } } }),
    prisma.plan.groupBy({ by: ["category", "status"], _count: { _all: true } }),
    prisma.plan.findMany({
      where: { status: "completado" },
      include,
      orderBy: { memory: { completedAt: "desc" } },
      take: 6,
    }),
  ]);

  const categories = new Map<Category, { total: number; done: number }>();
  for (const row of byCategory) {
    if (!isCategory(row.category)) continue;
    const cur = categories.get(row.category) ?? { total: 0, done: 0 };
    cur.total += row._count._all;
    if (row.status === "completado") cur.done += row._count._all;
    categories.set(row.category, cur);
  }

  const recent = recentRows.map(toDTO);

  // "Un día como hoy": un recuerdo del mismo día (prioriza mismo día y mes de otro año).
  const memDates = await prisma.memory.findMany({
    where: { plan: { status: "completado" } },
    select: { planId: true, completedAt: true },
    orderBy: { completedAt: "desc" },
  });
  const candidates = memDates
    .map((m) => ({ planId: m.planId, day: timestampToDay(m.completedAt) }))
    .filter((m) => m.day < today && m.day.slice(8, 10) === today.slice(8, 10));
  const best = candidates.find((m) => m.day.slice(5, 7) === today.slice(5, 7)) ?? candidates[0];
  let onThisDay: PlanDTO | null = null;
  if (best) {
    onThisDay = recent.find((p) => p.id === best.planId) ?? null;
    if (!onThisDay) {
      const row = await prisma.plan.findUnique({ where: { id: best.planId }, include });
      onThisDay = row ? toDTO(row) : null;
    }
  }

  return {
    today,
    counts: { pending, completed, total: pending + completed, photos: photoCount, overdue, thisWeek },
    upcoming: upcomingRows.map(toDTO),
    recent,
    onThisDay,
    categories: [...categories.entries()]
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.total - a.total),
  };
});
