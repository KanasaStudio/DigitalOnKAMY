"use server";

import { revalidatePath } from "next/cache";
import type { MessageKey } from "@/i18n/core";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileInput } from "@/lib/validation/account";

export type ProfileState = { saved?: boolean; error?: MessageKey; fieldError?: MessageKey };

/** Updates the caller's own profile. The row is chosen by the verified session, not by input. */
export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  if (isDemoMode()) return { error: "demo.writesDisabled" };
  const parsed = profileInput.safeParse({ displayName: formData.get("displayName") ?? "" });
  if (!parsed.success) return { fieldError: "account.profile.displayNameInvalid" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "errors.notAuthenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName || null })
    .eq("id", user.id);
  if (error) return { error: "errors.generic" };
  revalidatePath("/account", "layout");
  return { saved: true };
}

export type DownloadResult = { ok: true; url: string } | { ok: false; error: MessageKey };

/**
 * Creates a one-minute signed URL for a file the caller has bought. The database function
 * `request_download` checks ownership and payment, rate-limits and records the download;
 * the storage policy checks the same ownership again when the URL is signed. The storage
 * key itself is never returned to the browser.
 */
export async function requestDownloadAction(fileId: unknown): Promise<DownloadResult> {
  if (isDemoMode()) return { ok: false, error: "demo.writesDisabled" };
  if (typeof fileId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fileId)) {
    return { ok: false, error: "account.library.errors.forbidden" };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("request_download", { p_file: fileId });
  if (error) {
    if (error.code === "28000") return { ok: false, error: "errors.notAuthenticated" };
    if (error.code === "42501") return { ok: false, error: "account.library.errors.forbidden" };
    if (error.code === "54000") return { ok: false, error: "account.library.errors.rateLimited" };
    return { ok: false, error: "account.library.errors.failed" };
  }
  const file = data?.[0];
  if (!file) return { ok: false, error: "account.library.errors.forbidden" };

  const signed = await supabase.storage
    .from("product-files")
    .createSignedUrl(file.storage_key, 60, { download: file.filename });
  if (signed.error || !signed.data?.signedUrl) return { ok: false, error: "account.library.errors.failed" };
  return { ok: true, url: signed.data.signedUrl };
}
