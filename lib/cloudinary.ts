import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import type { UploadedPhoto } from "./types";

let configured = false;
function client() {
  if (!configured) {
    const c = env.cloudinary;
    cloudinary.config({ cloud_name: c.cloudName, api_key: c.apiKey, api_secret: c.apiSecret, secure: true });
    configured = true;
  }
  return cloudinary;
}

/** Firma para que el navegador suba directo a Cloudinary (las fotos no pasan por nuestro servidor). */
export function signUpload() {
  const c = env.cloudinary;
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: c.folder, timestamp };
  const signature = client().utils.api_sign_request(params, c.apiSecret);
  return { cloudName: c.cloudName, apiKey: c.apiKey, folder: c.folder, timestamp, signature };
}

/** Solo aceptamos fotos que realmente estén en nuestra cuenta y carpeta de Cloudinary. */
export function isTrustedUpload(p: UploadedPhoto): boolean {
  const c = env.cloudinary;
  return (
    p.url.startsWith(`https://res.cloudinary.com/${c.cloudName}/image/upload/`) &&
    p.publicId.startsWith(`${c.folder}/`)
  );
}

export async function destroyPhotos(publicIds: Array<string | null | undefined>): Promise<void> {
  const ids = publicIds.filter((x): x is string => !!x);
  if (!ids.length) return;
  try {
    await client().api.delete_resources(ids, { resource_type: "image" });
  } catch (err) {
    // No bloqueamos al usuario si falla la limpieza: el archivo queda huérfano en Cloudinary.
    console.error("[cloudinary] no se pudieron borrar", ids, err);
  }
}

