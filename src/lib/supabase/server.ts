import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Per-request Supabase client acting as the signed-in user. All authorization is
 * enforced by Row Level Security; this client never holds elevated keys.
 * The caller's IP and user agent are forwarded so audit entries can record them.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const clientIp =
    headerStore.get("x-real-ip") ?? headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const userAgent = headerStore.get("user-agent") ?? "";

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy refreshes sessions.
        }
      },
    },
    global: {
      headers: {
        "x-kamy-client-ip": clientIp.slice(0, 64),
        "x-kamy-user-agent": userAgent.slice(0, 300),
      },
    },
  });
}
