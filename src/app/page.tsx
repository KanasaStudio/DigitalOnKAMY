import { KamyLockup } from "@/components/brand/logo";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { getMessages } from "@/i18n/core";
import { getTranslator } from "@/i18n/server";
import { isDemoMode } from "@/lib/env";

export default async function Home() {
  const { t, locale } = await getTranslator();
  const points = getMessages(locale).landing.points;
  const demo = isDemoMode();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-8 md:px-10">
      <header className="flex items-center justify-between">
        <span className="label-mono">{t("common.initiative")}</span>
        {!demo ? (
          <ButtonLink href="/sign-in" variant="ghost" size="sm" icon="signIn">
            {t("landing.signIn")}
          </ButtonLink>
        ) : null}
      </header>

      <section className="flex flex-1 flex-col justify-center gap-12 py-16 md:py-24">
        <KamyLockup width={340} className="h-auto w-[240px] md:w-[340px]" />
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] text-cloud md:text-[56px]">{t("landing.heading")}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-silver">{t("landing.body")}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={demo ? "/studio/overview" : "/sign-up"} size="lg" iconRight="arrowRight">
              {demo ? t("landing.openStudio") : t("landing.createAccount")}
            </ButtonLink>
            {!demo ? (
              <ButtonLink href="/sign-in" size="lg" variant="secondary">
                {t("landing.signIn")}
              </ButtonLink>
            ) : null}
          </div>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-[16px] border border-line bg-line md:grid-cols-3">
          {points.map((point, index) => (
            <li key={point} className="flex flex-col gap-3 bg-obsidian p-5">
              <span className="font-mono text-xs text-silver">0{index + 1}</span>
              <p className="text-[15px] font-semibold leading-snug text-cloud">{point}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex items-center gap-2 border-t border-line pt-6 text-[13px] text-silver">
        <Icon name="globe" size={16} />
        {t("common.brandTagline")}
      </footer>
    </main>
  );
}
