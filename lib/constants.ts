// Configuración compartida entre servidor y cliente.

export const CATEGORY_KEYS = [
  "citas",
  "salidas",
  "viajes",
  "comidas",
  "futbol",
  "entrenamiento",
  "sorpresas",
] as const;
export type Category = (typeof CATEGORY_KEYS)[number];

export const PRIORITY_KEYS = ["baja", "media", "alta"] as const;
export type Priority = (typeof PRIORITY_KEYS)[number];

export const STATUS_KEYS = ["pendiente", "completado"] as const;
export type Status = (typeof STATUS_KEYS)[number];

type CategoryMeta = {
  label: string;
  emoji: string;
  /** color de acento (puntos, bordes) */
  hex: string;
  /** fondo suave para chips */
  soft: string;
  /** texto legible sobre `soft` */
  ink: string;
};

export const CATEGORIES: Record<Category, CategoryMeta> = {
  citas: { label: "Citas", emoji: "❤️", hex: "#c2566f", soft: "var(--cat-citas-soft, #f8e5e9)", ink: "var(--cat-citas-ink, #8a3449)" },
  salidas: { label: "Salidas", emoji: "🍿", hex: "#5f8c78", soft: "var(--cat-salidas-soft, #e3efe9)", ink: "var(--cat-salidas-ink, #3f6656)" },
  viajes: { label: "Viajes", emoji: "✈️", hex: "#4f7cb0", soft: "var(--cat-viajes-soft, #e1ebf6)", ink: "var(--cat-viajes-ink, #335a87)" },
  comidas: { label: "Comidas", emoji: "🍔", hex: "#b8915a", soft: "var(--cat-comidas-soft, #f4ead9)", ink: "var(--cat-comidas-ink, #7d5e31)" },
  futbol: { label: "Fútbol", emoji: "⚽", hex: "#5e9a4f", soft: "var(--cat-futbol-soft, #e3f0df)", ink: "var(--cat-futbol-ink, #3f6e33)" },
  entrenamiento: { label: "Entrena", emoji: "🏋️", hex: "#8661b8", soft: "var(--cat-entrenamiento-soft, #ece4f6)", ink: "var(--cat-entrenamiento-ink, #5e3f8a)" },
  sorpresas: { label: "Sorpresas", emoji: "🎁", hex: "#c06a4f", soft: "var(--cat-sorpresas-soft, #f7e4dd)", ink: "var(--cat-sorpresas-ink, #8a4630)" },
};

export const PRIORITIES: Record<Priority, { label: string; hint: string; order: number }> = {
  alta: { label: "Especial", hint: "Algo que no nos podemos perder", order: 0 },
  media: { label: "Importante", hint: "Lo queremos hacer pronto", order: 1 },
  baja: { label: "Normal", hint: "Cuando surja", order: 2 },
};

export const MAX_PHOTOS = 8;

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORY_KEYS as readonly string[]).includes(v);
}

export function categoryMeta(c: string): CategoryMeta {
  return isCategory(c) ? CATEGORIES[c] : CATEGORIES.citas;
}
