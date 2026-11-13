import { CreatorCard } from "@/components/market/creator-card";
import { Container } from "@/components/market/section";
import { StagingTag } from "@/components/market/staging";
import { getTranslator } from "@/i18n/server";
import { CREATORS } from "@/lib/market/catalog";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("market.creators.title") };
}

export default async function CreatorsPage() {
  const { t, locale } = await getTranslator();
  return (
    <Container className="pt-8">
      <StagingTag>{t("market.staging.label")}</StagingTag>
      <h1 className="mt-3 type-page text-cloud">{t("market.creators.title")}</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] text-silver">{t("market.creators.body")}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CREATORS.map((c) => (
          <CreatorCard key={c.slug} creator={c} t={t} locale={locale} />
        ))}
      </div>
    </Container>
  );
}
