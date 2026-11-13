import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { PLANNED_SECTIONS, ALL_NAV_ITEMS, type PlannedSection } from "@/components/studio/nav";
import { PageHeader } from "@/components/studio/page-header";
import { Panel } from "@/components/ui/misc";
import { getMessages } from "@/i18n/core";
import { getTranslator } from "@/i18n/server";
import { getStudioContext } from "@/lib/auth/studio-context";

function isPlanned(value: string): value is PlannedSection {
  return (PLANNED_SECTIONS as readonly string[]).includes(value);
}

export async function generateMetadata({ params }: PageProps<"/studio/[section]">): Promise<Metadata> {
  const { section } = await params;
  if (!isPlanned(section)) return {};
  const { locale } = await getTranslator();
  return { title: getMessages(locale).comingSoon.sections[section].title };
}

/**
 * Routes that exist in the navigation but are built in later phases. They explain
 * honestly what will live here instead of showing empty charts or fake numbers.
 */
export default async function PlannedSectionPage({ params }: PageProps<"/studio/[section]">) {
  const { section } = await params;
  if (!isPlanned(section)) notFound();
  await getStudioContext();
  const { t, locale } = await getTranslator();
  const copy = getMessages(locale).comingSoon.sections[section];
  const icon = ALL_NAV_ITEMS.find((item) => item.id === section)?.icon ?? "info";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={copy.title}
        eyebrow={<span className="label-mono">{t("comingSoon.badge", { phase: copy.phase })}</span>}
      />
      <Panel className="flex flex-col gap-5 p-6">
        <span className="flex size-11 items-center justify-center rounded-[12px] border border-line bg-obsidian text-silver">
          <Icon name={icon} size={22} />
        </span>
        <p className="text-[15px] leading-relaxed text-silver">{t("comingSoon.body", { phase: copy.phase })}</p>
        <ul className="flex flex-col gap-2.5">
          {copy.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-cloud">
              <Icon name="chevronRight" size={16} className="mt-0.5 text-silver" />
              {item}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
