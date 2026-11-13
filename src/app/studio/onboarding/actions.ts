"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/env";
import { messageForDbError, type ActionResult } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SLUG_PATTERN, storeIdentitySchema, type StoreIdentityInput } from "@/lib/validation/merchant";

export async function checkSlugAction(slug: string): Promise<{ valid: boolean; available: boolean }> {
  const value = String(slug ?? "").trim().toLowerCase();
  const valid = SLUG_PATTERN.test(value) && !value.includes("--");
  if (!valid) return { valid, available: false };
  if (isDemoMode()) return { valid, available: value !== "nusantara-lowpoly" };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("is_slug_available", { p_slug: value });
  return { valid, available: !error && data === true };
}

export async function createStoreAction(input: StoreIdentityInput): Promise<ActionResult<{ merchantId: string }>> {
  const parsed = storeIdentitySchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: NonNullable<Extract<ActionResult, { ok: false }>["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (field === "storeName") fieldErrors.storeName = { key: "onboarding.identity.storeNameHint" };
      if (field === "slug") fieldErrors.slug = { key: "validation.slugFormat" };
      if (field === "tagline") fieldErrors.tagline = { key: "validation.maxLength", vars: { field: "Tagline", max: 120 } };
      if (field === "specialties") fieldErrors.specialties = { key: "onboarding.identity.specialtiesHint" };
    }
    return { ok: false, error: "errors.generic", fieldErrors };
  }
  if (isDemoMode()) return { ok: false, error: "demo.writesDisabled" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_merchant", {
    p_type: parsed.data.type,
    p_store_name: parsed.data.storeName,
    p_slug: parsed.data.slug,
    p_tagline: parsed.data.tagline || undefined,
    p_specialties: parsed.data.specialties,
  });
  if (error || !data) {
    const mapped = messageForDbError(error);
    return mapped.error === "validation.slugTaken"
      ? { ok: false, error: mapped.error, fieldErrors: { slug: { key: "validation.slugTaken" } } }
      : { ok: false, ...mapped };
  }
  revalidatePath("/studio", "layout");
  return { ok: true, data: { merchantId: data } };
}

export async function acceptPolicyAction(merchantId: string, documentId: string): Promise<ActionResult> {
  if (isDemoMode()) return { ok: false, error: "demo.writesDisabled" };
  if (!/^[0-9a-f-]{36}$/i.test(merchantId) || !/^[0-9a-f-]{36}$/i.test(documentId)) {
    return { ok: false, error: "errors.generic" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("accept_policy", { p_merchant: merchantId, p_document: documentId });
  if (error) return { ok: false, ...messageForDbError(error) };
  revalidatePath("/studio", "layout");
  return { ok: true };
}
