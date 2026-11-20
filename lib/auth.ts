import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { env } from "./env";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export const isAuthenticated = cache(async (): Promise<boolean> => {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, env.authSecret);
});

/** Para páginas: redirige al login si no hay sesión válida. */
export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/login");
}

/** Para Server Actions: se pueden invocar con un POST directo, así que siempre se verifica. */
export async function assertSession(): Promise<void> {
  if (!(await isAuthenticated())) throw new Error("No autorizado");
}
