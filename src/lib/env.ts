export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * Demo mode: sample data, every write disabled, every figure labelled.
 * Server-side flag only; pass the boolean down to client components as a prop.
 */
export function isDemoMode(): boolean {
  return process.env.KAMY_DEMO_MODE === "true" || !isSupabaseConfigured;
}

export function publicMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("demo:")) return path.slice(5);
  return `${SUPABASE_URL}/storage/v1/object/public/merchant-media/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
