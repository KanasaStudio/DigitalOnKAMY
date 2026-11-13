import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

export const SOCIAL_KEYS = ["website", "instagram", "tiktok", "youtube", "x", "discord", "github", "facebook"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];
export type SocialLinks = Partial<Record<SocialKey, string>>;

/** Only plain https URLs without credentials are ever stored or rendered. */
export function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function sanitizeSocialLinks(value: unknown): SocialLinks {
  if (!value || typeof value !== "object") return {};
  const out: SocialLinks = {};
  for (const key of SOCIAL_KEYS) {
    const raw = (value as Record<string, unknown>)[key];
    if (typeof raw === "string" && raw.length <= 300 && isSafeHttpsUrl(raw.trim())) out[key] = raw.trim();
  }
  return out;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

const plainText = (max: number) =>
  z
    .string()
    .transform((v) => v.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().max(max));

export const merchantTypeSchema = z.enum(["individual", "studio"]);

export const storeIdentitySchema = z.object({
  type: merchantTypeSchema,
  storeName: plainText(60).pipe(z.string().min(2)),
  slug: z.string().trim().toLowerCase().regex(SLUG_PATTERN).refine((v) => !v.includes("--")),
  tagline: plainText(120),
  specialties: z.array(z.string().regex(/^[a-z0-9-]{2,40}$/)).min(1).max(6),
});
export type StoreIdentityInput = z.input<typeof storeIdentitySchema>;

const socialLinkValue = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || isSafeHttpsUrl(v));

export const storefrontSchema = z.object({
  storeName: plainText(60).pipe(z.string().min(2)),
  tagline: plainText(120),
  bio: plainText(1200),
  pinnedAnnouncement: plainText(200),
  specialties: z.array(z.string().regex(/^[a-z0-9-]{2,40}$/)).max(6),
  socialLinks: z.object(Object.fromEntries(SOCIAL_KEYS.map((k) => [k, socialLinkValue.optional()])) as Record<SocialKey, z.ZodOptional<typeof socialLinkValue>>),
});
export type StorefrontInput = z.input<typeof storefrontSchema>;
