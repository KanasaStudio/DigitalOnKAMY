import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog, type CatalogPreset } from "@/components/market/catalog";
import { getTranslator } from "@/i18n/server";

const KINDS = ["featured", "new", "popular", "discounts"] as const;
type Kind = (typeof KINDS)[number];

export const dynamicParams = false;
export function generateStaticParams() {
  return KINDS.map((kind) => ({ kind }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[kind]">) {
  const { kind } = await params;
  const { t } = await getTranslator();
  return KINDS.includes(kind as Kind) ? { title: t(`market.catalog.collections.${kind as Kind}`) } : {};
}

export default async function CollectionPage({ params }: PageProps<"/collections/[kind]">) {
  const { kind } = await params;
  if (!KINDS.includes(kind as Kind)) notFound();
  const { t } = await getTranslator();
  const k = kind as Kind;
  const presets: Record<Kind, CatalogPreset> = {
    featured: { sort: "rating", icon: "sparkle" },
    new: { newOnly: true, sort: "newest", icon: "zap" },
    popular: { sort: "best-selling", icon: "trending" },
    discounts: { discount: true, sort: "best-selling", icon: "tag" },
  };
  return (
    <Suspense>
      <Catalog preset={{ ...presets[k], title: t(`market.catalog.collections.${k}`) }} />
    </Suspense>
  );
}
