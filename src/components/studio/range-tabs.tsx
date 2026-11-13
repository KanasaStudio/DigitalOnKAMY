"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { useI18n } from "@/i18n/client";
import { RANGES, type Range } from "./ranges";


export function RangeTabs({ value }: { value: Range }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Tabs
      label={t("overview.rangeLabel")}
      value={value}
      onChange={(id) => router.replace(`${pathname}?range=${id}`, { scroll: false })}
      items={RANGES.map((r) => ({ id: r, label: t(`overview.range.${r}`) }))}
    />
  );
}
