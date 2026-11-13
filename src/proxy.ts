import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await updateSession(request);
  const demo = process.env.KAMY_DEMO_MODE === "true" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const { pathname, search } = request.nextUrl;

  // Optimistic redirect only. Every Studio page and action re-verifies the user on the server.
  if (!demo && !isSignedIn && pathname.startsWith("/studio")) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  if (!demo && isSignedIn && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio/overview";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
