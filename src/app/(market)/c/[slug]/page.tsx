import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { IconName } from "@/components/icons/icon";
import { ProductCard } from "@/components/market/product-card";
import { CreatorProfile } from "@/components/storefront/creator-profile";
import { getCreator, productsByCreator } from "@/lib/market/catalog";
import { getTranslator } from "@/i18n/server";
import { MERCHANT_COLUMNS } from "@/lib/auth/studio-context";
import { demoStudioContext } from "@/lib/demo/fixtures";
import { isDemoMode, publicMediaUrl } from "@/lib/env";
import { categoryName, getTopLevelCategories } from "@/lib/reference-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { sanitizeSocialLinks } from "@/lib/validation/merchant";

async function loadMerchant(slug: string) {
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return null;
  if (isDemoMode()) {
    const creator = getCreator(slug);
    if (creator) {
      // STAGING creator profile from the marketplace test catalogue.
      return {
        id: creator.slug,
        store_name: creator.name,
        slug: creator.slug,
        tagline: creator.tagline,
        bio: creator.bio,
        avatar_path: null,
        banner_path: null,
        specialties: creator.specialties,
        social_links: {},
        pinned_announcement: null,
        verification_state: creator.verification,
        onboarding_completed_at: creator.joinedAt,
        created_at: creator.joinedAt,
      } as unknown as Tables<"merchants">;
    }
    const demo = demoStudioContext().merchant!;
    return demo.slug === slug ? { ...demo, social_links: demo.social_links as Tables<"merchants">["social_links"] } : null;
  }
  const supabase = await createSupabaseServerClient();
  // RLS returns the row only when the storefront is public (or to the store's own members).
  const { data } = await supabase.from("merchants").select(MERCHANT_COLUMNS).eq("slug", slug).is("deleted_at", null).maybeSingle();
  return data as unknown as Tables<"merchants"> | null;
}

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await loadMerchant(slug);
  if (!merchant) return {};
  return {
    title: merchant.store_name,
    description: merchant.tagline ?? undefined,
    robots: merchant.onboarding_completed_at ? undefined : { index: false },
  };
}

export default async function CreatorPage({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const [merchant, { t, locale }, categories] = await Promise.all([loadMerchant(slug), getTranslator(), getTopLevelCategories()]);
  if (!merchant) notFound();
  const demo = isDemoMode();
  const products = productsByCreator(merchant.slug);

  return (
    <div>
      {demo ? <p className="border-b border-dashed border-silver/50 bg-surface px-4 py-2 text-center text-[13px]">{t("demo.banner")}</p> : null}
      {!merchant.onboarding_completed_at ? (
        <p className="border-b border-line bg-surface px-4 py-2 text-center text-[13px]">{t("storefront.notPublicYet")}</p>
      ) : null}
      <main className="mx-auto max-w-[1320px] px-4 py-6 md:px-6 md:py-10">
        <CreatorProfile
          demo={demo}
          data={{
            storeName: merchant.store_name,
            slug: merchant.slug,
            tagline: merchant.tagline,
            bio: merchant.bio,
            avatarUrl: publicMediaUrl(merchant.avatar_path),
            bannerUrl: publicMediaUrl(merchant.banner_path),
            specialties: merchant.specialties
              .map((id) => categories.find((c) => c.id === id))
              .filter((c) => c !== undefined)
              .map((c) => ({ id: c.id, label: categoryName(c, locale), icon: c.icon as IconName })),
            socialLinks: sanitizeSocialLinks(merchant.social_links),
            pinnedAnnouncement: merchant.pinned_announcement,
            verificationState: merchant.verification_state,
            joinedAt: merchant.created_at,
          }}
        />
        <section className="mt-12">
          <h2 className="type-section text-cloud">{t("market.creators.productsTitle")}</h2>
          {products.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-[14px] border border-dashed border-line-strong p-8 text-center text-sm text-silver">{t("market.creators.noProducts")}</p>
          )}
        </section>
      </main>
    </div>
  );
}
