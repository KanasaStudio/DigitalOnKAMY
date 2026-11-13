import { cookies } from "next/headers";
import { StudioShell } from "@/components/studio/shell";
import { getStudioContext } from "@/lib/auth/studio-context";
import { publicMediaUrl } from "@/lib/env";

export const metadata = { robots: { index: false, follow: false } };

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const ctx = await getStudioContext();
  const collapsed = (await cookies()).get("kamy_rail")?.value === "collapsed";
  const merchant = ctx.merchant;
  return (
    <StudioShell
      storeName={merchant?.store_name ?? null}
      avatarUrl={publicMediaUrl(merchant?.avatar_path)}
      userName={ctx.user.displayName}
      demo={ctx.demo}
      initialCollapsed={collapsed}
      publicHref={merchant?.onboarding_completed_at && !ctx.demo ? `/c/${merchant.slug}` : null}
    >
      {children}
    </StudioShell>
  );
}
