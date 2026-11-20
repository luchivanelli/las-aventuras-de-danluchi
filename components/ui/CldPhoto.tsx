"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { cldUrl, isCloudinaryUrl } from "@/lib/cld";
import { cn } from "@/lib/utils";

const loader = ({ src, width }: ImageLoaderProps) => cldUrl(src, { width });

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Si es true, ocupa el contenedor (que debe tener position relative). */
  fill?: boolean;
  width?: number | null;
  height?: number | null;
};

/**
 * Imagen optimizada por Cloudinary (formato y calidad automáticos, tamaño según pantalla).
 * Las fotos viejas guardadas como data URL se muestran tal cual.
 */
export function CldPhoto({ src, alt, sizes, className, priority, fill = true, width, height }: Props) {
  if (!isCloudinaryUrl(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn(fill && "absolute inset-0 size-full", "object-cover", className)} loading={priority ? "eager" : "lazy"} />;
  }
  if (fill || !width || !height) {
    return <Image loader={loader} src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }
  return <Image loader={loader} src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} className={className} />;
}
