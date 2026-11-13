import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

/** Refreshes the auth session cookie on every matched request. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured || process.env.KAMY_DEMO_MODE === "true") {
    return { response, isSignedIn: false };
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        if (cacheHeaders) {
          for (const [key, value] of Object.entries(cacheHeaders)) response.headers.set(key, value);
        }
      },
    },
  });

  // Do not run code between client creation and getClaims(): it validates and refreshes the session.
  const { data } = await supabase.auth.getClaims();
  return { response, isSignedIn: Boolean(data?.claims?.sub) };
}
