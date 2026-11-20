// Helpers de URLs de Cloudinary, seguros para usar en el cliente.

export function isCloudinaryUrl(url: string): boolean {
  return url.startsWith("https://res.cloudinary.com/") && url.includes("/image/upload/");
}

/**
 * Inserta transformaciones en una URL de Cloudinary.
 * https://res.cloudinary.com/x/image/upload/v123/folder/id.jpg
 *  → https://res.cloudinary.com/x/image/upload/f_auto,q_auto,w_600/v123/folder/id.jpg
 */
export function cldUrl(
  url: string,
  opts: { width?: number; height?: number; crop?: "fill" | "limit"; quality?: number | "auto" } = {},
): string {
  if (!isCloudinaryUrl(url)) return url;
  const t = ["f_auto", `q_${opts.quality ?? "auto"}`];
  if (opts.width) t.push(`w_${opts.width}`);
  if (opts.height) t.push(`h_${opts.height}`);
  if (opts.width || opts.height) t.push(`c_${opts.crop ?? "limit"}`);
  if (opts.crop === "fill") t.push("g_auto");
  return url.replace("/image/upload/", `/image/upload/${t.join(",")}/`);
}
