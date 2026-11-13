import type { Enums } from "@/lib/supabase/database.types";

export type MemberRole = Enums<"member_role">;

const RANK: Record<MemberRole, number> = { owner: 50, admin: 40, editor: 30, support: 20, viewer: 10 };

/** Mirrors private.has_merchant_role in the database. UI hint only — the database decides. */
export function hasRole(role: MemberRole | null | undefined, minimum: MemberRole): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[minimum];
}

/** Minimum role per Studio capability. Keep in sync with the RLS policies. */
export const CAPABILITY = {
  editStorefront: "admin",
  acceptPolicies: "admin",
  uploadMedia: "editor",
  editProducts: "editor",
  viewAuditLog: "admin",
  viewPayouts: "admin",
} as const satisfies Record<string, MemberRole>;

export type Capability = keyof typeof CAPABILITY;

export function can(role: MemberRole | null | undefined, capability: Capability): boolean {
  return hasRole(role, CAPABILITY[capability]);
}
