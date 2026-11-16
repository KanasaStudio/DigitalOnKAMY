import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

export type PlatformRole = Enums<"platform_role">;

export type Viewer = {
  demo: boolean;
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  adminRole: PlatformRole | null;
};

const RANK: Record<PlatformRole, number> = { support: 10, moderator: 20, finance: 30, superadmin: 40 };

/** UI hint only. `private.is_platform_admin` in the database decides what an admin can read. */
export function hasPlatformRole(role: PlatformRole | null, minimum: PlatformRole): boolean {
  return role !== null && RANK[role] >= RANK[minimum];
}

const DEMO_VIEWER: Viewer = {
  demo: true,
  id: "demo-user",
  email: "demo@kamy.example",
  displayName: "Raka",
  createdAt: "2026-11-01T03:00:00.000Z",
  adminRole: null,
};

/**
 * The signed-in person, verified with the auth server on every request, or null for a
 * guest. The id always comes from the verified session, never from anything the browser
 * sent. In demo mode there is no session, so there is no viewer.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (isDemoMode()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: admin }] = await Promise.all([
    supabase.from("profiles").select("display_name, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("platform_admins").select("role").eq("user_id", user.id).maybeSingle(),
  ]);
  return {
    demo: false,
    id: user.id,
    email: user.email ?? "",
    displayName: profile?.display_name || user.email?.split("@")[0] || "",
    createdAt: profile?.created_at ?? user.created_at,
    adminRole: admin?.role ?? null,
  };
});

/** For account pages: a sample viewer in demo mode, otherwise a verified session or a redirect. */
export async function requireViewer(next: string): Promise<Viewer> {
  if (isDemoMode()) return DEMO_VIEWER;
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return viewer;
}

/**
 * For admin pages. Signed-in people without the role get a 404, so the admin area does not
 * confirm its own existence. Demo mode renders the shell with sample-data labels.
 */
export async function requireAdmin(next: string, minimum: PlatformRole = "support"): Promise<Viewer> {
  if (isDemoMode()) return { ...DEMO_VIEWER, adminRole: "support" };
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (!hasPlatformRole(viewer.adminRole, minimum)) notFound();
  return viewer;
}
