import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { safeNext } from "@/lib/auth/safe-next";

/** Areas that need a session. Pages and actions verify the user again; this only saves a render. */
const PROTECTED = ["/studio", "/account", "/admin"];

export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await updateSession(request);
  const demo = process.env.KAMY_DEMO_MODE === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const { pathname, search } = request.nextUrl;

  // Optimistic redirect only. Every Studio page and action re-verifies the user on the server.
  if (!demo && !isSignedIn && PROTECTED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  if (!demo && isSignedIn && (pathname === "/sign-in" || pathname === "/sign-up")) {
    // Same-site paths only: safeNext rejects anything that could leave the origin.
    return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.nextUrl.origin));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
