import type { Metadata } from "next";
import type { IconName } from "@/components/icons/icon";
import { PageHeader } from "@/components/studio/page-header";
import { getTranslator } from "@/i18n/server";
import { getStudioContext } from "@/lib/auth/studio-context";
import { can } from "@/lib/permissions";
import { categoryName, getCurrentPolicies, getTopLevelCategories, type PolicyDocument } from "@/lib/reference-data";
import type { OnboardingPolicy } from "./onboarding-flow";
import { OnboardingFlowClient } from "./onboarding-client";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("onboarding.title") };
}

export default async function OnboardingPage({ searchParams }: PageProps<"/studio/onboarding">) {
  const [ctx, { t, locale }, categories, policies, params] = await Promise.all([
    getStudioContext(),
    getTranslator(),
    getTopLevelCategories(),
    getCurrentPolicies(),
    searchParams,
  ]);

  const toPolicy = (doc: PolicyDocument | null, acceptedAt: string | null): OnboardingPolicy =>
    doc
      ? {
          id: doc.id,
          version: doc.version,
          title: locale === "en" ? doc.title_en : doc.title_id,
          summary: locale === "en" ? doc.summary_en : doc.summary_id,
          body: locale === "en" ? doc.body_en : doc.body_id,
          acceptedAt,
        }
      : null;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t("onboarding.title")} description={t("onboarding.intro")} />
      <OnboardingFlowClient
        demo={ctx.demo}
        merchant={ctx.merchant ? { id: ctx.merchant.id, type: ctx.merchant.type, storeName: ctx.merchant.store_name, slug: ctx.merchant.slug } : null}
        canAccept={ctx.merchant ? can(ctx.role, "acceptPolicies") : false}
        categories={categories.map((c) => ({ id: c.id, label: categoryName(c, locale), icon: c.icon as IconName }))}
        seller={toPolicy(policies.seller, ctx.policies.seller.acceptedAt)}
        ownership={toPolicy(policies.ownership, ctx.policies.ownership.acceptedAt)}
        initialStep={typeof params.step === "string" ? params.step : null}
      />
    </div>
  );
}
