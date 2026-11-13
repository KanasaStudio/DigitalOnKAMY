import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { IconName } from "@/components/icons/icon";
import { Catalog } from "@/components/market/catalog";
import { getTranslator } from "@/i18n/server";
import { CATEGORIES, getCategory } from "@/lib/market/catalog";

export const dynamicParams = false;
export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.parentId).map((c) => ({ slug: c.parentId!, sub: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]/[sub]">) {
  const { sub } = await params;
  const { locale } = await getTranslator();
  const c = getCategory(sub);
  return c ? { title: locale === "en" ? c.name.en : c.name.id } : {};
}

export default async function SubcategoryPage({ params }: PageProps<"/category/[slug]/[sub]">) {
  const { slug, sub } = await params;
  const { locale } = await getTranslator();
  const parent = getCategory(slug);
  const c = getCategory(sub);
  if (!parent || !c || c.parentId !== parent.id) notFound();
  const name = (x: typeof c) => (locale === "en" ? x.name.en : x.name.id);
  return (
    <Suspense>
      <Catalog preset={{ category: parent.id, sub: c.id, title: name(c), eyebrow: `${c.code} · ${name(parent)}`, icon: parent.icon as IconName }} />
    </Suspense>
  );
}
