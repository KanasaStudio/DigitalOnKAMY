"use client";

import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { VerificationBadge, type VerificationState } from "@/components/ui/status-badge";
import { useI18n } from "@/i18n/client";
import { formatDate } from "@/i18n/format";
import { isSafeHttpsUrl, SOCIAL_KEYS, type SocialKey, type SocialLinks } from "@/lib/validation/merchant";

export type CreatorProfileData = {
  storeName: string;
  slug: string;
  tagline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  specialties: { id: string; label: string; icon: IconName }[];
  socialLinks: SocialLinks;
  pinnedAnnouncement: string | null;
  verificationState: VerificationState;
  joinedAt: string;
};

const SOCIAL_ICON: Record<SocialKey, IconName> = {
  website: "globe",
  instagram: "instagram",
  tiktok: "tiktok",
  youtube: "youtube",
  x: "x",
  discord: "discord",
  github: "github",
  facebook: "facebook",
};

function displayHost(url: string) {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, "") + (u.pathname !== "/" ? u.pathname : "")).slice(0, 48);
  } catch {
    return url;
  }
}

/**
 * The public creator page. The Studio's storefront editor renders this exact component
 * as its live preview, so what the merchant sees is what buyers get. Layout responds to
 * its container (not the viewport) so the preview pane matches a real narrow screen.
 * All user text is rendered as text nodes; links are re-validated as https at render time.
 */
export function CreatorProfile({ data, demo, preview = false }: { data: CreatorProfileData; demo: boolean; preview?: boolean }) {
  const { t, locale } = useI18n();
  const links = SOCIAL_KEYS.filter((k) => data.socialLinks[k] && isSafeHttpsUrl(data.socialLinks[k]!));
  const Heading = preview ? "p" : "h1";

  return (
    <article className="@container w-full text-cloud" aria-label={preview ? t("common.preview") : undefined}>
      <div className="relative">
        <div className="aspect-[4/1] w-full overflow-hidden rounded-[16px] border border-line bg-graphite">
          {data.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- public storage image, fixed aspect container
            <img src={data.bannerUrl} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="absolute -bottom-9 left-4 rounded-full border-4 border-obsidian @2xl:-bottom-12 @2xl:left-6">
          <Avatar src={data.avatarUrl} name={data.storeName} size={72} className="@2xl:!size-24 @2xl:!text-3xl" />
        </div>
      </div>

      <header className="mt-12 flex flex-col gap-2 px-1 @2xl:mt-16 @2xl:px-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Heading className="text-2xl font-extrabold tracking-[-0.02em] @2xl:text-3xl">{data.storeName || "—"}</Heading>
          <VerificationBadge state={data.verificationState} demo={demo} />
        </div>
        <p className="font-mono text-xs text-silver">kamy.id/c/{data.slug}</p>
        {data.tagline ? <p className="max-w-2xl text-[15px] leading-relaxed text-silver @2xl:text-base">{data.tagline}</p> : null}
      </header>

      {data.pinnedAnnouncement ? (
        <p className="mx-1 mt-5 flex items-start gap-2.5 rounded-[12px] border border-line-strong bg-surface px-4 py-3 text-sm leading-snug @2xl:mx-2">
          <Icon name="announcement" size={18} className="mt-px shrink-0 text-silver" />
          <span>{data.pinnedAnnouncement}</span>
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 px-1 @2xl:grid-cols-[minmax(0,1fr)_240px] @2xl:px-2">
        <div className="flex min-w-0 flex-col gap-8">
          {data.bio ? <p className="whitespace-pre-line text-[15px] leading-relaxed text-cloud/90">{data.bio}</p> : null}
          <section className="flex flex-col gap-3">
            <p className="label-mono">{t("creator.products")}</p>
            <div className="rounded-[16px] border border-line bg-surface">
              <EmptyState icon="package" title={t("creator.products")} body={t("creator.noProducts", { store: data.storeName || "—" })} />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          {data.specialties.length ? (
            <section className="flex flex-col gap-2.5">
              <p className="label-mono">{t("creator.specialties")}</p>
              <ul className="flex flex-wrap gap-2">
                {data.specialties.map((s) => (
                  <li key={s.id} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[13px] font-semibold">
                    <Icon name={s.icon} size={15} className="text-silver" />
                    {s.label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {links.length ? (
            <section className="flex flex-col gap-2.5">
              <p className="label-mono">{t("creator.links")}</p>
              <ul className="flex flex-col gap-1">
                {links.map((key) => (
                  <li key={key}>
                    <a
                      href={data.socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer nofollow ugc"
                      className={cn("flex items-center gap-2.5 rounded-[8px] py-1.5 text-sm text-cloud hover:text-mint", preview && "pointer-events-none")}
                      tabIndex={preview ? -1 : undefined}
                    >
                      <Icon name={SOCIAL_ICON[key]} size={16} className="text-silver" />
                      <span className="truncate">{displayHost(data.socialLinks[key]!)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="flex items-center gap-2 text-[13px] text-silver">
            <Icon name="calendar" size={15} />
            {t("creator.joined", { date: formatDate(data.joinedAt, locale) })}
          </p>
        </aside>
      </div>
    </article>
  );
}
