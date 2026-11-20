"use server";

import { assertSession } from "@/lib/auth";
import { destroyPhotos, signUpload } from "@/lib/cloudinary";
import { env } from "@/lib/env";

/** Devuelve una firma de corta duración para subir fotos directo a Cloudinary. */
export async function getUploadSignature() {
  await assertSession();
  return signUpload();
}

/** Limpia fotos subidas que finalmente no se guardaron (por ejemplo, si falló el guardado). */
export async function discardUploads(publicIds: string[]): Promise<void> {
  await assertSession();
  const folder = env.cloudinary.folder;
  await destroyPhotos(publicIds.filter((id) => typeof id === "string" && id.startsWith(`${folder}/`)));
}
