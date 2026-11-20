// Token de sesión firmado con HMAC-SHA256 (Web Crypto).
// No depende de "server-only" porque también lo usa proxy.ts.

export const SESSION_COOKIE = "aventuras_session";
export const SESSION_DAYS = 30;

const encoder = new TextEncoder();

function toBase64Url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret: string): Promise<{ token: string; expires: Date }> {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const payload = String(expires.getTime());
  return { token: `${payload}.${await hmac(secret, payload)}`, expires };
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return safeEqual(sig, await hmac(secret, payload));
}

export function getAuthSecret(): string {
  const v = process.env.AUTH_SECRET;
  if (v) return v;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta la variable de entorno AUTH_SECRET. Revisá .env.example");
  }
  return "dev-secret-no-usar-en-produccion";
}
