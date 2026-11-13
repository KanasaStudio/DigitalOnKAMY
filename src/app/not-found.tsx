import { ButtonLink } from "@/components/ui/button";
import { getTranslator } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslator();
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center gap-4 px-6">
      <p className="label-mono">404</p>
      <h1 className="text-3xl font-extrabold tracking-tight">{t("errors.notFoundTitle")}</h1>
      <p className="text-silver">{t("errors.notFoundBody")}</p>
      <ButtonLink href="/studio/overview" variant="secondary" icon="arrowLeft">
        {t("errors.goToStudio")}
      </ButtonLink>
    </main>
  );
}
