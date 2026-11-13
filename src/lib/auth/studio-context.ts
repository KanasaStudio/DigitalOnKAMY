import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import { sanitizeSocialLinks, type SocialLinks } from "@/lib/validation/merchant";
import type { MemberRole } from "@/lib/permissions";
import { demoStudioContext } from "@/lib/demo/fixtures";

export type StudioMerchant = Pick<
  Tables<"merchants">,
  | "id"
  | "type"
  | "store_name"
  | "slug"
  | "tagline"
  | "bio"
  | "avatar_path"
  | "banner_path"
  | "specialties"
  | "pinned_announcement"
  | "verification_state"
  | "onboarding_completed_at"
  | "created_at"
> & { social_links: SocialLinks };

type PolicyRef = { id: string; kind: Enums<"policy_kind">; version: string };
type PolicyStatus = { document: PolicyRef | null; acceptedAt: string | null };

export type StudioContext = {
  demo: boolean;
  user: { id: string; email: string; displayName: string };
  merchant: StudioMerchant | null;
  role: MemberRole | null;
  payoutState: Enums<"payout_state">;
  policies: { seller: PolicyStatus; ownership: PolicyStatus };
  productCount: number;
};

export const MERCHANT_COLUMNS =
  "id, type, store_name, slug, tagline, bio, avatar_path, banner_path, specialties, social_links, pinned_announcement, verification_state, onboarding_completed_at, created_at";

/**
 * Everything the Studio chrome needs for the signed-in user, loaded once per request.
 * Redirects to sign-in when there is no verified session.
 */
export const getStudioContext = cache(async (): Promise<StudioContext> => {
  if (isDemoMode()) return demoStudioContext();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: membership }, { data: docs }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("merchant_members")
      .select(`role, merchant:merchants!inner(${MERCHANT_COLUMNS})`)
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("merchant.deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase.from("policy_documents").select("id, kind, version").eq("is_current", true),
  ]);

  const displayName = profile?.display_name || user.email?.split("@")[0] || "";
  const merchantRow = (membership?.merchant ?? null) as unknown as Tables<"merchants"> | null;
  const merchant: StudioMerchant | null = merchantRow
    ? { ...merchantRow, social_links: sanitizeSocialLinks(merchantRow.social_links) }
    : null;
  const role = (membership?.role ?? null) as MemberRole | null;

  const seller = docs?.find((d) => d.kind === "seller_agreement") ?? null;
  const ownership = docs?.find((d) => d.kind === "ownership_declaration") ?? null;

  let sellerAcceptedAt: string | null = null;
  let ownershipAcceptedAt: string | null = null;
  let payoutState: Enums<"payout_state"> = "not_connected";
  let productCount = 0;

  if (merchant) {
    const [{ data: acceptances }, { data: payout }, { count }] = await Promise.all([
      supabase
        .from("policy_acceptances")
        .select("policy_document_id, accepted_at")
        .eq("merchant_id", merchant.id)
        .is("product_id", null)
        .order("accepted_at", { ascending: false }),
      supabase.from("merchant_payout_settings").select("state").eq("merchant_id", merchant.id).maybeSingle(),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("merchant_id", merchant.id)
        .is("deleted_at", null),
    ]);
    sellerAcceptedAt = acceptances?.find((a) => a.policy_document_id === seller?.id)?.accepted_at ?? null;
    ownershipAcceptedAt = acceptances?.find((a) => a.policy_document_id === ownership?.id)?.accepted_at ?? null;
    payoutState = payout?.state ?? "not_connected";
    productCount = count ?? 0;
  }

  return {
    demo: false,
    user: { id: user.id, email: user.email ?? "", displayName },
    merchant,
    role,
    payoutState,
    policies: {
      seller: { document: seller, acceptedAt: sellerAcceptedAt },
      ownership: { document: ownership, acceptedAt: ownershipAcceptedAt },
    },
    productCount,
  };
});

/** Getting-started checklist, derived from real state only. */
export function getChecklist(ctx: StudioContext) {
  const m = ctx.merchant;
  const items = [
    { id: "storeProfile", done: Boolean(m?.avatar_path && m?.tagline), href: "/studio/storefront", available: true },
    { id: "firstProduct", done: ctx.productCount > 0, href: "/studio/products", available: false },
    { id: "payout", done: ctx.payoutState === "connected", href: "/studio/earnings", available: false },
    {
      id: "policy",
      done: Boolean(ctx.policies.seller.acceptedAt && ctx.policies.ownership.acceptedAt),
      href: "/studio/onboarding?step=agreement",
      available: true,
    },
  ] as const;
  return { items, done: items.filter((i) => i.done).length, total: items.length };
}
