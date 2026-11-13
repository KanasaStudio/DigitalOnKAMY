"use server";

import { revalidatePath } from "next/cache";
import { getStudioContext } from "@/lib/auth/studio-context";
import { publicMediaUrl } from "@/lib/env";
import { messageForDbError, type ActionResult, type FieldError } from "@/lib/errors";
import { detectImage } from "@/lib/files/magic-bytes";
import { can } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SOCIAL_KEYS, storefrontSchema, type StorefrontInput } from "@/lib/validation/merchant";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function requireEditor() {
  const ctx = await getStudioContext();
  if (ctx.demo) return { error: { ok: false as const, error: "demo.writesDisabled" as const } };
  if (!ctx.merchant) return { error: { ok: false as const, error: "errors.generic" as const } };
  if (!can(ctx.role, "editStorefront")) {
    return { error: { ok: false as const, error: "errors.forbidden" as const, vars: { role: "Admin" } } };
  }
  return { ctx, merchant: ctx.merchant };
}

export async function updateStorefrontAction(input: StorefrontInput): Promise<ActionResult> {
  const parsed = storefrontSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, FieldError> = {};
    for (const issue of parsed.error.issues) {
      const [field, sub] = issue.path.map(String);
      if (field === "storeName") fieldErrors.storeName = { key: "onboarding.identity.storeNameHint" };
      else if (field === "socialLinks" && sub) fieldErrors[`social.${sub}`] = { key: "validation.url" };
      else if (field === "specialties") fieldErrors.specialties = { key: "validation.tooMany", vars: { max: 6, field: "" } };
      else fieldErrors[field] = { key: "validation.maxLength", vars: { field, max: field === "bio" ? 1200 : field === "tagline" ? 120 : 200 } };
    }
    return { ok: false, error: "errors.generic", fieldErrors };
  }
  const guard = await requireEditor();
  if ("error" in guard) return guard.error!;

  const socialLinks = Object.fromEntries(
    SOCIAL_KEYS.map((key) => [key, parsed.data.socialLinks[key]]).filter(([, value]) => typeof value === "string" && value.length > 0),
  );

  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase
    .from("merchants")
    .update(
      {
        store_name: parsed.data.storeName,
        tagline: parsed.data.tagline || null,
        bio: parsed.data.bio || null,
        pinned_announcement: parsed.data.pinnedAnnouncement || null,
        specialties: parsed.data.specialties,
        social_links: socialLinks,
      },
      { count: "exact" },
    )
    .eq("id", guard.merchant.id);
  if (error) return { ok: false, ...messageForDbError(error) };
  if (count === 0) return { ok: false, error: "errors.forbidden", vars: { role: "Admin" } };

  revalidatePath("/studio", "layout");
  revalidatePath(`/c/${guard.merchant.slug}`);
  return { ok: true };
}

export async function uploadMerchantImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const kind = formData.get("kind");
  const file = formData.get("file");
  if ((kind !== "avatar" && kind !== "banner") || !(file instanceof File)) return { ok: false, error: "errors.uploadFailed" };
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "errors.uploadSize", vars: { size: `${(file.size / 1048576).toFixed(1)} MB`, max: "4 MB" } };
  }

  // Never trust the extension or the browser-reported type: check the bytes.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImage(bytes);
  if (!detected) return { ok: false, error: "errors.uploadType" };

  const guard = await requireEditor();
  if ("error" in guard) return guard.error!;
  const { merchant } = guard;

  const supabase = await createSupabaseServerClient();
  const path = `${merchant.id}/${kind}-${crypto.randomUUID()}.${detected.ext}`;
  const { error: uploadError } = await supabase.storage
    .from("merchant-media")
    .upload(path, bytes, { contentType: detected.mime, cacheControl: "31536000", upsert: false });
  if (uploadError) return { ok: false, error: "errors.uploadFailed" };

  const column = kind === "avatar" ? "avatar_path" : "banner_path";
  const previous = kind === "avatar" ? merchant.avatar_path : merchant.banner_path;
  const { error } = await supabase
    .from("merchants")
    .update(column === "avatar_path" ? { avatar_path: path } : { banner_path: path })
    .eq("id", merchant.id);
  if (error) {
    await supabase.storage.from("merchant-media").remove([path]);
    return { ok: false, ...messageForDbError(error) };
  }
  if (previous && previous !== path) await supabase.storage.from("merchant-media").remove([previous]);

  revalidatePath("/studio", "layout");
  revalidatePath(`/c/${merchant.slug}`);
  return { ok: true, data: { url: publicMediaUrl(path)! } };
}

export async function removeMerchantImageAction(kind: "avatar" | "banner"): Promise<ActionResult> {
  if (kind !== "avatar" && kind !== "banner") return { ok: false, error: "errors.generic" };
  const guard = await requireEditor();
  if ("error" in guard) return guard.error!;
  const { merchant } = guard;
  const previous = kind === "avatar" ? merchant.avatar_path : merchant.banner_path;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("merchants")
    .update(kind === "avatar" ? { avatar_path: null } : { banner_path: null })
    .eq("id", merchant.id);
  if (error) return { ok: false, ...messageForDbError(error) };
  if (previous) await supabase.storage.from("merchant-media").remove([previous]);
  revalidatePath("/studio", "layout");
  revalidatePath(`/c/${merchant.slug}`);
  return { ok: true };
}
