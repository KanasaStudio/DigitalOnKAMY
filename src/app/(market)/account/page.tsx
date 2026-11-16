import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/misc";
import { formatDate } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { requireViewer } from "@/lib/auth/account-context";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.profile.title") };
}

export default async function AccountProfilePage() {
  const [viewer, { t, locale }] = await Promise.all([requireViewer("/account"), getTranslator()]);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Panel aria-labelledby="profile-heading">
        <PanelHeader id="profile-heading" title={t("account.profile.title")} description={t("account.profile.body")} />
        {/* Keyed by the saved name so the field resets to the stored value after a save. */}
        <ProfileForm key={viewer.displayName} email={viewer.email} displayName={viewer.displayName} demo={viewer.demo} />
        <p className="border-t border-line px-5 py-4 text-[13px] text-silver">
          {t("account.profile.memberSince")} <span className="tabular text-cloud">{formatDate(viewer.createdAt, locale)}</span>
        </p>
      </Panel>

      <Panel aria-labelledby="session-heading">
        <PanelHeader id="session-heading" title={t("account.profile.session")} description={t("account.profile.sessionBody")} />
        <div className="p-5">
          {viewer.demo ? (
            <p className="text-sm text-silver">{t("demo.writesDisabled")}</p>
          ) : (
            <form action="/auth/sign-out" method="post">
              <Button type="submit" variant="secondary" icon="logOut">
                {t("common.signOut")}
              </Button>
            </form>
          )}
        </div>
      </Panel>
    </div>
  );
}
