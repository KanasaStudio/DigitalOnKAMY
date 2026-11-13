import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";
import type { Database, Tables } from "@/lib/supabase/database.types";
import type { Locale } from "@/i18n/core";

export type Category = Pick<Tables<"categories">, "id" | "parent_id" | "name_id" | "name_en" | "icon" | "sort_order">;
export type PolicyDocument = Tables<"policy_documents">;

/** Public reference data (taxonomy, policy text) readable without a session. */
function publicClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: "3d-game", parent_id: null, name_id: "3D & Aset Game", name_en: "3D & Game Assets", icon: "3d", sort_order: 10 },
  { id: "ui-ux", parent_id: null, name_id: "UI/UX & Web", name_en: "UI/UX & Web", icon: "uiux", sort_order: 20 },
  { id: "templates", parent_id: null, name_id: "Template", name_en: "Templates", icon: "templates", sort_order: 30 },
  { id: "graphics", parent_id: null, name_id: "Desain Grafis", name_en: "Graphic Design", icon: "graphics", sort_order: 40 },
  { id: "audio-video", parent_id: null, name_id: "Audio & Video", name_en: "Audio & Video", icon: "audio", sort_order: 50 },
  { id: "tools-plugins", parent_id: null, name_id: "Software & Tools", name_en: "Software & Tools", icon: "plugins", sort_order: 60 },
  { id: "creative-services", parent_id: null, name_id: "Jasa Kreatif", name_en: "Creative Services", icon: "services", sort_order: 70 },
];

export const getTopLevelCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return FALLBACK_CATEGORIES;
  const { data } = await publicClient()
    .from("categories")
    .select("id, parent_id, name_id, name_en, icon, sort_order")
    .is("parent_id", null)
    .order("sort_order");
  return data?.length ? data : FALLBACK_CATEGORIES;
});

export function categoryName(category: Category, locale: Locale): string {
  return locale === "en" ? category.name_en : category.name_id;
}

export const getCurrentPolicies = cache(async (): Promise<{ seller: PolicyDocument | null; ownership: PolicyDocument | null }> => {
  if (!isSupabaseConfigured) return { seller: null, ownership: null };
  const { data } = await publicClient().from("policy_documents").select("*").eq("is_current", true);
  return {
    seller: data?.find((d) => d.kind === "seller_agreement") ?? null,
    ownership: data?.find((d) => d.kind === "ownership_declaration") ?? null,
  };
});
