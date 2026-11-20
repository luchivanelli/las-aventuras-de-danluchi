import "server-only";
import { DEFAULT_TZ } from "./dates";
import { getAuthSecret } from "./session";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}. Revisá .env.example`);
  return v;
}

export const env = {
  get secretDate() {
    return process.env.SECRET_DATE ?? "2026-05-25";
  },
  get authSecret() {
    return getAuthSecret();
  },
  get timeZone() {
    return process.env.APP_TIMEZONE ?? DEFAULT_TZ;
  },
  get cloudinary() {
    return {
      cloudName: required("CLOUDINARY_CLOUD_NAME"),
      apiKey: required("CLOUDINARY_API_KEY"),
      apiSecret: required("CLOUDINARY_API_SECRET"),
      folder: process.env.CLOUDINARY_FOLDER || "aventuras",
    };
  },
};
