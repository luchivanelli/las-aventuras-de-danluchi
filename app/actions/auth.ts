"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export type LoginState = { error?: string; attempt: number };

function safeRedirect(from: FormDataEntryValue | null): string {
  const v = typeof from === "string" ? from : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/login") ? v : "/";
}

export async function login(prev: LoginState, formData: FormData): Promise<LoginState> {
  const d = String(formData.get("day") ?? "").padStart(2, "0");
  const m = String(formData.get("month") ?? "").padStart(2, "0");
  const y = String(formData.get("year") ?? "");
  const attempt = prev.attempt + 1;

  if (!/^\d{2}$/.test(d) || !/^\d{2}$/.test(m) || !/^\d{4}$/.test(y)) {
    return { error: "Completá día, mes y año", attempt };
  }

  if (`${y}-${m}-${d}` !== env.secretDate) {
    // Pequeña demora para que probar fechas a ciegas no sea instantáneo.
    await new Promise((r) => setTimeout(r, 700));
    return { error: "Esa no es la fecha especial 💔", attempt };
  }

  const { token, expires } = await createSessionToken(env.authSecret);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  redirect(safeRedirect(formData.get("from")));
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
