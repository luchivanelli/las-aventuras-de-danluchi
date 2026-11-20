/**
 * Migra las fotos de la v1 (guardadas como data URL base64 dentro de la base de datos)
 * a Cloudinary, y reemplaza la URL por la de Cloudinary.
 *
 *   npm run photos:migrate -- --dry-run   # solo muestra qué haría
 *   npm run photos:migrate                # migra de verdad
 *
 * Es idempotente: si se corta a mitad, se puede volver a correr.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

config({ path: ".env.local" });
config({ path: ".env" });

const dryRun = process.argv.includes("--dry-run");
const prisma = new PrismaClient();

function need(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta ${name} en .env / .env.local`);
  return v;
}

async function main() {
  cloudinary.config({
    cloud_name: need("CLOUDINARY_CLOUD_NAME"),
    api_key: need("CLOUDINARY_API_KEY"),
    api_secret: need("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  const folder = process.env.CLOUDINARY_FOLDER || "aventuras";

  const ids = await prisma.photo.findMany({
    where: { url: { startsWith: "data:" } },
    select: { id: true },
  });
  console.log(`${ids.length} foto(s) para migrar${dryRun ? " (dry run)" : ""}`);

  let ok = 0;
  let failed = 0;
  // De a una: cada data URL puede pesar varios MB.
  for (const [i, { id }] of ids.entries()) {
    const photo = await prisma.photo.findUnique({ where: { id }, select: { url: true } });
    if (!photo) continue;
    const sizeKb = Math.round((photo.url.length * 3) / 4 / 1024);
    process.stdout.write(`[${i + 1}/${ids.length}] ${id} (${sizeKb} KB)… `);
    if (dryRun) {
      console.log("se subiría");
      continue;
    }
    try {
      const res = await cloudinary.uploader.upload(photo.url, { folder, resource_type: "image" });
      await prisma.photo.update({
        where: { id },
        data: { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height },
      });
      ok++;
      console.log("✓");
    } catch (err) {
      failed++;
      console.log("✗", err instanceof Error ? err.message : err);
    }
  }

  if (!dryRun) console.log(`\nListo: ${ok} migradas, ${failed} con error.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
