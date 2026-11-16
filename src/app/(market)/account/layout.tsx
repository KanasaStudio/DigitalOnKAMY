import { AccountNav } from "@/components/account/account-nav";
import { Container } from "@/components/market/section";
import { DemoLabel } from "@/components/ui/misc";
import { getTranslator } from "@/i18n/server";
import { requireViewer } from "@/lib/auth/account-context";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const [viewer, { t }] = await Promise.all([requireViewer("/account"), getTranslator()]);
  return (
    <Container className="pb-16 pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="type-page text-cloud">{t("account.title")}</h1>
        {viewer.demo ? <DemoLabel>{t("demo.label")}</DemoLabel> : null}
      </div>
      {viewer.demo ? <p className="mt-2 text-sm text-silver">{t("account.demoNote")}</p> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <AccountNav showAdmin={viewer.adminRole !== null && !viewer.demo} />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
