import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { FloatingHearts } from "@/components/motion/FloatingHearts";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--color-rose-100)_0%,var(--color-cream)_55%)] px-4 py-10">
      <FloatingHearts className="text-rose-300/60" />
      <LoginForm from={from ?? ""} />
    </div>
  );
}
