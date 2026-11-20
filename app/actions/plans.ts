"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertSession } from "@/lib/auth";
import { destroyPhotos } from "@/lib/cloudinary";
import { fieldErrors, planSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

function refresh() {
  revalidatePath("/", "layout");
}

/** Crea o actualiza un plan. Pensada para usarse con useActionState. */
export async function savePlan(_prev: ActionResult<{ id: string }> | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  await assertSession();

  const parsed = planSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    date: formData.get("date") ?? "",
    location: formData.get("location") ?? "",
    category: formData.get("category"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Revisá los campos marcados", fieldErrors: fieldErrors(parsed.error) };
  }

  const { id, ...data } = parsed.data;
  try {
    const plan = id
      ? await prisma.plan.update({ where: { id }, data })
      : await prisma.plan.create({ data: { ...data, status: "pendiente" } });
    refresh();
    return { ok: true, message: id ? "Plan actualizado" : "¡Plan agregado! ✨", data: { id: plan.id } };
  } catch (err) {
    console.error("[savePlan]", err);
    return { ok: false, message: "No pudimos guardar el plan. Probá de nuevo." };
  }
}

export async function deletePlan(id: string): Promise<ActionResult> {
  await assertSession();
  try {
    const photos = await prisma.photo.findMany({ where: { memory: { planId: id } }, select: { publicId: true } });
    await prisma.plan.delete({ where: { id } });
    await destroyPhotos(photos.map((p) => p.publicId));
    refresh();
    return { ok: true, message: "Plan eliminado" };
  } catch (err) {
    console.error("[deletePlan]", err);
    return { ok: false, message: "No pudimos eliminar el plan." };
  }
}

/** Vuelve a marcar un plan como pendiente. El recuerdo (si hay) se conserva por si lo completan de nuevo. */
export async function reopenPlan(id: string): Promise<ActionResult> {
  await assertSession();
  try {
    await prisma.plan.update({ where: { id }, data: { status: "pendiente" } });
    refresh();
    return { ok: true, message: "El plan volvió a la lista" };
  } catch (err) {
    console.error("[reopenPlan]", err);
    return { ok: false, message: "No pudimos actualizar el plan." };
  }
}
