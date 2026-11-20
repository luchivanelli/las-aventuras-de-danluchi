import { NextResponse, type NextRequest } from "next/server";
import { getAuthSecret, SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Chequeo optimista: redirige rápido al login. La verificación real se repite
// en cada página (requireSession) y en cada Server Action (assertSession).
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, getAuthSecret());

  if (pathname === "/login") {
    return authed ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  if (!authed) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("from", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Todo menos assets estáticos e imágenes optimizadas.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
