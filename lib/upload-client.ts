"use client";

import imageCompression from "browser-image-compression";
import { discardUploads, getUploadSignature } from "@/app/actions/uploads";
import type { UploadedPhoto } from "./types";

async function compress(file: File): Promise<File> {
  // Reduce fotos enormes del celular antes de subirlas (más rápido con datos móviles).
  if (file.size < 1.5 * 1024 * 1024) return file;
  try {
    return await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 2560, useWebWorker: true, initialQuality: 0.85 });
  } catch {
    return file; // p. ej. HEIC en navegadores que no lo decodifican: Cloudinary lo acepta igual
  }
}

function uploadOne(
  file: File,
  sig: Awaited<ReturnType<typeof getUploadSignature>>,
  onProgress: (loaded: number) => void,
): Promise<UploadedPhoto> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onerror = () => reject(new Error("Sin conexión al subir la foto"));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(1);
          resolve({ url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height });
        } else {
          reject(new Error(res?.error?.message ?? "Cloudinary rechazó la foto"));
        }
      } catch {
        reject(new Error("Respuesta inválida de Cloudinary"));
      }
    };
    xhr.send(form);
  });
}

/** Comprime y sube varias fotos directo a Cloudinary, informando el progreso total (0–1). */
export async function uploadPhotos(files: File[], onProgress?: (fraction: number) => void): Promise<UploadedPhoto[]> {
  if (!files.length) return [];
  const sig = await getUploadSignature();
  const progress = files.map(() => 0);
  const report = () => onProgress?.(progress.reduce((a, b) => a + b, 0) / files.length);

  const results = await Promise.allSettled(
    files.map(async (f, i) => {
      const small = await compress(f);
      return uploadOne(small, sig, (p) => {
        progress[i] = p;
        report();
      });
    }),
  );

  const ok = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  const failed = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
  if (failed) {
    // Si alguna falla, no dejamos fotos sueltas en Cloudinary.
    if (ok.length) await discardUploads(ok.map((p) => p.publicId)).catch(() => {});
    throw failed.reason instanceof Error ? failed.reason : new Error("No se pudo subir una foto");
  }
  return ok;
}
