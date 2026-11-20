import type { Category, Priority, Status } from "./constants";

/** Datos serializables que viajan de Server Components a Client Components. */

export type PhotoDTO = {
  id: string;
  url: string;
  publicId: string | null;
  width: number | null;
  height: number | null;
};

export type MemoryDTO = {
  id: string;
  note: string;
  reflection: string;
  /** yyyy-MM-dd */
  date: string;
  photos: PhotoDTO[];
};

export type PlanDTO = {
  id: string;
  title: string;
  description: string;
  /** yyyy-MM-dd o null si no tiene fecha */
  date: string | null;
  category: Category;
  status: Status;
  priority: Priority;
  location: string | null;
  createdAt: string;
  memory: MemoryDTO | null;
};

/** Foto recién subida a Cloudinary, todavía no guardada en la BD. */
export type UploadedPhoto = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
