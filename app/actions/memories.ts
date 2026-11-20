"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertSession } from "@/lib/auth";
import { destroyPhotos, isTrustedUpload } from "@/lib/cloudinary";
import { dayToTimestamp } from "@/lib/dates";
import { MAX_PHOTOS } from "@/lib/constants";
import { fieldErrors, memorySchema, type MemoryInput } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/**
 * Completa un plan y guarda (o actualiza) su recuerdo.
 * Sirve tanto para "¡Lo hicimos!" como para editar un recuerdo existente.
 * Las fotos nuevas ya vienen subidas a Cloudinary desde el navegador.
 */
export async function saveMemory(input: MemoryInput): Promise<ActionResult<{ planId: string }>> {
  await assertSession();

  const parsed = memorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revisá los campos marcados", fieldErrors: fieldErrors(parsed.error) };
  }
  const { planId, note, reflection, date, keepPhotoIds, newPhotos } = parsed.data;

  if (!newPhotos.every(isTrustedUpload)) {
    return { ok: false, message: "Alguna foto no es válida. Volvé a subirla." };
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { memory: { include: { photos: true } } },
    });
    if (!plan) return { ok: false, message: "Ese plan ya no existe." };

    const existing = plan.memory?.photos ?? [];
    const removed = existing.filter((p) => !keepPhotoIds.includes(p.id));
    if (existing.length - removed.length + newPhotos.length > MAX_PHOTOS) {
      return { ok: false, message: `Máximo ${MAX_PHOTOS} fotos por recuerdo.` };
    }

    const wasCompleted = plan.status === "completado";
    const completedAt = dayToTimestamp(date);
    const photosCreate = newPhotos.map((p) => ({ url: p.url, publicId: p.publicId, width: p.width, height: p.height }));

    await prisma.plan.update({
      where: { id: planId },
      data: {
        status: "completado",
        memory: {
          upsert: {
            create: { note, reflection, completedAt, photos: { create: photosCreate } },
            update: {
              note,
              reflection,
              completedAt,
              photos: {
                deleteMany: { id: { in: removed.map((p) => p.id) } },
                create: photosCreate,
              },
            },
          },
        },
      },
    });

    await destroyPhotos(removed.map((p) => p.publicId));
    revalidatePath("/", "layout");
    return {
      ok: true,
      message: wasCompleted ? "Recuerdo actualizado" : "¡Aventura completada! 🎉",
      data: { planId },
    };
  } catch (err) {
    console.error("[saveMemory]", err);
    return { ok: false, message: "No pudimos guardar el recuerdo. Probá de nuevo." };
  }
}
