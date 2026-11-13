import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { IconName } from "@/components/icons/icon";
import { Catalog } from "@/components/market/catalog";
import { getTranslator } from "@/i18n/server";
import { getCategory, topCategories } from "@/lib/market/catalog";

export const dynamicParams = false;
export function generateStaticParams() {
  return topCategories().map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const { locale } = await getTranslator();
  const c = getCategory(slug);
  return c ? { title: locale === "en" ? c.name.en : c.name.id } : {};
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const { locale } = await getTranslator();
  const c = getCategory(slug);
  if (!c || c.parentId) notFound();
  return (
    <Suspense>
      <Catalog
        preset={{
          category: c.id,
          title: locale === "en" ? c.name.en : c.name.id,
          description: c.description ? (locale === "en" ? c.description.en : c.description.id) : undefined,
          eyebrow: c.code,
          icon: c.icon as IconName,
        }}
      />
    </Suspense>
  );
}
