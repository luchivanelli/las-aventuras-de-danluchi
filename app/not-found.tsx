import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <p className="mb-3 text-5xl" aria-hidden>
          🧭
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">Esta aventura no existe</h1>
        <p className="mt-2 text-muted">Puede que la hayan borrado o que el link esté mal.</p>
        <Link href="/" className={buttonClass({ className: "mt-6" })}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
