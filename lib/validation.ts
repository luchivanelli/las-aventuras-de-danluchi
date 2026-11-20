import { z } from "zod";
import { CATEGORY_KEYS, MAX_PHOTOS, PRIORITY_KEYS } from "./constants";
import { isValidDay } from "./dates";

const day = z.string().refine(isValidDay, "Fecha inválida");
const optionalDay = z
  .string()
  .trim()
  .transform((v) => v || null)
  .refine((v) => v === null || isValidDay(v), "Fecha inválida");

export const planSchema = z.object({
  id: z.string().trim().optional().transform((v) => v || undefined),
  title: z.string().trim().min(1, "Poné un título").max(120, "Máximo 120 caracteres"),
  description: z.string().trim().max(1000, "Máximo 1000 caracteres").default(""),
  date: optionalDay,
  location: z
    .string()
    .trim()
    .max(120, "Máximo 120 caracteres")
    .transform((v) => v || null),
  category: z.enum(CATEGORY_KEYS, { message: "Elegí una categoría" }),
  priority: z.enum(PRIORITY_KEYS, { message: "Elegí la importancia" }),
});

export const uploadedPhotoSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const memorySchema = z.object({
  planId: z.string().min(1),
  note: z.string().trim().max(4000, "Máximo 4000 caracteres").default(""),
  reflection: z.string().trim().max(280, "Máximo 280 caracteres").default(""),
  date: day,
  /** ids de fotos existentes que se conservan (solo al editar) */
  keepPhotoIds: z.array(z.string()).default([]),
  newPhotos: z.array(uploadedPhotoSchema).max(MAX_PHOTOS).default([]),
});

export type MemoryInput = z.input<typeof memorySchema>;

export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
