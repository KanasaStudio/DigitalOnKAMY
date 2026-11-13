import type { Metadata } from "next";
import type { IconName } from "@/components/icons/icon";
import { PageHeader } from "@/components/studio/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Panel } from "@/components/ui/misc";
import { getTranslator } from "@/i18n/server";
import { getStudioContext } from "@/lib/auth/studio-context";
import { publicMediaUrl } from "@/lib/env";
import { can } from "@/lib/permissions";
import { categoryName, getTopLevelCategories } from "@/lib/reference-data";
import { StorefrontEditorClient } from "./storefront-client";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("storefront.title") };
}

export default async function StorefrontPage() {
  const [ctx, { t, locale }, categories] = await Promise.all([getStudioContext(), getTranslator(), getTopLevelCategories()]);
  const merchant = ctx.merchant;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t("storefront.title")} description={t("storefront.body")} />
      {!merchant ? (
        <Panel>
          <EmptyState
            icon="store"
            title={t("onboarding.title")}
            body={t("onboarding.intro")}
            action={
              <ButtonLink href="/studio/onboarding" iconRight="arrowRight">
                {t("common.continue")}
              </ButtonLink>
            }
          />
        </Panel>
      ) : (
        <StorefrontEditorClient
          demo={ctx.demo}
          canEdit={can(ctx.role, "editStorefront")}
          merchantId={merchant.id}
          slug={merchant.slug}
          verificationState={merchant.verification_state}
          joinedAt={merchant.created_at}
          isPublic={Boolean(merchant.onboarding_completed_at)}
          initial={{
            storeName: merchant.store_name,
            tagline: merchant.tagline,
            bio: merchant.bio,
            pinnedAnnouncement: merchant.pinned_announcement,
            specialties: merchant.specialties,
            socialLinks: merchant.social_links,
          }}
          avatarUrl={publicMediaUrl(merchant.avatar_path)}
          bannerUrl={publicMediaUrl(merchant.banner_path)}
          categories={categories.map((c) => ({ id: c.id, label: categoryName(c, locale), icon: c.icon as IconName }))}
        />
      )}
    </div>
  );
}
