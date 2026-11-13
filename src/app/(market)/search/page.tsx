import { Suspense } from "react";
import { Catalog } from "@/components/market/catalog";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("market.nav.search") };
}

export default function SearchPage() {
  return (
    <Suspense>
      <Catalog preset={{ search: true }} />
    </Suspense>
  );
}
